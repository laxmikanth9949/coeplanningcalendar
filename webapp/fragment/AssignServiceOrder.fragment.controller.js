sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/coe/capacity/reuselib/utils/messages",
    "sap/coe/planning/calendar/util/helpers",
    "sap/coe/planning/calendar/util/formatter",
    "sap/coe/capacity/reuselib/utils/formatter",
    "sap/coe/planning/calendar/util/i18n",
    "sap/coe/planning/calendar/fragment/AssignmentsWarningHelper.fragment.controller",
    "sap/coe/capacity/reuselib/utils/ErrorCodeHelper"
], function(Controller, Messages, helpers, formatter, formatterReuse, i18n, AssignmentsWarningHelper, ErrorCodeHelper) {

    "use strict";

    var that;

    return Controller.extend("sap.coe.planning.calendar.fragment.AssignServiceOrder.fragment", {
        formatter: formatter,
        formatterReuse: formatterReuse,
        /**
         * Before the assign service order fragment is opened, set the assignment details, set the
         * save all button to true or false based on the amount of selected items, set the status
         * header to the first item in the list
         *
         * @public
         * @param {object} oEvent - the object that calls the function
         * @returns {void}
         */
        onBeforeOpen: function(oEvent) {
            that = oEvent.getSource().getController();

            var oFragment = oEvent.getSource(),
                oParentController = oFragment.getParent().getController();

            this.iAmountOfItemsCurrentlySelected = oParentController.getOwnerComponent().byId("master--worklistTable").getSelectedItems().length;

            this.oParentController = oParentController;
            this.setAssignmentWarningDetails();

            var aItemsSelected = oParentController.getOwnerComponent().byId("master--worklistTable").getSelectedItems();
            this.aItemBindingPath = [];
            for (var i = 0; i < aItemsSelected.length; i++) {
                this.aItemBindingPath.push(this.getView().getModel("MasterListModel").getProperty(aItemsSelected[i].getBindingContextPath()).ItemGUID);
            }
            this.setStatusHeaderToFirstListItem();
        },
        /**
         * When the dates are changed, set the date in the assingnment warning helper so that the
         * warning message can be displayed if necessary
         * @public
         * @returns {void}
         */
        onDatesChanged: function() {
            var oCurrentAssignment = this.getView().getModel("AssignSelectedOrderDialogModel").oData[0];
            AssignmentsWarningHelper.setDatesForAssignment(oCurrentAssignment.BegDate, oCurrentAssignment.EndDate, oCurrentAssignment.StartTime, oCurrentAssignment.EndTime);
        },
        /**
         * When the save button is clicked get the the first item in the model which will be the
         * current one, then if the check passes create (assign) that assignment
         *
         * @public
         * @param {object} oEvent - the object that calls the function
         * @returns {void}
         */
        onSaveAssignServiceOrder: function(oEvent) {
            var aGlobalDialogData = this.getView().getModel("AssignSelectedOrderDialogModel").oData,
                oCurrentAssignment = AssignmentsWarningHelper.displayWarningMessageWhenNeeded(aGlobalDialogData[0]);

            if (AssignmentsWarningHelper.getWarningAccepted()) {
                this.getView().setBusy(true);
                var oAssignmentRequest = this._createAssignmentRequest(oCurrentAssignment);

                this._createSingleAssignment(oAssignmentRequest);
            }
        },

        onCloseDialog: function(oEvent) {
            var oDialog = oEvent.getSource().getParent();
            oDialog.close();

            //TODO: Make it possible to close all.
        },

        /**
         * Calls function in parent controller to nav to SO line item in CRM
         *
         * @public
         * @returns {void}
         */
        onItemDescriptionLinkPress: function() {
            this.oParentController.onItemDescriptionLinkPress();
        },

        onAddPersonToAssignment: function(oEvent) {
            this.getView().getModel("AssignSelectedOrderDialogModel").getData().push({});
            this.getView().getModel("AssignSelectedOrderDialogModel").refresh();
        },

        /**
         * Loops through all the selected items and assigns each of them
         *
         * @public
         * @param {object} oEvent - the object that calls the function
         * @returns {void}
         */
        onSaveAllAssignServiceOrder: function(oEvent) {
            var aSelectedItems = this.oParentController.getOwnerComponent().byId("master--worklistTable").getSelectedItems(),
                aSelectedPeople = this.oParentController.byId("resourcePlanningCalendarId").getAggregation("dependents")[0].getSelectedRows(),
                iAmountOfSelectedItems = aSelectedItems.length,
                oTable = this.getView().getParent().byId("resourcePlanningCalendarId").getDependents()[0];

            oTable.setBusy(true);
            for (var i = 0; i < iAmountOfSelectedItems; i++) {

                var oDataFromSelectedItems = this.oParentController._createObjectForAssignmentDialog(aSelectedItems[i].getBindingContextPath(),
                aSelectedPeople[0].getBindingInfo("text").binding.oContext);

                var oRequest = this._createAssignmentRequest(oDataFromSelectedItems);
                this._createSingleAssignment(oRequest);
            }
        },
        /**
         * Gets all the selected items in the list and returns the item whose guid matched the guid passed as parameter
         *
         * @public
         * @param {string} sItemGuid - string representing the item guid which is a unique identifier
         * @returns {object} - object with guid matching the passed parameter
         */
        _getFromSelectedItemsByGuid: function(sItemGuid) {

            var aSelectedItems = this.oParentController.getOwnerComponent().byId("master--worklistTable").getSelectedItems(),
                aMatchedItem = aSelectedItems.filter(function(oItem){
                    return that.getView().getModel("MasterListModel").getProperty(oItem.getBindingContextPath()).ItemGUID === sItemGuid;
                });

            return aMatchedItem[0];
        },

        //TODO: where is this function called from?
        _removeAllItemsFromMasterList: function() {
            var oMasterList = this.oParentController.getOwnerComponent().byId("master--worklistTable");

            oMasterList.getSelectedItems().forEach(function(selectedItem) {
                oMasterList.removeItem(selectedItem);
            });

            this._closeDialogWhenFinished();
        },
        /**
         * Takes the assignment object as a parameter and manipulates it into an object which can be passed to the oData
         * service to create an assignment
         *
         * @public
         * @param {object} oCurrentAssignment - object which calls the function
         * @returns {void}
         */
        _createAssignmentRequest: function(oCurrentAssignment) {
            var dBegDate = oCurrentAssignment.BegDate,
                dEndDate = oCurrentAssignment.EndDate,
                dBegTstmp = oCurrentAssignment.BegDate,
                dEndTstmp = oCurrentAssignment.EndDate;

            dBegTstmp.setHours(oCurrentAssignment.StartTime.getHours());
            dBegTstmp.setMinutes(oCurrentAssignment.StartTime.getMinutes());

            dEndTstmp.setHours(oCurrentAssignment.EndTime.getHours());
            dEndTstmp.setMinutes(oCurrentAssignment.EndTime.getMinutes());
            //TODO: Calc with the timezone?
            return {
                "BegDate": formatter.removeTimeOffset(dBegDate),
                "EndDate": formatter.removeTimeOffset(dEndDate),
                "ItemGuid": oCurrentAssignment.ItemGUID,
                "ResGuid": oCurrentAssignment.ResGuid,
                "BegTstmp": formatter.removeTimeOffset(dBegTstmp),
                "EndTstmp": formatter.removeTimeOffset(dEndTstmp)
            };
        },
        /**
         * Take the parameter oRequest and creates an assignment by adding it tot the assignment list, if succesful remove
         * the item from the master list, otherwise display a warning message
         *
         * @public
         * @param {object} oRequest - object for the oData service to create an assignment
         * @returns {void}
         */
        _createSingleAssignment: function(oRequest) {
            var that = this;

            this.getView().getModel().create("/AssignmentList", oRequest, {
                success: function(oResponse) {
                    that.getView().setBusy(false);
                    if (oResponse.GWMsg === "CREATE_SUCCESS") {
                        if(oResponse.Gwmsg1 && oResponse.Gwmsg2 ){
                            sap.m.MessageBox.warning("The Demand ID & Item No:" + " " + oResponse.Gwmsg1 +" \n\n" + oResponse.Gwmsg2);
                        
                        }
                        that._removeItemFromMasterList(oResponse.ItemGuid);
                        //sap.m.MessageToast.show(i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_" + oResponse.GWMsg));
                        
                        sap.git.usage.MobileUsageReporting.postEvent("RSD Calendar - Demand Staffed", that.getOwnerComponent());
                    }
                    else{
                        that._displayAssignmentFailureDialog(oResponse.ItemGuid);
                    }
                },
                error: function(oResponse) {
                    that.getView().setBusy(false); 
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
                        oDemand = that.getView().getModel().getProperty("/ResDemandSet('" + sItemGuid + "')"), 
                        oOrg = that.getView().getModel().getProperty("/ResServiceTeamSet('" + oDemand.Organization + "')"),
                        aErrorCodes = sErrorMsg.error.innererror.errordetails,
                        sErrorMsgDisplay = "";

                    sErrorMsgDisplay += ErrorCodeHelper.getMessageForErrorCodes(aErrorCodes, oDemand, oOrg);
                    ErrorCodeHelper.displaySoErrorDialog(sErrorMsgDisplay);
        },

        /**
         * Uses the parameter to get the object from the selected items and uses that object to
         * display a warning message whem the assignment of an item (SO) is not succesful
         *
         * @public
         * @param {string} sItemGuid - object for the oData service to create an assignment
         * @returns {void}
         */
        _displayAssignmentFailureDialog: function(sItemGuid) {
            var oDemand = this.getView().getModel().getProperty("/ResDemandSet('" + sItemGuid + "')"), 
                oOrg = this.getView().getModel().getProperty("/ResServiceTeamSet('" + oDemand.Organization + "')"),
                sServiceTeam = oOrg === undefined ? "" : oOrg.ServiceTeamName,
                sId = oDemand.DemandID,
                sText = i18n.getText("ASSIGNMENT_FAILURE_DIALOG1") + formatter.toInteger(sId) + " " + i18n.getText("ASSIGNMENT_FAILURE_DIALOG2") 
                    + formatter.toInteger(sId) + " " + i18n.getText("ASSIGNMENT_FAILURE_DIALOG3") + " " + formatter.toInteger(sId) 
                    + " " + i18n.getText("ASSIGNMENT_FAILURE_DIALOG4") + " " + sServiceTeam + i18n.getText("ASSIGNMENT_FAILURE_DIALOG5");

            sap.m.MessageBox.error(sText, {
                    title: "Error",
                    styleClass: "",
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
        },

        /**
         * Bypasses date selection, calls backwards schedule directly and then create the staffing
         *
         * @public
         * @returns {void}
         */
        createAssignment: function() {
            var aDialogData = this.getView().getModel("AssignSelectedOrderDialogModel").oData,
                oCurrentAssignment = AssignmentsWarningHelper.setBackwardScheduledDate(aDialogData[0]),
                oAssignmentRequest;

                this.getView().setBusy(true);
                oAssignmentRequest = this._createAssignmentRequest(oCurrentAssignment);

                this._createSingleAssignment(oAssignmentRequest);
        },

        _updateList: function(sItemGuid) {
            // Request Resource Demand using itemGuid of assignment being staffed
            this.getView().getModel().read("/ResDemandSet('" + sItemGuid + "')", {
                    success: function(oResponse) {
                        var oMasterListModel = this.getView().getModel("MasterListModel");
                        oMasterListModel.updateBindings(true);
                    }.bind(this),
                    error: function() {
                        // Return error to console for information
                        jQuery.sap.log.error("ResDemand could not be retrieved for assignment " + sItemGuid);
                    }
                });
        },
    
        _shouldItemBeRemoved: function( oServiceOrder) {
            // checks the global dialog fragment to compare dates to duration
            // returns true if end date - start >= duration
            var aGlobalDialogData = this.getView().getModel("AssignSelectedOrderDialogModel").oData,
            oMasterList = this.oParentController.getOwnerComponent().byId("master--worklistTable");
            var iDays = formatter.daysDifference(aGlobalDialogData[0].BegDate, aGlobalDialogData[0].EndDate);

            //TODO multiselect check to be enhanced to allow BO not be removed during multi staff
            if(oServiceOrder.ProductID !== "9502770" || iDays >=  aGlobalDialogData[0].Duration || oMasterList.getMode() === "MultiSelect"){ //not a BO or fully staffed
                return true;
            }

            else if(oServiceOrder.StaffingLevel === "A"){ //unstaffed
                this._updateList(oServiceOrder.ItemGUID);               
            }
            return false;
        },
        /**
         * Uses the parameter to find and remove the object from the master list, sets the model property soAssigned
         * to true which is used onRouteMatched in the resource demand list as a flag for deselecteding all the worklist items
         * display a warning message whem the assignment of an item (SO) is not succesful
         *
         * @public
         * @param {string} sItemGuid - object for the oData service to create an assignment
         * @returns {void}
         */
        _removeItemFromMasterList: function(sItemGuid) {
            var that = this,
                oMasterList = this.oParentController.getOwnerComponent().byId("master--worklistTable"),
                aSelectedItems = oMasterList.getSelectedItems(),
                oMasterListModel = this.getView().getModel("MasterListModel"),
                oMasterListItems = oMasterListModel.getProperty("/ResDemandSet"),
                aItemToRemove = aSelectedItems.filter(function(oItem){
                    return that.getView().getModel("MasterListModel").getProperty(oItem.getBindingContextPath()).ItemGUID === sItemGuid;
                });
                //
            if (aItemToRemove.length !== 0) {
                for (var i = 0; i <= oMasterListItems.length; i++) {
                    if (oMasterListItems[i].ItemGUID === sItemGuid) {
                        if(this._shouldItemBeRemoved(oMasterListItems[i])){ //represents BO
                            oMasterListItems.splice(i, 1);
                        }
                        
                        oMasterListModel.updateBindings(true);
                        this.isListEmptyDisableAssignButton(oMasterListItems);
                        break;
                    }
                }
                this.getView().getModel("worklistSelectedItems").setProperty("/soAssigned", true);
            }
            this._closeDialogWhenFinished();
        },

        //check if the list is empty, if so disable assign button becuase we have no SO's in the master list to assign
        isListEmptyDisableAssignButton: function(oMasterList) {
            if(oMasterList.length === 0){
               this.oParentController._setEnabledForAssignSelectedItemsButton(false);
            }
        },

        /**
         * Closes the staffing dialog
         *
         * @public
         * @returns {void}
         */
        closeStaffingDialog: function() {
            this._removeItemFromMasterList();
        },

        /**
         * Makes sure the correct items are selected in the list, set the header to be the first selected item
         *
         * @public
         * @returns {void}
         */
        setStatusHeaderToFirstListItem: function() {
            var oMasterList = this.oParentController.getOwnerComponent().byId("master--worklistTable"),
                aItemsToBeSelected = [],
                oItems = oMasterList.getItems();

            if (this.aItemBindingPath !== undefined) {
                for (var i = 0; i < this.aItemBindingPath.length; i ++) {
                    for (var j = 0; j < oItems.length; j ++) {
                        var sSelectedItemGUID = this.getView().getModel("MasterListModel").getProperty(oItems[j].getBindingContextPath()).ItemGUID;
                        if (sSelectedItemGUID === this.aItemBindingPath[i]) {
                            aItemsToBeSelected.push(oItems[j]);
                        }
                    }
                }

                oMasterList.removeSelections();
                for (var k = 0; k < aItemsToBeSelected.length; k ++) {
                    aItemsToBeSelected[k].setSelected(true);
                }
            }            

            this.oParentController.updateStatusHeader(oMasterList.getSelectedItems(), oMasterList.getSelectedItems()[0], true);
        },

        /**
         * Use the controller parameter to access the master list, gets the binding context of the first item and uses
         * that to return the corrosponding item in the model
         *
         * @public
         * @param {object} oController - object which is a controller used to access the master list
         * @returns {void}
         */
        _getSelectedAssignment: function (oController) {
            var sPathSelected = oController.getOwnerComponent().byId("master--worklistTable").getSelectedItems()[0].getBindingContextPath(),
                iAssignmentSelected = sPathSelected.split("/")[2],
                oAssignmentSelected = this.getView().getModel("MasterListModel").oData.ResDemandSet[iAssignmentSelected];

            return oAssignmentSelected;
        },

        /**
         * Gets the current assignment and initializes the assignment warning helper while passing over the
         * properties that are needed in the helper to function correctly
         *
         * @public
         * @returns {void}
         */
        setAssignmentWarningDetails: function(){
           var oCurrentAssignment = this._getSelectedAssignment(this.oParentController),
                iAssignmentDuration = parseFloat(oCurrentAssignment.Duration),
                iAssignmentCalloff = parseFloat(oCurrentAssignment.Calloffincl);

            AssignmentsWarningHelper.initialize(oCurrentAssignment.StartDate, oCurrentAssignment.EndDate, iAssignmentDuration, iAssignmentCalloff, this);

        },

        /**
         * Is called when an item has been removed from the list, if the list is now empty then hide the header and the
         * assign items button and fire a search of the filterbar
         * If there is still items in the list, call the fucntion to fill the model with the next item details, set the warning details
         * and update the header with the next (first) item
         *
         * @public
         * @returns {void}
         */
        _closeDialogWhenFinished: function(){
            var oMasterList = this.oParentController.getOwnerComponent().byId("master--worklistTable"),
                iMasterListItems = oMasterList.getItems().length;

                this.iAmountOfItemsCurrentlySelected --;

            if (iMasterListItems <= 0 && this.iAmountOfItemsCurrentlySelected === 0 && this.oParentController._assignSelectedItems.isOpen()) {
                this.oParentController._assignSelectedItems.close();
                this.oParentController._setEnabledForAssignSelectedItemsButton(false);
                this.getView().getParent().byId("filterBar").search();
            }
            else if (this.iAmountOfItemsCurrentlySelected === 0 && this.oParentController._assignSelectedItems.isOpen()) {
                oMasterList.removeSelections();
                oMasterList.setSelectedItem(oMasterList.getItems()[0]);
                this.oParentController.updateHeader("MasterListModel>/ResDemandSet/0");
                this.oParentController._assignSelectedItems.close();
                this.getView().getParent().byId("filterBar").search();
            }
            else {
                this.setStatusHeaderToFirstListItem();
                this.oParentController._fillGlobalAssignmentModelWithData();
                this.setAssignmentWarningDetails();
            }
        }
    });

});