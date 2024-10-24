sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/GroupHeaderListItem",
    "sap/ui/model/Filter",
    "sap/ui/core/routing/History",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/coe/planning/calendar/util/formatter",
    "sap/coe/planning/calendar/util/helpers",
    "sap/ui/core/Fragment",
    "sap/coe/planning/calendar/fragment/SelectServiceOrder.fragment.controller",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/coe/capacity/reuselib/utils/VariantFilterHelper",
    "sap/coe/capacity/reuselib/utils/P13nHelper",
    "sap/coe/planning/calendar/fragment/SortTable.fragment.controller",
    "sap/coe/planning/calendar/util/i18n"
], function(Controller, GroupHeaderListItem, Filter, History, valuehelpdialog, formatter, helpers, Fragment, SelectServiceOrderController, Sorter, JSONModel, VariantHelper, P13nHelper, SortTableController, i18n) {
    "use strict";

    return Controller.extend("sap.coe.planning.calendar.controller.PlanningCalendar", {

        formatter: formatter,

        onInit: function() {
            this.aKeys = ["Demand ID"];
            this._loadItems();
            VariantHelper.setVariantFilterModel(this.getView());
            this._setUtilsModelToView();
            this.bSetFbToDefaultVariant = false;
            this._oOwnerComponent = this.getOwnerComponent();
            //to catch when we refresh "RSP" page
          //  helpers.setShellTitle(this._oOwnerComponent, i18n.getText("SHELL_TITLE_RSP"));

        },

        onAfterRendering: function() {
            this.getOwnerComponent().getRouter().attachRouteMatched(this._onRouteMatched, this);
            this._oP13nModel = this._oOwnerComponent.getModel("P13nTableModel");
            this._onReadTableSortOptionP13nSettings();
            helpers.checkAuthorization("rsp", this.getView(), this._oOwnerComponent);
        },

        //reads the sorting paramaters that are saved (in browsers local storage) and sorts the list
        _onReadTableSortOptionP13nSettings: function() {
            P13nHelper.readData(this._oOwnerComponent._tableSortP13n, function(oSortOptionData) {
                if (oSortOptionData) {
                    var oSorter = new sap.ui.model.Sorter(oSortOptionData.sortItem, oSortOptionData.sortDescending),
                        oMasterListBindings = this.getView().byId("worklistTable").getBinding("items");

                    if (oSortOptionData.sortItem === "Calloffincl") {
                        oSorter.fnCompare = function(value1, value2) {
                        value2 = parseFloat(value2);
                        value1 = parseFloat(value1);
                            if (value1 < value2) return -1;
                               if (value1 === value2) return 0;
                               if (value1 > value2) return 1;
                        };
                    }
                    //to handle when list is empty
                    if(oMasterListBindings !== undefined)
                    {
                        // sorting must be done on client side
                        oMasterListBindings.bClientOperation = true;
                        oMasterListBindings.aAllKeys = true;
                        oMasterListBindings.sOperationMode = "Client";
                        oMasterListBindings.sort(oSorter);
                        oMasterListBindings.bClientOperation = false;
                        oMasterListBindings.aAllKeys = null;
                        oMasterListBindings.sOperationMode = "Server";
                    }

                }
            }.bind(this));
        },
        /**
         * Initialize the table settings fragment and open it when the button is clicked
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        onSortTablePress: function(oEvent) {
            if (!this._oDialogTableSettings) {
                this._oDialogTableSettings = helpers.initializeFragmentFromObject({
                    oParentController: this,
                    sFragment: "sap.coe.planning.calendar.fragment.SortTable",
                    ControllerClass: SortTableController,
                    oModel: this._oP13nModel,
                    sCreateId: this.getView().createId("SortPcTable")
                });}
            this._oDialogTableSettings.open();
        },

        /**
         * Initializes and opens the value help dialog on button click
         *  
         * @public
         * @param {object} oEvent - object which calls the function
         * @returns {void}
         */
        onAddDemands: function(oEvent) {
            if (!this._oValueHelpDialog)
                this._oValueHelpDialog = helpers.initializeFragmentFromObject({
                    oParentController: this,
                    sFragment: "sap.coe.planning.calendar.fragment.SelectServiceOrder",
                    ControllerClass: SelectServiceOrderController,
                    oModel: this.getView().getModel(),
                    sCreateId: this.getView().createId("SelectServiceOrder")
                });

            this._oValueHelpDialog.open();
        },
        /**
         * Sets master list mode to multi select or single select based on the current mode
         * 
         * @public
         * @param {object} oEvent - object which calls the function
         * @returns {void}
         */
        onMultiSelectPress: function(oEvent) {
            var oList = this.byId("worklistTable");
            //to make the button behave the same as semantic control MultiSelectAction
            if (oEvent.getSource().getIcon() === "sap-icon://multi-select") {
                oList.setMode("MultiSelect");
                oEvent.getSource().setIcon("sap-icon://sys-cancel");
            } else {
                oList.setMode("SingleSelectMaster");
                oEvent.getSource().setIcon("sap-icon://multi-select");
            }
                //to stop the button being highlighted blue by the click
                oEvent.getSource().setPressed(false);
        },
        /**
         * When a new selection is made on the list, if the item selected is staffed (staffingLeve != "A")
         * the persons empID who it has been staffed to will be entered into the filterbar and searched so
         * that the calendar will show that person in the calendar
         * If the selected item is not staffed the filter bar variant will be set to default and searched so as to display
         * all results, bSetFbToDefaultVariant is a flag to stop the search when several unstaffed items are selected in a row
         * @public
         * @param {object} oEvent - object which calls the function
         * @returns {void}
         */
        onSelectionChange: function(oEvent) {
            var oList = this.getView().byId("worklistTable"),
                oListItem = oEvent.getParameter("listItem"),
                oDetailController = this.getOwnerComponent().byId("detail").getController(),
                oFilterBar = oDetailController.byId("filterBar"),
                oServiceOrder = this.getView().getModel("MasterListModel").getProperty(oListItem.getBindingContextPath()),
                sStaffingLevel = oServiceOrder.StaffingLevel,
                sEmployeeID = oServiceOrder.EmpID;

            oDetailController.updateStatusHeader(oList.getSelectedItems(), oListItem, oEvent.getParameter("selected"));

            if(oList.getMode() === "SingleSelectMaster" && sStaffingLevel !== "A"){
                oFilterBar.clear();
                var oToken = new sap.m.Token({ key: sEmployeeID, text: sEmployeeID}),
                    oMultiInput = sap.ui.core.Fragment.byId(oDetailController.byId("idForEmpId")._sFragmentId, "id___EmpId");
                oMultiInput.destroyTokens();
                oMultiInput.addToken(oToken);
                this._updateCalendarStartDate(oDetailController, oServiceOrder);
                oFilterBar.search();
                this.bSetFbToDefaultVariant = true;
            }

            else if(oList.getMode() === "SingleSelectMaster" && sStaffingLevel === "A" && this.bSetFbToDefaultVariant){
                var oDefaultVariant = oFilterBar.customVariantManager._getDefaultVariant(),
                    oVariantModel = oFilterBar.getModel("VariantItems"),
                    oMultiInput = sap.ui.core.Fragment.byId(oDetailController.byId("idForEmpId")._sFragmentId, "id___EmpId");
                    oMultiInput.destroyTokens();
                    oVariantModel.setProperty("/Active", oDefaultVariant);
                    oFilterBar.customVariantManager._updateFilterBarFields();
                    this._updateCalendarStartDate(oDetailController, oServiceOrder, true);
                    oFilterBar.search();
                    this.bSetFbToDefaultVariant = false;
            }
        },
        /**
         * Updates the calendar dates, if the boolean parameter is true then the start date
         * is set to the current date, otherwise it is set to the date of the selected service order
         * @public
         * @param {object} oDetailController - object which represents the detail controller
         * @param {object} oServiceOrder - object which represents the service order
         * @param {boolean} bCurrentDate - boolean value to decide what date to set the calendar
         * @returns {void}
         */
        _updateCalendarStartDate: function(oDetailController, oServiceOrder, bIsCurrentDate) {
            var oPlanningCalendar = oDetailController.byId("resourcePlanningCalendarId"),
                sViewKey = oPlanningCalendar._oPlanningCalendar.getViewKey(),
                oView = oPlanningCalendar._getViewByKey(oPlanningCalendar._oPlanningCalendar.getViews(), sViewKey),
                iInterval = oView.getIntervalsM(),
                dDate = bIsCurrentDate ? new Date() : oServiceOrder.AssignmentStartDate,
                dStartDate = oDetailController.byId("resourcePlanningCalendarId").navigateCalendar(dDate, iInterval)[0];
            oPlanningCalendar._oPlanningCalendar.setStartDate(dStartDate);
            oPlanningCalendar._oPlanningCalendar.fireViewChange();
        },

        //sort button for the master list
        onSort: function(oEvent) {
            var oBinding = this._getBindingItemsInList(),
                mParams = oEvent.getParameters(),
                sPath = mParams.selectedItem.getKey(),
                bDescending = mParams.sortDescending;

            this._handleModelOperationsInClient(oBinding, true);
            oBinding.sort(new Sorter(sPath, bDescending));
            this._handleModelOperationsInClient(oBinding, false);
        },

        /**
         * Used to create GroupHeaders with non-capitalized caption.
         * These headers are inserted into the master list to
         * group the master list's items.
         * @param {Object} oGroup group whose text is to be displayed
         * @public
         * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
         */
        createGroupHeader: function(oGroup) {
            return new GroupHeaderListItem({
                title: oGroup.text,
                upperCase: false
            });
        },
        /**
         * Sets the utils model to the view
         * @public
         * @returns {void} 
         */
        _setUtilsModelToView: function() {
            this.getView().setModel(
                new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.coe.capacity.reuselib") + "/model/utilsModel.json"),
                "ReuseModel");
        },
        /**
         * Loads all the items into the master list model when the route is matched, load the items from a model which was populated
         * on navigation from the resource demand list
         * @public
         * @returns {void}
         */
        _loadItems: function() {
            if (this.getOwnerComponent().getModel("worklistSelectedItems").getData() !== undefined && this.getOwnerComponent().getModel("worklistSelectedItems").getData().length > 0) {

                var aSelectedItemsFromWorklist = this.getOwnerComponent().getModel("worklistSelectedItems").getData(),
                    oModelMasterList = { "ResDemandSet": aSelectedItemsFromWorklist },
                    oModel = new JSONModel(oModelMasterList);

                this.getOwnerComponent().setModel(oModel, "MasterListModel");
            } else {
                //Load data with variant filters.
            }
        },
        /**
         * When the route is matched it loads all the items into the master list model when the route is matched, load the items from a model which was populated
         * on navigation from the resource demand list
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        _onRouteMatched: function(oEvent) {
            if (oEvent.getParameter("name") === "planningCalendar") {
                this._loadItems();
            }
            helpers.setShellTitle(this._oOwnerComponent, i18n.getText("SHELL_TITLE_RSP"));


        },
        onUpdateFinished: function(oEvent) {
            var oList = this.getView().byId("worklistTable");
                oList.setSelectedItem(oList.getItems()[0]);
                //table is updated not by sorting
            if (oEvent.getParameter("reason") !== "Sort") {
                this._onReadTableSortOptionP13nSettings();
                
            }
        },

        _handleModelOperationsInClient: function(oDataModel, bPerformInClient) {
            if (bPerformInClient) {
                oDataModel.bClientOperation = true;
                oDataModel.aAllKeys = true;
            } else {
                oDataModel.bClientOperation = false;
                oDataModel.aAllKeys = null;
            }
        },
        /**
         *
         * Gets the items binding of the list
         * @public
         * @returns {object} - object which represents the items binding of the list
         */
        _getBindingItemsInList: function() {
            var oView = this.getView(),
                oList = oView.byId("worklistTable"),
                oBinding = oList.getBinding("items");

            return oBinding;
        }

    });

});
