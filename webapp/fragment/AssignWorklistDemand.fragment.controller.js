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

    return Controller.extend("sap.coe.planning.calendar.fragment.AssignWorklistDemand.fragment", {
        formatter: formatter,
        formatterReuse: formatterReuse,

        onBeforeOpen: function(oEvent) {
            that = oEvent.getSource().getController();

            this._oDialog = oEvent.getSource();

            var oFragment = oEvent.getSource(),
                oParentController = oFragment.getParent().getController();

            this.oParentController = oParentController;
            this.setAssignmentWarningDetails();

            this.oDemand = this.getView().getModel("WorklistDemandsToStaff").getProperty("/");

            if (this.oDemand.EditMode) {
                this._oDialog.setTitle(i18n.getText("FRAGMENT_EDIT_SERVICE_ORDER_TITLE"));
            }
            else {
                this._oDialog.setTitle(i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_TITLE"));
            }
        },

        /**
         * When the dates are changed, set the date in the assingnment warning helper so that the
         * warning message can be displayed if necessary
         * @public
         * @returns {void}
         */
        onDatesChanged: function() {
            var oCurrentAssignment = this.getView().getModel("WorklistDemandsToStaff").oData[0];
            AssignmentsWarningHelper.setDatesForAssignment(oCurrentAssignment.BegDate, oCurrentAssignment.EndDate, oCurrentAssignment.StartTime, oCurrentAssignment.EndTime);
        },

        /**
         * Calls update/create functions depending on whether dialog is in 'edit mode'
         *
         * @public
         * @returns {void}
         */
        onSaveAssignServiceOrder: function() {
            if (this.oDemand.EditMode) {
                this.onEditAssignServiceOrder();
            }
            else {
                this.onCreateAssignServiceOrder();
            }
        },

        onCreateAssignServiceOrder: function() {
            var aDialogData = this.getView().getModel("WorklistDemandsToStaff").oData,
                oCurrentAssignment = AssignmentsWarningHelper.displayWarningMessageWhenNeeded(aDialogData[0]);

            if (AssignmentsWarningHelper.getWarningAccepted()) {
                this.getView().setBusy(true);
                var oAssignmentRequest = this._createAssignmentRequest(oCurrentAssignment);

                this._createSingleAssignment(oAssignmentRequest);
            }
        },

        /**
         * Display warning message (for assignment dates, if needed) and create assignment request body
         *
         * @public
         * @param {string} sItemGuid - string representing the item guid which is a unique identifier
         * @returns {object} - object with guid matching the passed parameter
         */
        onEditAssignServiceOrder: function() {
            var aDialogData = this.getView().getModel("WorklistDemandsToStaff").oData,
                oCurrentAssignment = AssignmentsWarningHelper.displayWarningMessageWhenNeeded(aDialogData[0]);

            if (AssignmentsWarningHelper.getWarningAccepted()) {
                this.getView().setBusy(true);
                var oAssignmentRequest = this._createEditAssignmentRequest(oCurrentAssignment);

                this._updateAssignment(oAssignmentRequest);
            }
        },

        onCloseDialog: function(oEvent) {
            var oDialog = oEvent.getSource().getParent();
            var oModel = this.getView().getModel("WorklistDemandsToStaff"),
            oData = oModel.getData();

            oData.shift();
            this._closeDialogWhenFinished(oModel); 
            //oDialog.close();

            //TODO: Make it possible to close all.
        },

        onItemDescriptionLinkPress: function() {
            this.oParentController.onItemDescriptionLinkPress();
        },

        onAddPersonToAssignment: function(oEvent) {
            this.getView().getModel("AssignSelectedOrderDialogModel").getData().push({});
            this.getView().getModel("AssignSelectedOrderDialogModel").refresh();
        },

        _getFromSelectedItemsByGuid: function(sItemGuid) {
            var aSelectedItems = this.oParentController.getOwnerComponent().byId("master--worklistTable").getSelectedItems(),
                aMatchedItem = aSelectedItems.filter(function(oItem){
                    return that.getView().getModel("MasterListModel").getProperty(oItem.getBindingContextPath()).ItemGUID === sItemGuid;
                });

            return aMatchedItem[0];     
        },

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
         * Create assignment request body
         *
         * @public
         * @param {Object} oCuurentAssignment - the assignment we're currently editing
         * @returns {Object} - object with request body
         */
        _createEditAssignmentRequest: function(oCurrentAssignment) {
            var dBegDate = oCurrentAssignment.BegDate,
                dEndDate = oCurrentAssignment.EndDate;

                dBegDate.setHours(oCurrentAssignment.StartTime.getHours());
                dBegDate.setMinutes(oCurrentAssignment.StartTime.getMinutes());
                dBegDate.setSeconds(oCurrentAssignment.StartTime.getSeconds());

                dEndDate.setHours(oCurrentAssignment.EndTime.getHours());
                dEndDate.setMinutes(oCurrentAssignment.EndTime.getMinutes());
                dEndDate.setSeconds(oCurrentAssignment.EndTime.getSeconds());

            var startDateTimeFormatted = sap.coe.capacity.reuselib.utils.formatter.removeTimeOffset(dBegDate),
                endDateTimeFormatted = sap.coe.capacity.reuselib.utils.formatter.removeTimeOffset(dEndDate);

            return {
                "AsgnGuid": oCurrentAssignment.AsgnGUID,
                "EmpID": oCurrentAssignment.EmpID,
                "BegDate": startDateTimeFormatted.toJSON().split(".")[0],
                "EndDate": endDateTimeFormatted.toJSON().split(".")[0],
                "ItemGuid": oCurrentAssignment.ItemGUID,
                "ResGuid": oCurrentAssignment.ResGuid,
                "BegTstmp": startDateTimeFormatted.toJSON().split(".")[0],
                "EndTstmp": endDateTimeFormatted.toJSON().split(".")[0],
                "Description": oCurrentAssignment.ItemDescription
            };
        },

        /**
         * Calls service to create an assignment
         *
         * @public
         * @param {Object} oRequest - the request body of the assignment
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
                        that._updateWorkListWithSavedRecord(oResponse.ItemGuid);
                        that._removeItemFromModel(oResponse.ItemGuid);
                        sap.m.MessageToast.show(i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_" + oResponse.GWMsg));
                        
                        sap.git.usage.MobileUsageReporting.postEvent("RSD Worklist - Demand Staffed", that.getOwnerComponent());
                    }
                    else{
                        that._displayAssignmentFailureDialog(oResponse.ItemGuid);
                    }
                },
                error: function(oResponse) {
                    that.getView().setBusy(false);
                    that._removeItemFromModel(JSON.parse(oResponse.responseText).error.message.value);
                    that._displayAssignmentFailureDialogOnErrorResponse(oResponse);
                }
            });
        },

        /**
         * Bypasses date selection, calls backwards schedule directly and then create/update staffing
         *
         * @public
         * @returns {void}
         */
        createAssignment: function() {
            var aDialogData = this.getView().getModel("WorklistDemandsToStaff").oData,
                oCurrentAssignment = AssignmentsWarningHelper.setBackwardScheduledDate(aDialogData[0]),
                oAssignmentRequest;

            if (this.oDemand.EditMode) {
                this.getView().setBusy(true);
                oAssignmentRequest = this._createEditAssignmentRequest(oCurrentAssignment);

                this._updateAssignment(oAssignmentRequest);
            }
            else {
                this.getView().setBusy(true);
                oAssignmentRequest = this._createAssignmentRequest(oCurrentAssignment);

                this._createSingleAssignment(oAssignmentRequest);
            }
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
         * Send an update request to update the details of the assignment
         *
         * @public
         * @param {Object} oRequest - request body
         * @returns {object} - object with guid matching the passed parameter
         */
        _updateAssignment: function(oRequest) {
            var that = this,
                sUrl = "/AssignmentList(EmpID='" + oRequest.EmpID + "',BegDate=datetime'" + oRequest.BegDate + "',EndDate=datetime'" + oRequest.EndDate + "',AsgnGuid='" + oRequest.AsgnGuid + "')";

            this.getView().getModel().update(sUrl, oRequest, {
                success: function(oData,oResponse) {
                    that.getView().setBusy(false);
                    that._updateWorkListWithSavedRecord(that.oDemand[0].ItemGUID);
                    that._removeItemFromModel(that.oDemand[0].ItemGUID);
                    sap.m.MessageToast.show(i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_UPDATE_SUCCESS"));
                    if(oResponse.headers.warning){
                        sap.m.MessageBox.warning(oResponse.headers.warning);

                    }
                },
                error: function(oResponse) {
                    that.getView().setBusy(false);
                    that._displayAssignmentFailureDialogOnErrorResponse(oResponse);
                }
            });
        },

        /**
         * modification NGIPIRELAND05-481 - update records after save without refreshing worklist
         * alternative, not backend related solution might be possible
         * @private
         */
        _updateWorkListWithSavedRecord: function(sItemGuid) {
            this.getView().getModel().read("/ResDemandSet('" + sItemGuid + "')");
        },

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

        _removeItemFromModel: function(sItemGuid) {
            var oModel = this.getView().getModel("WorklistDemandsToStaff"),
                oData = oModel.getData();

            oData.shift();
            this._closeDialogWhenFinished(oModel);
        },

        _getSelectedAssignment: function (oController) {
            var aSelectedItems = this.getView().getModel("WorklistDemandsToStaff").getData(),
                sPathSelected = aSelectedItems[0].getBindingContextPath(),
                //iAssignmentSelected = sPathSelected.split("/")[2],
                oAssignmentSelected = this.getView().getModel().getProperty(sPathSelected);

            return oAssignmentSelected;
        },

        setAssignmentWarningDetails: function(){
           var oCurrentAssignment = this.getView().getModel("WorklistDemandsToStaff").getData()[0],
                iAssignmentDuration = parseFloat(oCurrentAssignment.Duration),
                iAssignmentCalloff = parseFloat(oCurrentAssignment.Calloffincl);

            AssignmentsWarningHelper.initialize(oCurrentAssignment.StartDate, oCurrentAssignment.EndDate, iAssignmentDuration, iAssignmentCalloff, this);

        },

        /**
         * Closes the staffing dialog
         *
         * @public
         * @returns {void}
         */
        closeStaffingDialog: function() {
            this._removeItemFromModel();
        },

        _closeDialogWhenFinished: function(oModel){
            if ((oModel.getData().length <= 0 && this.oParentController._assignWorklistItems.isOpen())) {
                this.oParentController._assignWorklistItems.close();
                // modification NGIPIRELAND05-481
                // refresh of the filters and worklist data is not requested anymore for performance reasons
                // data refresh will require explicit command by the user
                /*
                this.oParentController.byId("ServiceDemandFilterBar").byId("idForStaffingLevel").setSelectedKeys(["A", "B"]);
                var aSelectedFilters = this.oParentController.aCurrentFilters;
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
                this.oParentController.byId("ServiceDemandFilterBar").fireEvent("search", {
                    filters: aSelectedFilters
                });
                // Looping through table rows to clear assignment column of changes saved to service
                var oTable = this.oParentController.byId("worklistTable"),
                    aTableItems = oTable.getAggregation("items"),
                    iAssignColumn = this.oParentController.byId("assignResCol").getInitialOrder();
                for (var i = 0; i < aTableItems.length; i++) {
                    aTableItems[i].getCells()[iAssignColumn].getItems()[0].getFragment().setValue("");
                }
                */
            } else {
                this.setAssignmentWarningDetails();
                this.getView().getModel("WorklistDemandsToStaff").updateBindings(true);
            }
        }
    });

});
