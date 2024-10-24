sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/coe/planning/calendar/util/formatter",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/coe/capacity/reuselib/utils/P13nHelper"
], function(Controller, Formatter, Sorter, JSONModel, P13nHelper) {
    "use strict";

    return Controller.extend("sap.coe.planning.calendar.fragment.SortTable.fragment", {
        formatter: Formatter,

        onBeforeOpen: function(oEvent) {
            var aColumns = oEvent.getSource().getModel().oData.Columns,
                oRadioGroupSortItems = this.byId("sortItemKey"),
                oRadioGroupSortOrder = this.byId("sortOrderKey"),
                iIndexToBeSelected = 0,
                sSelectedSorter = "",
                iSortDescending = 0,
                aSorters = this.getView().getParent().byId("worklistTable").getBinding("items").aSorters;

            // check's if the table has a sorting applied, otherwise use the default/saved preference
            if (aSorters.length > 0) {
                sSelectedSorter = aSorters[0].sPath;
                iSortDescending = aSorters[0].bDescending === true ? 1 : 0;
                oRadioGroupSortOrder.setSelectedIndex(iSortDescending);
            }
            else {
                sSelectedSorter = "StartDate";
                oRadioGroupSortOrder.setSelectedIndex(0);
            }

            // assign the sort key value for the columns
            for (var i = 0; i < aColumns.length; i++) {
                switch (aColumns[i].id) {
                    case "scopeDate":
                        aColumns[i].sortKey = "ScopeDate";
                        break;
                    case "cwCol":
                        aColumns[i].sortKey = "CalenderWeek";
                        break;
                    case "startDateCol":
                        aColumns[i].sortKey = "StartDate";
                        break;
                    case "startTimeCol":
                        aColumns.splice(i, 1);
                        break;
                    case "endDateCol":
                        aColumns[i].sortKey = "EndDate";
                        break;
                    case "endTimeCol":
                        aColumns.splice(i, 1);
                        break;
                    case "callOffCol":
                        aColumns[i].sortKey = "Calloffincl";
                        break;
                    case "customerCol":
                        aColumns[i].sortKey = "Customer";
                        break;
                    case "demandIdCol":
                        aColumns[i].sortKey = "DemandID";
                        break;
                    case "itemNoCol":
                        aColumns[i].sortKey = "ItemNo";
                        break;
                    case "headerDescCol":
                        aColumns[i].sortKey = "HeaderDescription";
                        break;
                    case "itemDescriptionCol":
                        aColumns[i].sortKey = "ItemDescription";
                        break;
                    case "qualifiationDescriptionCol":
                        aColumns[i].sortKey = "FirstQualificationDescription";
                        break;
                    case "firstNameCol":
                        aColumns[i].sortKey = "FirstName";
                        break;
                    case "lastNameCol":
                        aColumns[i].sortKey = "LastName";
                        break;
                    case "ratingCol":
                        aColumns[i].sortKey = "Rating";
                        break;
                    case "headerStatusCol":
                        aColumns[i].sortKey = "HeaderStatusTxt";
                        break;
                    case "dataProtectionCol":
                        aColumns[i].sortKey = "DataProtect";
                        break;
                    case "customerERPCol":
                        aColumns[i].sortKey = "ERPCustomerNo";
                        break;
                    case "premiumEngagementCol":
                        aColumns[i].sortKey = "PremiumEng";
                        break;
                    case "userNameCol":
                        aColumns[i].sortKey = "EmpID";
                        break;
                    case "assignStartDateCol":
                        aColumns[i].sortKey = "AssignmentStartDate";
                        break;
                    case "assignStartTimeCol":
                        aColumns.splice(i, 1);
                        break;
                    case "assignEndDateCol":
                        aColumns[i].sortKey = "AssignmentEndDate";
                        break;
                    case "assignEndTimeCol":
                        aColumns.splice(i, 1);
                        break;
                    case "serviceTeamCol":
                        aColumns[i].sortKey = "STName";
                        break;
                    case "userStatusCol":
                        aColumns[i].sortKey = "UserStatusTxt";
                        break;
                    case "effortCol":
                        aColumns[i].sortKey = "Duration";
                        break;
                    case "assignCountry":
                        aColumns[i].sortKey = "Country";
                        break;
                    default:
                        break;
                }

                // when columns have been removed from the model but it's length remains the same
                if (aColumns[i] === undefined) {break;}

                if (aColumns[i].id !== "startTimeCol" || aColumns[i].id !== "endTimeCol" || aColumns[i].id !== "assignStartTimeCol" || aColumns[i].id !== "assignEndTimeCol") {
                    var oNewButton = new sap.m.RadioButton({
                        id: aColumns[i].sortKey,
                        text: sap.coe.planning.calendar.util.formatter.retrieveColumnHeader(aColumns[i].id)
                    });
                    oRadioGroupSortItems.addButton(oNewButton);
                    // find index of radio button to be pre-selected
                    if (aColumns[i].sortKey === sSelectedSorter) {
                        iIndexToBeSelected = i;
                    }
                }
            }

            oRadioGroupSortItems.setSelectedIndex(iIndexToBeSelected);
        },

        onConfirm: function(oEvent) {
            var oWorklistView = this.getView().getParent(),
                oTable = oWorklistView.byId("worklistTable"),
                oBinding = oTable.getBinding("items"),
                sPath = this.byId("sortItemKey").getSelectedButton().getId(),
                sSelectedOrder = this.byId("sortOrderKey").getSelectedButton().getId(),
                bDescending = sSelectedOrder.toLowerCase().indexOf("ascending") === -1 ? true : false,    
                oSorter = new sap.ui.model.Sorter(sPath, bDescending);

            if (sPath === "Calloffincl") {
                oSorter.fnCompare = function(value1, value2) {
                value2 = parseFloat(value2);
                value1 = parseFloat(value1);
                    if (value1 < value2) return -1;
                       if (value1 === value2) return 0;
                       if (value1 > value2) return 1;
                };
            }

            this._handleModelOperationsInClient(oBinding, true);
            oBinding.sort(oSorter);
            this._handleModelOperationsInClient(oBinding, false);

            P13nHelper.saveData(this.getView().getParent().getController()._oOwnerComponent._tableSortP13n, {sortItem: sPath, sortDescending: bDescending});
            this.byId("sortItemKey").destroyButtons();
            oEvent.getSource().getParent().close();
        },

        _handleModelOperationsInClient: function(oDataModel, bPerformInClient) {
            if (bPerformInClient) {
                oDataModel.bClientOperation = true;
                oDataModel.aAllKeys = true;
                oDataModel.sOperationMode = "Client";
            } else {
                oDataModel.bClientOperation = false;
                oDataModel.aAllKeys = null;
                oDataModel.sOperationMode = "Server";
            }
        },

        onCancel: function(oEvent) {
            this.byId("sortItemKey").destroyButtons();
            oEvent.getSource().getParent().close();
        }
    });
});
