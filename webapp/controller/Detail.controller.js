sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/coe/planning/calendar/util/formatter",
    "sap/coe/capacity/reuselib/utils/formatter",
    "sap/coe/capacity/reuselib/utils/DataManager",
    "sap/coe/capacity/reuselib/controls/CustomVariantManager/CustomVariantManagerComponent",
    "sap/coe/capacity/reuselib/utils/VariantFilterHelper",
    "sap/coe/planning/calendar/fragment/AssignServiceOrder.fragment.controller",
    "sap/coe/planning/calendar/fragment/ActionSheet.fragment.controller",
    "sap/coe/capacity/reuselib/fragment/Organisation.fragment.controller",
    "sap/coe/planning/calendar/util/helpers",
    "sap/coe/capacity/reuselib/utils/P13nHelper",
    "sap/coe/capacity/reuselib/utils/CalendarHelper"
], function(Controller, formatter, formatterReuse, DataManager, CustomVariantManager, VariantHelper, AssignServiceOrder, ActionSheetController, OrganisationController, helpers, P13nHelper, CalendarHelper) {
    "use strict";

    var oController;

    return Controller.extend("sap.coe.planning.calendar.controller.Detail", {
        formatter: formatter,
        formatterReuse: formatterReuse,
        isCalendarFullScreen: false,
        VariantHelper: VariantHelper,

        /**
         * Sets up the controller on initialisation
         *
         * @private
         * @returns {void}
         */
        onInit: function() {
            oController = this;
            this._oView = this.getView();
            this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
            this._oRouter = this._oComponent.getRouter();
            this._oRouter.attachRouteMatched(this._handleRouterMatched, this);
            this._oPlanningCalendar = this.byId("resourcePlanningCalendarId").getFragment();
            this.oMasterList = this.getOwnerComponent().byId("master--worklistTable");

            VariantHelper.setVariantFilterModel(this._oView);
            this._setUtilsModelToView();

            var oP13nModel = new sap.ui.model.json.JSONModel();
            this._oView.setModel(oP13nModel, "p13nModel");
            // Trigger function to read personalization data
            this._readP13n();

            this.oEventBus = sap.ui.getCore().getEventBus();
            this.oEventBus.subscribe("GlobalChannel", "RowSelected", this.handlePCSelection, this);

        },

        /**
         * Sets up the controller before rendering, initialises filterbar
         *
         * @private
         * @returns {void}
         */
        onBeforeRendering: function() {
            this._sUser = this._oComponent.getModel("praUserContext").getProperty("/EmpId");
            this.byId("filterBar").fireInitialise();

            // check if the current user is a staffer
            var aCalendarInterval = CalendarHelper.getCalInterval(this._oPlanningCalendar.getStartDate(), 7),
                aFilters = [],
                that = this;

            aFilters.push(new sap.ui.model.Filter("BegDate", sap.ui.model.FilterOperator.EQ, aCalendarInterval[0]));
            aFilters.push(new sap.ui.model.Filter("EndDate", sap.ui.model.FilterOperator.EQ, aCalendarInterval[1]));
            aFilters.push(new sap.ui.model.Filter("EmpId", sap.ui.model.FilterOperator.EQ, this._sUser));

            this._oView.getModel().read("/ResourceList", {
                urlParameters: {
                    "$expand": "RPTASTDataSet,QualificationSet"
                },
                filters: aFilters,
                success: function(odata) {
                    if (odata.results.length > 0) {
                        if (odata.results[0].Staffer === "X") {
                            that._oPlanningCalendar.getModel("UIModel").setProperty("/staffingAuthorized", true);
                        }
                        else {
                            that._oPlanningCalendar.getModel("UIModel").setProperty("/staffingAuthorized", false);
                        }
                    }
                }
            });
        },

        //manage lifecycle of eventbus to avoid conflicts
        onExit: function() {
            this.oEventBus.unsubscribe("GlobalChannel", "RowSelected", this.handlePCSelection, this);
        },

        //this function is called when a selection is made in the planning calendar, called through event bus
        handlePCSelection: function(sChannel, sEvent, oData){
            var bSetButtonEnabled = this.oMasterList.getSelectedItem() !== null && oData.selected;

            this._setEnabledForAssignSelectedItemsButton(bSetButtonEnabled);
        },

        onAfterRendering: function() {
            this._oPlanningCalendar.getModel("resourceModel").setSizeLimit(500);

            this._readp13nPersCal();
            this._readp13nSortCal();
        },

        /**
         * Sets up the variant manager when the filter bar is initialised
         *
         * @public
         *
         * @param {Object} oEvent Object which calls the function
         * @returns {void}
         *
         */
        onInitialiseFilterBar: function(oEvent) {
            var that = oController,
                oFilterBar = oEvent.getSource(),
                self = this;

            if (oFilterBar.customVariantManager === undefined){
                oFilterBar.customVariantManager = new CustomVariantManager({
                    appId: "SAP.COE.RPAPilot03",
                    variantSet: "TEAM_CALPilot03",
                    defaultVariant: that.getDefaultVariant,
                    filterBar: oFilterBar,
                    parentControllerContext: self
                });
            }
        },
        /**
         * Opens a new window when link is clicked
         *
         * @public
         *
         * @param {Object} oEvent Object which calls the function
         * @returns {void}
         *
         */
        onItemDescriptionLinkPress: function(oEvent) {
            var sPath = this.sItemSelectedPath.split(">")[1],
                oData = this.getOwnerComponent().getModel("MasterListModel").getProperty(sPath),
                sBaseURL = this.getOwnerComponent().getModel("praUserContext").getProperty("/BaseURLCRM"),
                sLinkPrefixToCRMItem = sBaseURL +
                "sap(bD1lbiZjPTAwMSZkPW1pbg==)/bc/bsp/sap/crm_ui_start/default.htm?saprole=ZSU_DEFAULT&sap-client=001&sap-language=EN&crm-object-type=ZSU_TBUI4&crm-object-action=B&crm-object-value=";

            window.open(sLinkPrefixToCRMItem + oData.HeaderGUID);
        },
        /**
         * Navigates to the worklist screen
         *
         * @public
         *
         * @param {void}
         * @returns {void}
         *
         */
        navToWorklist: function () {
            var oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("Worklist");
            }
        },
        /**
         * Opens a dialog to assign items when the button is clicked
         *
         * @public
         *
         * @param {Object} oEvent Object which calls the function
         * @returns {void}
         *
         */
        onAssignSelectedItemsClick: function(oEvent) {
            if (!this._assignSelectedItems) {
                this._assignSelectedItems = helpers.initializeFragmentFromObject({
                    oParentController: this,
                    sFragment: "sap.coe.planning.calendar.fragment.AssignServiceOrder",
                    ControllerClass: AssignServiceOrder,
                    sCreateId: this.getView().createId("idForAssignServiceOrderDialog")
                });
            }
            this._assignSelectedItems.open();
            this._fillGlobalAssignmentModelWithData(oEvent);
        },
        /**
         * Opens an action sheet when the button is pressed
         *
         * @public
         *
         * @param {Object} oEvent Object which calls the function
         * @returns {void}
         *
         */
        onActionSheetPress: function(oEvent) {
            var oActionButton = oEvent.getSource();

            if (!this._actionSheet) {
                this._actionSheet = helpers.initializeFragment(this, "sap.coe.planning.calendar.fragment.ActionSheet", ActionSheetController);
            }
            this._actionSheet.openBy(oActionButton);
        },

        //TODO: where is this function called from cant catch it with breakpoint when opening the component
        onServiceTeamRequest: function(oEvent) {
            if (!this._oDialogOrganisationType) {
                this._oDialogOrganisationType = helpers.initializeFragmentFromObject({
                    oParentController: this,
                    sFragment: "sap.coe.capacity.reuselib.fragment.Organisation",
                    ControllerClass: OrganisationController,
                    sCreateId: this.getView().createId("idForOrganization")
                });
            }
            this._oDialogOrganisationType.setModel(helpers.copyModel(this.getView().getModel("VariantFilterModel")), "TempModel");
            this._oDialogOrganisationType.sSourcefieldId = oEvent.getSource().getId().substring(this.getView().getId().length + 2);
            this._oDialogOrganisationType.open();
        },

        /**
         * Changes the calender between full screen and non full screen
         *
         * @public
         *
         * @returns {void}
         *
         */
        onEnterFullScreen: function() {
            if (this.isCalendarFullScreen) {
                this._getSplitApp().setMode(sap.m.SplitAppMode.ShowHideMode);
                this._getSplitApp().showMaster();

                this.isCalendarFullScreen = false;

            } else {
                this._getSplitApp().setMode(sap.m.SplitAppMode.HideMode);
                this._getSplitApp().hideMaster();
                this.isCalendarFullScreen = true;
            }
        },

        /**
         * Get public holidays when filter bar search button is pressed
         *
         * @public
         *
         * @param {Object} oEvent Object which calls the function
         * @returns {void}
         *
         */
        onFilterBarSearchButtonPressed: function(oEvent) {
            // Set marker to indicate that filter search has been fired before - used to determine if search needs to be fired again
            // during success handler function on p13n data read (i.e. if viewKey is set before search is fired no need to refire event)
            this._bFilterSearchFired = true;
            this.aCurrentFilters = VariantHelper.getFilters(oEvent, this.readData);
            
            // adding filters startDate and endDate
            for(var i = 0; i < this.aCurrentFilters[0].aFilters.length; i++){
                if(this.aCurrentFilters[0].aFilters[i].aFilters.length === 0){
                    this.aCurrentFilters[0].aFilters.splice(i,i); 
                }
            }
            this.oFilterStartDate = this._oPlanningCalendar.mAggregations.header._oCalendar.getSelectedDates()[0].getStartDate();
            this.oFilterEndDate = this._oPlanningCalendar.mAggregations.header._oCalendar.getSelectedDates()[0].getEndDate();
            var oDates = new sap.ui.model.Filter({filters:[new sap.ui.model.Filter({filters:[new sap.ui.model.Filter("BegDate",sap.ui.model.FilterOperator.EQ,this.oFilterStartDate)]}),new sap.ui.model.Filter({filters:[new sap.ui.model.Filter("EndDate",sap.ui.model.FilterOperator.EQ,this.oFilterEndDate)]})],and:true});
            this.aCurrentFilters[0].aFilters.push(oDates);
            
            DataManager.onRead(this, this.aCurrentFilters);
            DataManager.getPublicHolidays(this, this._getHolidaysFilter(this.aCurrentFilters));
        },

        /**
         * Gets the holiday filters
         *
         * @public
         *
         * @param {Object} aFilters Array of filters
         * @returns {Array} - array of holiday filters
         *
         */
        _getHolidaysFilter: function(aFilters){
            var aHolidaysFilter = [];

            for (var i = aFilters.length - 1; i >= 0; i--) {
                if (aFilters[i].sPath === "BegDate") {
                    aHolidaysFilter.push(aFilters[i]);
                } else if (aFilters[i].sPath === "EndDate") {
                    aHolidaysFilter.push(aFilters[i]);
                } else if (aFilters[i].aFilters) {
                    return aHolidaysFilter.concat(this._getHolidaysFilter(aFilters[i].aFilters));
                }
            }

            aHolidaysFilter.push(new sap.ui.model.Filter("EmpId", sap.ui.model.FilterOperator.EQ, this._sUser));

            return aHolidaysFilter;
        },
        /**
         * Navigates to the personal calendar when the button is clicked
         *
         * @public
         * @returns {void}
         *
         */
        //updated function to match other cross app behaviour 
        onViewPersonalCalendarClick: function() {
            // var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"),
            //     sHash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
            //         target: {
            //             semanticObject: "resourceplanning",
            //             action: "Display"
            //         }
            //     })) || "";
            // oCrossAppNavigator.toExternal({
            //     target: {
            //         shellHash: sHash
            //     }
            // });

            if (window.parent) {
                window.parent.postMessage(
                    JSON.stringify({
                        type: 'request',
                        service: 'sap.ushell.services.CrossApplicationNavigation.toExternal',
                        body: {
                            oArgs: {
                                target: {
                                    semanticObject: "resourceplanning",
                                    action: "Display"
                                }
                            }
                        }
                    }),
                    '*'
                )
            }
        },
        /**
         * Handles onStartDateChange events of the RP component, which is fired after startDateChange and viewChange events of planning calendar
         * Initial call of this function from the onBeforeRendering function of the RP component
         * and populates filter with date range based on calendar view and start date. FilterBar search is not fired on initial call.
         *
         * Function is also called after viewChange event fired in setViewKeyFromP13n function, which sets calendar view based on p13n.
         * FilterBar search should also not be triggered after this.
         *
         * @public
         *
         * @param {Object} oEvent Object which calls the function
         * @returns {void}
         *
         */
        onStartDateChange: function(oEvent) {
            var aIntervalDates = oEvent.getParameter("intervalDates");
            var sViewKey = oEvent.getParameter("viewKey");
            var oFilterBar = this.byId("filterBar");
            var oDateRangeControl = this.byId("idDateRange");
            var bSearch = false;

            if (oDateRangeControl) {

                if (this._isStartEndDateEqual(oDateRangeControl, aIntervalDates)) return;

                bSearch = oDateRangeControl.getDateValue() !== null;
                oDateRangeControl.setDateValue(aIntervalDates[0]);
                oDateRangeControl.setSecondDateValue(aIntervalDates[1]);

                if (bSearch) {
                    oFilterBar.search();
                }
            }

            this.byId("resourcePlanningCalendarId").setDateRange(aIntervalDates[0], aIntervalDates[1]);

            // Update p13n
            if (!oEvent.getParameter("preventP13Update")) {
                this.getOwnerComponent().updateP13n("_calViewP13n", P13nHelper.validateViewKey(sViewKey) ? sViewKey : "6");
            }
        },
        /**
         * Reads the allocations after creating a new one
         *
         * @public
         * @returns {void}
         *
         */
        onAllocationCreated: function() {
            var that = oController,
                oPlanningCalendarComponent = that.byId("resourcePlanningCalendarId");

            oPlanningCalendarComponent.readResources(that.aCurrentFilters);
        },

        /**
         * Handles assignmentDeleted event of ResourcePlanningCalendar component
         * @name onAssignmentDeleted
         * @function
         * @memberOf Details.controller.js
         * @param {sap.ui.base.Event} oEvent - event triggered by assignmentDeleted event of ResourcePlanningCalendar
         * @return {void}
         */
        onAssignmentDeleted: function(oEvent) {
            // Request Resource Demand using itemGuid of deleted assignment
            var sItemGuid = oEvent.getParameter("itemGuid");
            this.getView().getModel().read("/ResDemandSet('" + sItemGuid + "')", {
                    success: function(oResponse) {
                        var oMasterListModel = this.getView().getModel("MasterListModel"),
                            oObjectMasterList;
                        if(!this.checkMasterListForAssignment(oMasterListModel, sItemGuid)){
                            // Check if MasterListModel is already initialised. If not initialise with ResDemandSet array at root.
                            if (oMasterListModel === undefined || oMasterListModel.getProperty("/ResDemandSet") === undefined) {
                                oObjectMasterList = { "ResDemandSet": [] };
                                oMasterListModel = new sap.ui.model.json.JSONModel(oObjectMasterList);
                                // Set model to component so master and detail view have access
                                this.getView().getController().getOwnerComponent().setModel(oMasterListModel, "MasterListModel");
                            }
                            oObjectMasterList = oMasterListModel.getProperty("/ResDemandSet");
                            // Push retrieved ResDemand to master list model and update bindings so it is visible in master list and can be reassigned
                            oObjectMasterList.push(oResponse);
                        }
                        oMasterListModel.updateBindings(true);
                    }.bind(this),
                    error: function() {
                        // Return error to console for information
                        jQuery.sap.log.error("ResDemand could not be retrieved for deleted assignment " + sItemGuid);
                    }
                });
        },
        /**
         * Check the master list for a certain item based on itemGuid
         * @name checkMasterListForAssignment
         * @function
         * @memberOf Details.controller.js
         * @param {object} oMasterListModel - model representing the master list
         * @param {string} sItemGuid - string used as a unique identifier of the item
         * @return {boolean} - returns true or false based on if the item was found
         */
        checkMasterListForAssignment: function(oMasterListModel, sItemGuid){
            var oObjectMasterList = oMasterListModel.getProperty("/ResDemandSet");
            for(var i = 0; i < oObjectMasterList.length; i++){
                if(oObjectMasterList[i].ItemGUID === sItemGuid){
                    return true;
                }   
            }
            return false;
        },

        /**
         * Gets the default variant 
         * @name getDefaultVariant
         * @function
         * @memberOf Details.controller.js
         * @return {void} 
         */
        getDefaultVariant: function() {
            var that = oController,
                oFilterBar = that.byId("filterBar"),
                oDefaultVariant = {};

            that.getView().getModel().read("/OrgUnitSet(EmpId='',OrgId='')", {
                urlParameters: {
                    "$expand": "SubOrgUnitSet",
                    "$format": "json"
                },
                success: function(oData) {
                    oDefaultVariant.OrgId = [{
                        id: oData.OrgId,
                        name: oData.OrgText
                    }];
                    oFilterBar.customVariantManager.createDefaultVariant(oDefaultVariant);
                }
            });
        },

        //TODO: where is this called from?
        isPersonSelected: function() {
            var aSelectedPeople = this._oPlanningCalendar.getSelectedRows();

            return (aSelectedPeople.length <= 0) ? false : true;
        },

        /**
         * Updates the header with assignment details
         * @name updateStatusHeader
         * @function
         * @memberOf Details.controller.js
         * @param {array} aSelectedItemsMasterList - array of all the selected items in the master list
         * @param {object} oChangedItem - object representing the changed item
         * @param {boolean} bSelected - boolean representing selected or not selected
         * @return {void} 
         */
        updateStatusHeader: function(aSelectedItemsMasterList, oChangedItem, bSelected) {
            var sPath = "MasterListModel>" + oChangedItem.getBindingContextPath(),
                iNumPcSelectedRows = this._oPlanningCalendar.getSelectedRows().length;

            if (aSelectedItemsMasterList.length === 0) {
                this.updateHeader(null);
                this._setEnabledForAssignSelectedItemsButton(false);
            } else {
                if (bSelected) this.updateHeader(sPath);
                //to clean up this code refactor so function is not responsible for BOTH updating header and setting button enabled/disable (2 seperate functions!)
                if(iNumPcSelectedRows > 0){
                    this._setEnabledForAssignSelectedItemsButton(true);
                }
            }
        },
         /**
         * Creates a time allocation
         * @name createTimeAllocation
         * @function
         * @memberOf Details.controller.js
         * @param {object} oEvent - object which calls the function
         * @return {void}
         */
        createTimeAllocation: function(oEvent) {
            var oCreateRequestBody = oEvent.getParameter("CreateRequestBody");
            DataManager.onCreateTimeAllocation(this, "/TimeAllocationList", oCreateRequestBody);
        },

        /**
         * Retrieves the org unit
         * @name retrieveOrgUnit
         * @function
         * @memberOf Details.controller.js
         * @param {object} oEvent - object which calls the function
         * @return {void}
         */
        retrieveOrgUnit: function(oEvent) {
            var oFragment = oEvent.getParameter("oFragment");
            var orgUnit = "";
            var bNavBack = oEvent.getParameter("bNavBack");
            if (bNavBack) {
                orgUnit = this.oOrgNavigation[this.oOrgNavigation.length - 1].id;
            } else if (bNavBack === false) {
                var sSelectedPath = oEvent.getParameter("sSelectedPath");
                orgUnit = this._oView.getModel("OrgUnitModel").getProperty(sSelectedPath).OrgId;
                this.oOrgNavigation.pop();
            } else {
                //pass the parent org since the oData service returns subOrgs
                orgUnit = this._oView.getModel("praUserContext").getProperty("/HigherUnt");
            }
            DataManager.getOrgUnit(this._sUser, orgUnit, oFragment, this);

        },

        /**
         * Updates the header, set it visible if an item is selected otherwise hides the header
         * @name updateHeader
         * @function
         * @memberOf Details.controller.js
         * @param {string} sPath - sting representing the path
         * @return {void}
         */
        updateHeader: function(sPath) {
            if (sPath) {
                this.getView().bindElement(sPath);
                this.isSelectedInMasterList = true;
                this.sItemSelectedPath = sPath;
            } else {
                this.isSelectedInMasterList = false;
                this.sItemSelectedPath = "";
            }
        },

        /**
         * This function overrides the data model for the dialog with the data of the latest selected item.
         * @name _fillGlobalAssignmentModelWithData
         * @function
         * @memberOf Details.controller.js
         * @return {void}
         */
        _fillGlobalAssignmentModelWithData: function() {
            var aSelectedItems = this.getOwnerComponent().byId("master--worklistTable").getSelectedItems(),
                aSelectedPeople = this._oPlanningCalendar.getSelectedRows()[0];

            if (aSelectedPeople === undefined) {
                aSelectedPeople = this._oPlanningCalendar.getRows()[0];
            }
            if ((aSelectedItems.length <= 0 && this._assignSelectedItems.isOpen())) {
                this._assignSelectedItems.close();
                this._setEnabledForAssignSelectedItemsButton(false);
                return;
            }

            var oDataFromSelectedItems = this._createObjectForAssignmentDialog(aSelectedItems[0].getBindingContextPath(),
                aSelectedPeople.getBindingContext("resourceModel"));

            this._assignNewModelTo("AssignSelectedOrderDialogModel", new sap.ui.model.json.JSONModel([oDataFromSelectedItems]));
        },
        /**
         * Checks is the start and end date equal
         * @name _isStartEndDateEqual
         * @function
         * @memberOf Details.controller.js
         * @param {object} oDateRangeControl - object representing the date range control
         * @param {array} aIntervalDates - array of the interval dates
         * @return {void}
         */
        _isStartEndDateEqual: function(oDateRangeControl, aIntervalDates) {
            return oDateRangeControl.getDateValue() &&
                oDateRangeControl.getDateValue().getTime() === aIntervalDates[0].getTime() &&
                oDateRangeControl.getSecondDateValue() &&
                oDateRangeControl.getSecondDateValue().getTime() === aIntervalDates[1].getTime();
        },
        /**
         * Gets the calendar interval dates (start date & end date)
         * @name _getCalInterval
         * @function
         * @memberOf Details.controller.js
         * @param {object} oDate - object representing the date
         * @param {int} iInterval - integer representing the interval
         * @return {array} - array containing the start date and end date
         */
        _getCalInterval: function(oDate, iInterval) {
            var iDate = 0;
            // If the date's day of week is Mon to Fri set to first day of week,
            // if it is Sat or Sun set to first day of next week
            if (oDate.getDay() < 6) {
                iDate = (oDate.getDate() - (oDate.getDay() - 1));
            } else {
                iDate = (oDate.getDate() + 2);
            }

            var oStartDate = new Date(oDate.getFullYear(), oDate.getMonth(), iDate);
            var oEndDate = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), (oStartDate.getDate() + iInterval), 0, 0, -1);

            return [oStartDate, oEndDate];
        },

        /**
         * Enable or disable the "Assign" button
         *
         * @param {boolean} bEnabled -  boolean representing enabled or not enabled
         * @private 
         */
        _setEnabledForAssignSelectedItemsButton: function(bEnabled) {
            var oButton = this.byId("assignSelectedItemsButton");

            oButton.setEnabled(bEnabled);
        },
        /**
         * Creates an object for the assingment dialog
         * @name _createObjectForAssignmentDialog
         * @function
         * @memberOf Details.controller.js
         * @param {object} oPathToItem - object used to get the path to the item
         * @param {object} oPersonContext - object representing the context of the person being staffed
         * @return {object} - object used for the assignment dialog
         */
        _createObjectForAssignmentDialog: function(oPathToItem, oPersonContext) {
            var oItem = this.getView().getModel("MasterListModel").getProperty(oPathToItem),
                oBegDate = oItem.StartDate,
                oEndDate = oItem.EndDate;


            var oModelPlanningCalendar = this.byId("resourcePlanningCalendarId").getFragment().getBinding("rows").getModel(),
                oSelectedPerson = oModelPlanningCalendar.getProperty(oPersonContext.sPath, oPersonContext);

            return {
                "Employee": oSelectedPerson.EmpId,
                "BegDate": this._convertZeroTimestamp(oBegDate),
                "StartTime": oBegDate,
                "EndDate": this._convertZeroTimestamp(oEndDate),
                "EndTime": oEndDate,
                "DemandId": oItem.DemandID,
                "ItemGUID": oItem.ItemGUID,
                "ResGuid": oSelectedPerson.ResGuid,
                "ItemNo": oItem.ItemNo,
                "Customer": oItem.Customer,
                "ItemDescription": oItem.ItemDescription,
                "HeaderDescription": oItem.HeaderDescription,
                "EmployeeName": oSelectedPerson.FullName,
                "QualificationTxt": oItem.FirstQualificationDescription,
                "CallOff": oItem.Calloffincl,
                "Duration": oItem.Duration
            };
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
         * Assigns a model to the current view based on the parameters passed
         *  
         * @public
         * @param {string} sNameOfModel - string representing the name of the model to be assigned
         * @param {object} oModel - object representing the model to be assigned
         * @returns {void}
         */
        _assignNewModelTo: function(sNameOfModel, oModel) {
            if (this.getView().getModel(sNameOfModel)) {
                this.getView().getModel(sNameOfModel).destroy();
            }
            this.getView().setModel(oModel, sNameOfModel);
        },
        /**
         * when the route is matched intialise the two objects to the calendar interval values
         * @name _handleRouterMatched
         * @function
         * @memberOf Details.controller.js
         * @param {object} oEvent - object which calls the function
         * @return {void} 
         */
        _handleRouterMatched: function(oEvent) {
            if (oEvent.getParameter("name") === "planningCalendar" && this._oComponent.getModel("praUserContext") !== undefined) {
                var aCalendarInterval = [];
                if (!this._oCurrentDate && !this.oEndDate) {
                    aCalendarInterval = this._getCalInterval(this._oPlanningCalendar.getStartDate(), 7);
                    this._oCurrentDate = aCalendarInterval[0];
                    this.oEndDate = aCalendarInterval[1];
                }
            }
            this._setHeaderItemsVisible();


            this.oMasterList.setSelectedItem(this.oMasterList.getItems()[0]);
            this.updateHeader("MasterListModel>/ResDemandSet/0");

            //the master list has an item selected AND the planning calendar has a row selected
            if(this.oMasterList.getSelectedItem() !== null && this._oPlanningCalendar.getSelectedRows()[0] !== undefined){
                this._setEnabledForAssignSelectedItemsButton(true);
            }
        },
        /**
         * Sets the utils model to the view
         * @name _setUtilsModelToView
         * @function
         * @memberOf Details.controller.js
         * @return {void} 
         */
        _setUtilsModelToView: function() {
            this.getView().setModel(
                new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.coe.capacity.reuselib") + "/model/utilsModel.json"),
                "ReuseModel");
        },

        /**
         * Hide or show the header items accoding to the users column preferences
         *
         * @private
         */
        _setHeaderItemsVisible: function() {
            var aDefaultCols = this.getView().getModel("P13nTableModel").oData.Columns;

            if (aDefaultCols) {
                for (var i = 0; i < aDefaultCols.length; i++) {
                    if(this.byId(aDefaultCols[i].id)) {
                        this.byId(aDefaultCols[i].id).setVisible(aDefaultCols[i].visible);
                    }
                }
            }
        },

        _getSplitApp: function() {
            if (!this._oSplitApp) {
                this._oSplitApp = this.getView().getController().getOwnerComponent().getAggregation("rootControl").getContent()[1];
            }
            return this._oSplitApp;
        },

        /**
         * Triggers request to read personalization data. Passes success handler to set calendar view based on p13n data.
         *
         * @private
         * @returns {void}
         */
        _readP13n: function() {
            P13nHelper.readData(this.getOwnerComponent()._calViewP13n, function(oPersData) {
                // Check if view key from p13n is valid and is not equal to current view key
                if (P13nHelper.validateViewKey(oPersData) && this._oPlanningCalendar.getViewKey() !== oPersData) {
                    // Set the viewKey based on p13n value
                    this.byId("resourcePlanningCalendarId").setViewKeyFromP13n(oPersData);
                } else {
                    // else if viewKey not valid fire viewChange event of calendar and pass parameter to indicate that p13n should not be updated
                    this._oPlanningCalendar.fireViewChange({bPreventP13Update: true});
                }
                this._oPlanningCalendar.setBusy(false);
            }.bind(this), function() {
                // If reading p13n fails fire calendar viewChange event that triggers data load
                this._oPlanningCalendar.fireViewChange({bPreventP13Update: true});
                this._oPlanningCalendar.setBusy(false);
            }.bind(this));
            this._oPlanningCalendar.setBusy(true);
        },

        _readp13nPersCal: function() {
            P13nHelper.readData(this.getOwnerComponent()._calPersP13n, function(oPersData) {
                if (oPersData !== undefined) {
                    this._oView.getModel("p13nModel").setProperty("/calPersKey", oPersData);
                }
                else {
                    this._oView.getModel("p13nModel").setProperty("/calPersKey", {empId: false, country: false, orgTxt: false, orgId: false});
                }
            }.bind(this), function() {
                // if p13n request fails set to default view key
                this._oView.getModel("p13nModel").setProperty("/calPersKey", {empId: false, country: false, orgTxt: false, orgId: false});
            }.bind(this));
        },

        /**
         * Check p13n client model for a value. If none present requests data from p13n service.
         * 
         * @private
         * @returns {void}
         */
        _readp13nSortCal: function() {
            P13nHelper.readData(this.getOwnerComponent()._calSortP13n, function(oSortOptionData) {
                if (oSortOptionData) {
                    var oSorter = new sap.ui.model.Sorter(oSortOptionData.sortItem, oSortOptionData.sortDescending),
                        oDataModel = this._oPlanningCalendar.getBinding("rows");

                    // sorting must be done on client side
                    oDataModel.bClientOperation = true;
                    oDataModel.aAllKeys = true;
                    oDataModel.sOperationMode = "Client";
                    oDataModel.sort(oSorter);
                    oDataModel.bClientOperation = false;
                    oDataModel.aAllKeys = null;
                    oDataModel.sOperationMode = "Server";

                    this._oView.getModel("p13nModel").setProperty("/calSortKey", oSortOptionData);
                }
            }.bind(this));
        }

    });

});