sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Token",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ushell/services/CrossApplicationNavigation",
    "sap/coe/planning/calendar/util/formatter",
    "sap/coe/capacity/reuselib/utils/formatter",
    "sap/coe/planning/calendar/util/i18n",
    "sap/ui/core/Fragment",
    "sap/coe/planning/calendar/fragment/ActionSheet.fragment.controller",
    "sap/coe/planning/calendar/fragment/AssignWorklistDemand.fragment.controller",
    "sap/coe/planning/calendar/fragment/SortTable.fragment.controller",
    "sap/coe/planning/calendar/fragment/DateRangeSettings.fragment.controller",
    "sap/coe/planning/calendar/fragment/TableP13nDialog.fragment.controller",
    "sap/coe/planning/calendar/util/helpers",
    "sap/coe/capacity/reuselib/utils/P13nHelper",
    "sap/coe/capacity/reuselib/utils/DataManager",
    "sap/coe/capacity/reuselib/utils/ErrorCodeHelper",
    "sap/coe/capacity/reuselib/utils/TokenHelper",
	"sap/coe/capacity/reuselib/controls/ResourcePlanningCalendar/ResourcePlanningCalendarComponent",
    "sap/coe/capacity/reuselib/utils/i18n",
    "sap/ui/model/Filter"
], function(Controller, Token, JSONModel, MessageBox, oCrossAppNavigator, formatter, formatterReuse, i18n, Fragment, ActionSheetController, AssignWorklistDemandController,
    SortTableController, DateRangeSettings, TableP13n, helpers, P13nHelper, DataManager, ErrorCodeHelper, TokenHelper, ResourcePlanningCalendarComponent, Filter) {

    "use strict";

    return Controller.extend("sap.coe.planning.calendar.controller.Worklist", {
        formatter: formatter,
        formatterReuse: formatterReuse,

        onInit: function() {
            //  var startupParams = this.getOwnerComponent().getComponentData().startupParameters,
            //      oFilterBarComponent;
                var oOwnerComponentData = this.getOwnerComponent().getComponentData();
                if(oOwnerComponentData){
                    var startupParams = oOwnerComponentData.startupParameters;
                }
                var oFilterBarComponent;

            this._oView = this.getView();
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            this._oView.setModel(new JSONModel(), "BusyModel");
            this._setUtilsModelToView();
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.attachRouteMatched(this.handleRouteMatched, this);
            this._oOwnerComponent = this.getOwnerComponent();
                
                if(startupParams){
                    if (startupParams.DemandServiceTeam) { //Mandatory filter from cross navigation -> Not to prefil default filters in other scenarios
                        oFilterBarComponent = this.byId("ServiceDemandFilterBar");
                        oFilterBarComponent.prefilFilters(startupParams);
                    }
                }            

            // call the personlisation service for custom date range and table settings
            this._onReadDynamicDateP13nSettings();
            this._onReadTableP13nSettings();
        },

        onAfterRendering: function() {
            // add change event for the table when filtering is applied
            this.bWarningCreated = false;
            var that = this,
                oModel = this.getView().byId("worklistTable").getModel();

            oModel.setSizeLimit(500);

            oModel.attachRequestFailed(function(oEvent) {
                var sWarnings = oEvent.getParameters("response").response.messages,
                    sServiceErrorURL = oEvent.getParameters("response").url;

                if (sServiceErrorURL !== "https" + "://pgtmain.wdf.sap.corp/sap/opu/odata/sap/ZS_RPA_GATEWAY_SRV/AssignmentList"){
                    if ((sWarnings) && (that.bWarningCreated === false)/* && (this.bShowSearchError)*/) {
                        that.bWarningCreated = true;
                        var sMessage = i18n.getText("VIEW_WORKLIST_WARNING_MSG") + "\n\ ";
                            sMessage += i18n.getText("VIEW_WORKLIST_WARNING_TICKETINFO");
                        var oMessage = sap.m.MessageBox.warning(sMessage, {
                                title: i18n.getText("VIEW_WORKLIST_WARNING_HEADER"),
                                onClose: that.closeWarning.bind(that),
                                styleClass: "",
                                initialFocus: null,
                                textDirection: sap.ui.core.TextDirection.Inherit
                            });
                        return oMessage;
                    }
                }
            });
            this._onReadTableSortOptionP13nSettings();
            helpers.checkAuthorization("rdl", this.getView(), this._oOwnerComponent);
        },

        /**
         * Checks the table when the binding has been updated and re-sort the table (if necessary)
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        updateTableSorting : function(oEvent) {
            // sort the table when reason is "Refresh" or "Filter", otherwise table will loop and keep sorting itself
            if (oEvent.getParameter("reason") !== "Sort") {
                var that = this,
                    aTableSorters = that.getView().byId("worklistTable").getBinding("items").aSorters,
                    aTableItems = that.getView().byId("worklistTable").getAggregation("items");

                if (aTableSorters.length > 0) {
                    var oSorter = new sap.ui.model.Sorter(aTableSorters[0].sPath, aTableSorters[0].bDescending),
                        oDataModel = that.getView().byId("worklistTable").getBinding("items");

                    if (aTableSorters[0].sPath === "Calloffincl") {
                        oSorter.fnCompare = function(value1, value2) {
                        value2 = parseFloat(value2);
                        value1 = parseFloat(value1);
                            if (value1 < value2) return -1;
                               if (value1 === value2) return 0;
                               if (value1 > value2) return 1;
                        };
                    }

                    // sorting must be done on client side
                    oDataModel.bClientOperation = true;
                    oDataModel.aAllKeys = true;
                    oDataModel.sOperationMode = "Client";
                    oDataModel.sort(oSorter);
                    oDataModel.bClientOperation = false;
                    oDataModel.aAllKeys = null;
                    oDataModel.sOperationMode = "Server";
                }

            // clear out previously selected line items
            this.byId("numDemands").setText(i18n.getText("VIEW_WORKLIST_TABLE_TITLE") + " (" + aTableItems.length + ")");
            this.getView().byId("worklistTable").removeSelections(true);
            }
            else if (oEvent.getParameter("reason") === "Sort") {
                // remove entries made for staffing, when table is re-sorted resources will be assigned to the wrong SO's
                var oTable = this.getView().byId("worklistTable"),
                    iAssignColumn = this.byId("assignResCol").getInitialOrder(),
                    aTableItems = oTable.getAggregation("items");

                for (var i = 0; i < aTableItems.length; i++) {
                    // Getting sap.m.MultiInput from EmployeeSelect column position in HBox
                    var oRowEmpInput = aTableItems[i].getCells()[iAssignColumn].getItems()[0].getFragment();
                    // Check if assignment input is visible and contains a value
                    if (oRowEmpInput.getVisible() && oRowEmpInput.getValue()) {
                        oRowEmpInput.setValue("");
                    }
                }
            }
        },

        /**
         * When the route is matched check if any SO has been assigned (on the calendar), if so refresh bindings and remove the selections
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        handleRouteMatched : function (oEvent) {
            if(this.getView().getModel("worklistSelectedItems").getProperty("/soAssigned") === true)
            {
                var oWorklistTable = this.getView().byId("worklistTable");
                oWorklistTable.getBinding("items").refresh();
                oWorklistTable.removeSelections(true);
            }
           // helpers.setShellTitle(this._oOwnerComponent, i18n.getText("SHELL_TITLE_RDL"));

            var urlParamSoNum = oEvent.getParameter("arguments").SoNum;
            if (!isNaN(urlParamSoNum) && (typeof urlParamSoNum === "number" || typeof urlParamSoNum === "string")){ //if an SO num has been provided in the url, must be a number!
                var oVariantFilterModel = this.byId("ServiceDemandFilterBar").getModel("VariantFilterModel");
                //we bypass variants if url is provided (customVarManager) so we must set SO and cancellation status here
                TokenHelper._addToken(oVariantFilterModel.getProperty("/"), urlParamSoNum, urlParamSoNum, "DemandID", true);
                oVariantFilterModel.setProperty("/CancellationStatus", "02");
            }
        },

        closeWarning: function() {
            this.bWarningCreated = false;
        },

        /**
         * Reads the personalisation service for the users custom date range
         * @public
         * @returns {void}
         */
        _onReadDynamicDateP13nSettings: function() {
            // Read dynamic date range
            P13nHelper.readData(this._oOwnerComponent._oDynamicDateRangeP13n, function(oPersData) {
                if (oPersData) {
                    this._setDateRangePers(oPersData);
                    var aDateRange = helpers.getDateRangeForNumberOfWeeks(new Date(), oPersData.pastDateRange, oPersData.futureDateRange);
                    this.byId("ServiceDemandFilterBar").byId("idForStartEndDate").setDateValue(aDateRange[0]);
                    this.byId("ServiceDemandFilterBar").byId("idForStartEndDate").setSecondDateValue(aDateRange[1]);
                }
                // use default settings of -1, +5 weeks
                else {
                    this._setDateRangePers({pastDateRange: "1", futureDateRange: "5"});
                    var aDateRange = helpers.getDateRangeForNumberOfWeeks(new Date(), 5, 1);
                    this.byId("ServiceDemandFilterBar").byId("idForStartEndDate").setDateValue(aDateRange[0]);
                    this.byId("ServiceDemandFilterBar").byId("idForStartEndDate").setSecondDateValue(aDateRange[1]);
                }
            }.bind(this));
        },

        _onReadTableSortOptionP13nSettings: function() {
            P13nHelper.readData(this._oOwnerComponent._tableSortP13n, function(oSortOptionData) {
                if (oSortOptionData) {
                    var oSorter = new sap.ui.model.Sorter(oSortOptionData.sortItem, oSortOptionData.sortDescending),
                        oDataModel = this.getView().byId("worklistTable").getBinding("items");

                    if (oSortOptionData.sortItem === "Calloffincl") {
                        oSorter.fnCompare = function(value1, value2) {
                        value2 = parseFloat(value2);
                        value1 = parseFloat(value1);
                            if (value1 < value2) return -1;
                               if (value1 === value2) return 0;
                               if (value1 > value2) return 1;
                        };
                    }

                    // sorting must be done on client side
                    oDataModel.bClientOperation = true;
                    oDataModel.aAllKeys = true;
                    oDataModel.sOperationMode = "Client";
                    oDataModel.sort(oSorter);
                    oDataModel.bClientOperation = false;
                    oDataModel.aAllKeys = null;
                    oDataModel.sOperationMode = "Server";
                }
            }.bind(this));
        },

        /**
         * Reads the personalisation service for table personalisation settings
         * @public
         * @returns {void}
         */
        _onReadTableP13nSettings: function() {
            // Retrieve client model to be populated with table settings p13n data
            this._oP13nModel = this._oOwnerComponent.getModel("P13nTableModel");
            // Call read data for table settings personaliser
            P13nHelper.readData(this._oOwnerComponent._tableP13n, function(oPersData) {
                var aDefaultCols = P13nHelper.getDefaultColumnLayout(),
                    oData = oPersData,
                    oColData = [],
                    oNewCols = [];

                if (!Array.isArray(oData) && oData !== undefined) {
                    for (var i = 0; i < aDefaultCols.length; i++) {
                        if (oData[aDefaultCols[i].id]) {
                            aDefaultCols[i].visible = oData[aDefaultCols[i].id].visible;
                            aDefaultCols[i].index = oData[aDefaultCols[i].id].index;
                            oColData.splice(aDefaultCols[i].index, 0, aDefaultCols[i]);
                        } else {
                            oNewCols.push(aDefaultCols[i]);
                        }
                    }

                    // sort the data and re-number the indexes in case of gaps (from removed columns)
                    oColData.sort(function(oFirstObject, oSecondObject) {
                        return oFirstObject.index - oSecondObject.index;
                    });

                    for (var k = 0; k < oColData.length; k++) {
                        if(oColData[k].index !== k) {
                            oColData[k].index = k;
                        }
                    }

                    // add the new default columns at the end and set index accordingly
                    for (var l = 0; l < oNewCols.length; l++) {
                        oNewCols[l].index = oColData.length;
                        oColData.push(oNewCols[l]);
                    }
                }
                else {
                    oColData = aDefaultCols;
                }

                this._setColumnSettingsPers(oColData);
                this._oP13nModel.setProperty("/Columns", oColData);
                // Call function in P13n helper to apply table personalisations
                P13nHelper.updateColumns(this.getView(), oColData);

            }.bind(this),
            function(oPersData) {
                // if read fails use default column data
                var oData = P13nHelper.getDefaultColumnLayout();
                this._setColumnSettingsPers(oData);
                this._oP13nModel.setProperty("/Columns", oData);
                // Call function in P13n helper to apply table personalisations
                P13nHelper.updateColumns(this.getView(), oData);
            }.bind(this));
        },

        /**
         * Gets the values of the past/future custom date range
         * @public
         * @returns {Array} - an array containing the past and future custom date range
         */
        _getDateRangePers: function() {
            return [this.oDateRangePast, this.oDateRangeFuture];
        },

        /**
         * Sets the values of the past/future custom date range
         * @param {Object} oPersData - the past and future custom date range returned from the personalisation service
         * @public
         * @returns {void}
         */
        _setDateRangePers: function(oPersData) {
            this.oDateRangePast = oPersData.pastDateRange;
            this.oDateRangeFuture = oPersData.futureDateRange;
        },

        /**
         * Gets the values of the past/future custom date range
         * @public
         * @returns {Array} - an array containing the past and future custom date range
         */
        _getColumnSettingsPers: function() {
            return this.aColumnSettingsData;
        },

        /**
         * Sets the values of the past/future custom date range
         * @param {Object} oPersData - the past and future custom date range returned from the personalisation service
         * @public
         * @returns {void}
         */
        _setColumnSettingsPers: function(aColumnSettings) {
            this.aColumnSettingsData = aColumnSettings;
        },

        /**
         * Updates the table columns
         * @param {Object} oColumnData - the column data to be used on update
         * @public
         * @returns {void}
         */
        _refreshColumnData: function(oColumnData) {
            P13nHelper.updateColumns(this.getView(), oColumnData);
        },

        /**
         * Initialize the action sheet and open it when the button is clicked
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        onActionSheetPress: function(oEvent) {
            var oActionButton = oEvent.getSource();

            if (!this._actionSheet) {
                this._actionSheet = helpers.initializeFragment(this, "sap.coe.planning.calendar.fragment.ActionSheet", ActionSheetController);
            }
            this._actionSheet.openBy(oActionButton);
        },
        /**
         * Initialize the service demand details fragment and open it when the link is clicked
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        onDemandIDLink: function(oEvent) {
            var oModel = oEvent.getSource().getBindingContext(),
                oData = oModel.getProperty(oModel.sPath),
                sBaseURL = this.getView().getModel("praUserContext").getProperty("/BaseURLCRM"),
                sLinkPrefixToCRMItem = sBaseURL + "sap(bD1lbiZjPTAwMSZkPW1pbg==)/bc/bsp/sap/crm_ui_start/default.htm?saprole=ZSU_DEFAULT&sap-client=001&sap-language=EN&crm-object-type=ZSU_TBUI4&crm-object-action=B&crm-object-value=";

            window.open(oData.GSDOUrl);
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
                    sCreateId: this.getView().createId("SortTable")
                });}
            this._oDialogTableSettings.open();
        },

        /**
         * Add one day to days with timestamp equals to zero.
         * The calendar of the datepicker is not displayed for this case
         *  
         * @public
         * @param {date} dDate the date
         * @returns {date} dDate
         */
        _convertZeroTimestamp: function(dDate) {
            if (dDate.getTime() <= 86340059) {
                dDate.setTime(86400000);
            }
            return dDate;
        },

        /**
         * Saves the new assignments created in the worklist table
         * @function
         * @public
         * @returns {void}
         */
        onAssignItems: function() {
            var oTable = this.getView().byId("worklistTable"),
                iAssignColumn = this.byId("assignResCol").getInitialOrder(),
                aTableItems = oTable.getAggregation("items"),
                aDemandsToStaff = [],
                that = this;

            for (var i = 0; i < aTableItems.length; i++) {
                // Getting sap.m.MultiInput from EmployeeSelect column position in HBox
                var oRowEmpInput = aTableItems[i].getCells()[iAssignColumn].getItems()[0].getFragment();
                // Check if assignment input is visible and contains a value
                if (oRowEmpInput.getVisible() && oRowEmpInput.getValue()) {
                    var oAssignment = that.getView().getModel().getProperty(aTableItems[i].getBindingContextPath());

                    oAssignment.BegDate = oAssignment.StartDate;
                    oAssignment.EndDate = oAssignment.EndDate;
                    oAssignment.StartTime = this._convertZeroTimestamp(oAssignment.StartDate);
                    oAssignment.EndTime = this._convertZeroTimestamp(oAssignment.EndDate);
                    oAssignment.CallOff = oAssignment.Calloffincl;
                    oAssignment.QualificationTxt = oAssignment.FirstQualificationDescription;
                    oAssignment.Duration = oAssignment.Duration;
                    // Retrieve employee values for input model
                    oAssignment.FullName = oRowEmpInput.getModel("inputModel").getProperty("/fullName");
                    oAssignment.Employee = oRowEmpInput.getModel("inputModel").getProperty("/empId");
                    oAssignment.ResGuid = oRowEmpInput.getModel("inputModel").getProperty("/resGuid");
                    oAssignment.BindingContext = aTableItems[i].getBindingContextPath();
                    aDemandsToStaff.push(oAssignment);
                }
            }

            if (aDemandsToStaff.length > 0) {
                var mWorklistItems = new JSONModel(aDemandsToStaff);
                if (this.getView().getModel("WorklistDemandsToStaff")) {
                    this.getView().getModel("WorklistDemandsToStaff").destroy();
                }
                this.getView().setModel(mWorklistItems, "WorklistDemandsToStaff");

                if (!this._assignWorklistItems) {
                    this._assignWorklistItems = helpers.initializeFragmentFromObject({
                        oParentController: this,
                        sFragment: "sap.coe.planning.calendar.fragment.AssignWorklistDemand",
                        ControllerClass: AssignWorklistDemandController,
                        sCreateId: this.getView().createId("idForAssignWorklistDemandDialog")
                    });
                }
                this._assignWorklistItems.open();
            } else {
                sap.m.MessageToast.show(i18n.getText("MSG_NO_PENDING_ASG"));
            }
        },

        /**
        * Open dialog to allow users to edit details an assignment that's already been assigned
        * @public
        * @param {Object} oEvent - event that called the function
        */
        onEditAssignmentDetails: function(oEvent) {
            var oRow = oEvent.getSource(),
                oDemand = oRow.getBindingContext().getObject(),
                dBegDate = sap.coe.capacity.reuselib.utils.formatter.removeTimeOffset(oDemand.AssignmentStartDate),
                dEndDate = sap.coe.capacity.reuselib.utils.formatter.removeTimeOffset(oDemand.AssignmentEndDate),
                oTable = this.byId("worklistTable"),
                that = this,
                aDemandsToStaff = [],
                oAssignment = oDemand;

            oAssignment.BegDate = oDemand.AssignmentStartDate;
            oAssignment.EndDate = oDemand.AssignmentEndDate;
            oAssignment.StartTime = this._convertZeroTimestamp(oDemand.AssignmentStartDate);
            oAssignment.EndTime = this._convertZeroTimestamp(oDemand.AssignmentEndDate);
            oAssignment.CallOff = oDemand.Calloffincl;
            oAssignment.QualificationTxt = oDemand.FirstQualificationDescription;
            oAssignment.Duration = oDemand.Duration;
            oAssignment.FullName = oDemand.FirstName + " " + oDemand.LastName;
            oAssignment.Employee = oDemand.EmpID;
            oAssignment.BindingContext = oRow.getBindingContext().sPath;

            // Retrieve employee values for input model
            var aFilters = [];
            aFilters.push(new sap.ui.model.Filter("BegDate", sap.ui.model.FilterOperator.EQ, new Date()));
            aFilters.push(new sap.ui.model.Filter("EndDate", sap.ui.model.FilterOperator.EQ, new Date()));
            aFilters.push(new sap.ui.model.Filter("EmpId", sap.ui.model.FilterOperator.EQ, oDemand.EmpID));

            this.getView().getModel().read("/ResourceList", {
                filters: aFilters,
                success: function(oResponse) {
                    oAssignment.ResGuid = oResponse.results[0].ResGuid;
                }.bind(this),
                error: function() {
                    sap.m.MessageToast.show(i18n.getText("MSG_NOT_VALID_EMPID"));
                }
            });

            aDemandsToStaff.push(oAssignment);

            var mWorklistItems = new JSONModel(aDemandsToStaff);
            if (this.getView().getModel("WorklistDemandsToStaff")) {
                this.getView().getModel("WorklistDemandsToStaff").destroy();
            }
            this.getView().setModel(mWorklistItems, "WorklistDemandsToStaff");

            if (!this._assignWorklistItems) {
                this._assignWorklistItems = helpers.initializeFragmentFromObject({
                    oParentController: this,
                    sFragment: "sap.coe.planning.calendar.fragment.AssignWorklistDemand",
                    ControllerClass: AssignWorklistDemandController,
                    sCreateId: this.getView().createId("idForAssignWorklistDemandDialog")
                });
            }

            var oDemandData = this.getView().getModel("WorklistDemandsToStaff").getProperty("/");
            oDemandData.FragmentID = "sap.coe.planning.calendar.fragment.AssignWorklistDemand";
            oDemandData.EditMode = true;

            this._assignWorklistItems.open();
        },

        onDeleteAssignment: function(oEvent) {
            var oRow = oEvent.getSource();
            var oDemand = oRow.getBindingContext().getObject();
            var dBegDate = sap.coe.capacity.reuselib.utils.formatter.removeTimeOffset(oDemand.AssignmentStartDate);
            var dEndDate = sap.coe.capacity.reuselib.utils.formatter.removeTimeOffset(oDemand.AssignmentEndDate);
            var oTable = this.byId("worklistTable");
            var that = this;

            oTable.setBusy(true);

            this.getView().getModel().remove("/AssignmentList(EmpID='" + oDemand.EmpID + "',BegDate=datetime'" + dBegDate.toJSON().split(".")[0] + "',EndDate=datetime'" + dEndDate.toJSON().split(".")[0] + "',AsgnGuid='" + oDemand.AsgnGUID + "')", {
                success: function(oData,oResponse) {
                    oTable.setBusy(false);
                    sap.m.MessageToast.show(i18n.getText("MSG_ASG_DELETED_SUCCESS"));
                    this.byId("ServiceDemandFilterBar").byId("idForStaffingLevel").setSelectedKeys(["A", "B"]);
                    var aSelectedFilters = this.aCurrentFilters;
                    var aStaffingFilters = [
                        new sap.ui.model.Filter({
                                value1: "B",
                                value2: undefined,
                                operator: "EQ",
                                path: "StaffingLevel"
                        }),
                        new sap.ui.model.Filter({
                                value1: "C",
                                value2: undefined,
                                operator: "EQ",
                                path: "StaffingLevel"
                        }),
                        new sap.ui.model.Filter({
                                value1: "D",
                                value2: undefined,
                                operator: "EQ",
                                path: "StaffingLevel"
                        })];
                    aSelectedFilters = aSelectedFilters.concat(aStaffingFilters);
                    this.byId("ServiceDemandFilterBar").fireEvent("search", {
                        filters: aSelectedFilters
                    });
                    // search closes 'edit mode' so we need to set the icons back to 'edit mode'
                    this.byId("sortItems").setVisible(false);
                    this.byId("assignResCol").setVisible(true);
                    this.byId("assignItems").setVisible(true);
                    this.byId("deleteItems").setVisible(true);
                    // If hard booked from RM app then need to show the warning message if 
                    if(oResponse.headers.warning){
                        sap.m.MessageBox.warning(oResponse.headers.warning);

                    }
                }.bind(this),
                error: function(oResponse) {
                    oTable.setBusy(false);
                    that._displayAssignmentFailureDialogOnErrorResponse(oResponse);
                }
            });
        },
        /**
         * Gets all the necessary params to call the error code helper functions
         *
         * @public
         * @param {string} oResponse - failure response from back-end
         * @returns {void}
         */
        //function duplicate in AssignServiceOrder + AssignWorklistDemand
        _displayAssignmentFailureDialogOnErrorResponse: function(oResponse){
            var sErrorMsg = JSON.parse(oResponse.responseText),
                        sItemGuid = sErrorMsg.error.message.value,
                        oDemand = this.getView().getModel().getProperty("/ResDemandSet('" + sItemGuid + "')"), 
                        oOrg = this.getView().getModel().getProperty("/ResServiceTeamSet('" + oDemand.Organization + "')"),
                        aErrorCodes = sErrorMsg.error.innererror.errordetails,
                        sErrorMsgDisplay = "";

                    //string builder helper function which gets the display message depending on B-E response
                    sErrorMsgDisplay += ErrorCodeHelper.getMessageForErrorCodes(aErrorCodes, oDemand, oOrg);
                    ErrorCodeHelper.displaySoErrorDialog(sErrorMsgDisplay);
        },

        onEditAssignment: function() {
            if (this.byId("worklistTable").getItems().length) {
                var oAssignColumn = this.byId("assignResCol"),
                bIsVisible = oAssignColumn.getVisible();
                // Make assign/remove column visible
                oAssignColumn.setVisible(!bIsVisible);
                // Hide sort button so table cannot be resorted during assignment
                this.byId("sortItems").setVisible(bIsVisible);

                this.byId("assignItems").setVisible(!bIsVisible);
                this.byId("deleteItems").setVisible(!bIsVisible);

                var iSOInFilter = this.byId("ServiceDemandFilterBar").byId("idForDemandID").getTokens().length;

                // display 'delete all' button only if search is done by SO number
                if (oAssignColumn.getVisible() && iSOInFilter > 0) {
                    this.byId("deleteItems").setVisible(true);
                }
                else {
                    this.byId("deleteItems").setVisible(false);
                }
            } else {
                // If no records display message toast
                sap.m.MessageToast.show(i18n.getText("MSG_NO_DEMANDS"));
            }
        },

        /**
         * Add all the selected items to the model so that they can be used in the planning calendar to
         * populate the masterlist, navigate to the planning calendar and unset the model property for
         * deciding when to unselect the items in the worklist on routematched
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        onManageItemsPress: function(oEvent) {
            var oWorklistTable = this.getView().byId("worklistTable"),
                aSelectedItemPaths = oWorklistTable.getSelectedContextPaths();

            this.getView().getModel("worklistSelectedItems").destroy();

            this._addItemsToGlobalModel(aSelectedItemPaths);
            this.getOwnerComponent().getRouter().navTo("planningCalendar");
            this.getView().getModel("worklistSelectedItems").setProperty("/soAssigned", false);

        },

        /**
         * When an item is selected or unselected and the number of selected items is greater than 0 set the manage items link to enabled,
         * if the number of items equals 0 set the the link button to disabled
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        onTableSelectionChange: function(oEvent) {
            var aSelectedItems = oEvent.getSource().getSelectedItems(),
                oLinkManageItems = this.byId("manageLineItemsLink");

            return (aSelectedItems.length > 0) ? oLinkManageItems.setEnabled(true) : oLinkManageItems.setEnabled(false);
        },

        /**
        * When the search button is pressed get the array of filters from the event and filter the table bindings with those filters
        * @param {Object} oEvent - object which calls the function
        * @public
        * @returns {void}
        */
        onSearch: function(oEvent) {
            this.aCurrentFilters = oEvent.getParameter("filters");
            this.byId("worklistTable").getBinding("items").filter(this.aCurrentFilters);

            // clear entries in "Edit Assignments"
            var oTable = this.getView().byId("worklistTable"),
                iAssignColumn = this.byId("assignResCol").getInitialOrder(),
                aTableItems = oTable.getAggregation("items");

            for (var i = 0; i < aTableItems.length; i++) {
                var oRowEmpInput = aTableItems[i].getCells()[iAssignColumn].getItems()[0].getFragment();
                oRowEmpInput.setValue("");
            }

            // reset the icons to close 'edit mode'
            this.byId("sortItems").setVisible(true);
            this.byId("assignResCol").setVisible(false);
            this.byId("assignItems").setVisible(false);
            this.byId("deleteItems").setVisible(false);
        },

        /**
        * Display confirmation message for user to delete all assigned SO's (using SO in the filter)
        * @public
        * @returns {Object} MessageBox displaying warning to user
        */
        onDeleteSOAssignments: function () {
            var that = this;
            return sap.m.MessageBox.confirm(i18n.getText("FRAGMENT_WARNING_DELETEALL_STAFFEDSO_TEXT"), {
                    title: i18n.getText("FRAGMENT_WARNING_DELETEALL_STAFFEDSO_TITLE"),
                    actions: ["Delete", "Cancel"],
                        onClose: function(oAction) {
                            if (oAction === "Delete") {
                                that.deleteAllSOAssignments();
                            }
                        }.bind(that),
                    styleClass: "",
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
        },

        /**
        * Delete all assigned SO's (using SO in the filter)
        * @public
        * @returns {Object} MessageBox displaying warning to user
        */
        deleteAllSOAssignments: function () {
            var oTable = this.byId("worklistTable"),
                aTableRows = oTable.getItems(),
                oDemand,
                that = this;

            this.aStaffedAssignments = [];
            oTable.setBusy(true);

            for (var i = 0; i < aTableRows.length; i ++) {
                oDemand = oTable.getItems()[i].getBindingContext().getObject();
                if (oDemand.AssignmentStartDate !== null) {
                    this.aStaffedAssignments.push(aTableRows[i].getBindingContext().getObject());
                }
            }

            this.iNumDemandsStaffed = this.aStaffedAssignments.length - 1;
            this.onDeleteAllAssignments(this.aStaffedAssignments[this.iNumDemandsStaffed]);
        },

        /**
        * Deletes all of the current assignments on the selected SO
        * @param {Object} oDemand - demand to be deleted
        * @public
        * @returns {void}
        */
        onDeleteAllAssignments: function (oDemand) {
            var that = this,
                oTable = this.byId("worklistTable"),
                aSelectedFilters = this.aCurrentFilters,
                oFilterBar = this.byId("ServiceDemandFilterBar"),
                oModel = this.getView().getModel();

            if (this.iNumDemandsStaffed >= 0) {
                var dBegDate = sap.coe.capacity.reuselib.utils.formatter.removeTimeOffset(oDemand.AssignmentStartDate),
                    dEndDate = sap.coe.capacity.reuselib.utils.formatter.removeTimeOffset(oDemand.AssignmentEndDate);
            }

            oModel.remove("/AssignmentList(EmpID='" + oDemand.EmpID + "',BegDate=datetime'" + dBegDate.toJSON().split(".")[0] + "',EndDate=datetime'" + dEndDate.toJSON().split(".")[0] + "',AsgnGuid='" + oDemand.AsgnGUID + "')", {
                success: function(oData,oResponse) {
                    if (that.iNumDemandsStaffed === 0 ) {
                        oTable.setBusy(false);
                        sap.m.MessageToast.show(i18n.getText("MSG_ASG_DELETED_SUCCESS"));
                        oFilterBar.fireEvent("search", {
                            filters: aSelectedFilters
                        });
                        // search closes 'edit mode' so we need to set the icons back to 'edit mode'
                        that.byId("sortItems").setVisible(false);
                        that.byId("assignResCol").setVisible(true);
                        that.byId("assignItems").setVisible(true);
                        that.byId("deleteItems").setVisible(true);
                    }
                    if(oResponse.headers.warning)
                        {
                    
                        sap.m.MessageBox.warning(oResponse.headers.warning);
                    }
                   // sap.m.MessageToast.show(i18n.getText("MSG_ASG_DELETED_SUCCESS"));
                    that.iNumDemandsStaffed--;
                    that.onDeleteAllAssignments(that.aStaffedAssignments[that.iNumDemandsStaffed]);
                }.bind(this),
                error: function(oResponse) {
                    if (that.iNumDemandsStaffed === 0 ) {
                        oTable.setBusy(false);
                        oFilterBar.fireEvent("search", {
                            filters: aSelectedFilters
                        });
                        // search closes 'edit mode' so we need to set the icons back to 'edit mode'
                        that.byId("sortItems").setVisible(false);
                        that.byId("assignResCol").setVisible(true);
                        that.byId("assignItems").setVisible(true);
                        that.byId("deleteItems").setVisible(true);
                    }
                    that._displayAssignmentFailureDialogOnErrorResponse(oResponse);
                    that.iNumDemandsStaffed--;
                    that.onDeleteAllAssignments(that.aStaffedAssignments[that.iNumDemandsStaffed]);
                }
            });
        },

        /**
        * Opens the Date Range settings dialog
        * @public
        * @returns {void}
        */
        onDateRangeSelectionPress: function () {
            if (!this._oDateRangeSettingsDialog)
                this._oDateRangeSettingsDialog = helpers.initializeFragmentFromObject({
                    oParentController: this,
                    sFragment: "sap.coe.planning.calendar.fragment.DateRangeSettings",
                    ControllerClass: DateRangeSettings,
                    oModel: this.getView().getModel(),
                    sCreateId: this.getView().createId("DateRangeSettings")
                });

            this._oDateRangeSettingsDialog.open();
        },

        /**
        * Opens the Date Range settings dialog
        * @public
        * @returns {void}
        */
        onTablePersonalise: function () {
            if (!this._oTableP13nDialog)
                this._oTableP13nDialog = helpers.initializeFragmentFromObject({
                    oParentController: this,
                    sFragment: "sap.coe.planning.calendar.fragment.TableP13nDialog",
                    ControllerClass: TableP13n,
                    oModel: this._oP13nModel,
                    sCreateId: this.getView().createId("TableP13nDialog")
                });

            this._oTableP13nDialog.open();
        },

        /**
        * Using all the select item paths passed as a parameter, add them all to the model to be used on the planning calendar screen
        * to populate the list
        * @param {array} aSelectedItemPaths - array containing the paths of all the selected items
        * @public
        * @returns {void}
        */
        _addItemsToGlobalModel: function(aSelectedItemPaths) {
            var aSelectedItems = [];

            for (var i = 0; i < aSelectedItemPaths.length; i++) {
                aSelectedItems.push(this.getView().getModel().getProperty(aSelectedItemPaths[i]));
                this.getView().getModel().getProperty(aSelectedItemPaths[i]).itemPath = aSelectedItemPaths[i].split("/")[1];
            }

            this.getView().getModel("worklistSelectedItems").setData(aSelectedItems);
        },
        /**
        * set the utils model to the view
        * @public
        * @returns {void}
        */
        _setUtilsModelToView: function() {
            this.getView().setModel(
                new JSONModel(jQuery.sap.getModulePath("sap.coe.capacity.reuselib") + "/model/utilsModel.json"),
                "ReuseModel");
        },
       _TimezoneSettingsDialog: function(that){
            //  TimeZoneSettings._getUserTimeZone(this);
          //  var oTimezones = this.getModel("TimeZone").getData();
              if (!this._oTimeZoneSelect) {
                  this._oTimeZoneSelect = sap.ui.xmlfragment(
                      "sap.coe.capacity.reuselib.controls.TimeZoneSelect.TimeZoneSelect", this);
                  this.getView().addDependent(this._oTimeZoneSelect);
              }
              jQuery.sap.syncStyleClass("sapUiSizeCompact", that.oView, this._oTimeZoneSelect);
              this._oTimeZoneSelect.setTitle(i18n.getText("FRAGMENT_SELECT_TIMEZONE_TITLE"));
             // this._oTimeZoneSelect.open();
          },
          _showSettingsDialog: function(){
            this._getUserTimeZone(this);
            if (!this._oTimeZoneSelect) {
                this._oTimeZoneSelect = sap.ui.xmlfragment(
                    "sap.coe.capacity.reuselib.controls.TimeZoneSelect.TimeZoneSelect", this);
                this.oView.addDependent(this._oTimeZoneSelect);
            }
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.oView, this._oTimeZoneSelect);
            this._oTimeZoneSelect.setTitle(i18n.getText("FRAGMENT_SELECT_TIMEZONE_TITLE"));
            this._oTimeZoneSelect.open();
          },
          handleClose: function (oEvent) {
              var that = this,
                  sPath = oEvent.getParameter("selectedContexts")[0].sPath,
                  sValue = oEvent.getSource().getModel("TimeZone").getProperty(sPath).key,
                  oRequestBody = {
                      "Timezone": sValue
                  };
                  this.getView().getModel().update("/ResTimeZoneSet('')", oRequestBody, {
                  success: function (oData, response) {
                      that._oTimeZoneSelect.getModel("TimeZone").setProperty("/SelectedTimeZone", sValue);
                      resourcePlanningCalendarComponentInstance.getModel("TimeZone").setProperty("/SelectedTimeZone", sValue);
                  }
              });
          },
          handleSearch: function (oEvent) {
              var sValue = oEvent.getParameter("value"),
                  oFilter = new sap.ui.model.Filter("text", sap.ui.model.FilterOperator.Contains, sValue),
                  oBinding = oEvent.getSource().getBinding("items");
      
              oBinding.filter([oFilter]);
          },
          _setTimeZoneModelToView: function (that, sComponent) {
              that.getView().setModel(
                  new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath(sComponent) + "/model/TimeZoneModel.json"),
                  "TimeZone");
          },
          _getUserTimeZone: function (that) {
              that.oView.getModel().read("/ResTimeZoneSet('')", {
                  success: function (oData, response) {
                      that.oView.getModel("TimeZone").setProperty("/SelectedTimeZone", oData.Timezone);
                  }
              });
          }
    });
});
