sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/coe/planning/calendar/test/integration/pages/Common",
    "sap/coe/planning/calendar/test/integration/util/IntegrationActionHelper",
    "sap/coe/planning/calendar/test/integration/util/IntegrationAssertionHelper"
], function(Opa5, Common, IntegrationActionHelper, IntegrationAssertionHelper) {
    "use strict";

    var sViewPlanningCalendar = "PlanningCalendar",
        sViewDetailPage = "Detail";

    Opa5.createPageObjects({
        onThePlanningCalendarPage: {
            actions: {
                Init: function() {
                    IntegrationActionHelper.setTestContext(this);
                    IntegrationAssertionHelper.setTestContext(this);
                },

                iPressButton: function(sButtonId, bDialog, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iPressButton(sButtonId, bDialog, sSuccessMessage, sErrorMessage);
                },

                iPressOnIcon: function(sInputId, sSrc, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iPressOnIcon(sInputId, sSrc, sSuccessMessage, sErrorMessage);
                },

                iPressOnRecurrencePanel: function(sPanelId, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Panel",
                        check: function(aPlanningPanels) {
                            for (var i = 0; i < aPlanningPanels.length; i++) {
                                if (aPlanningPanels[i].getId().indexOf(sPanelId) > -1) {
                                    aPlanningPanels[i].oIconCollapsed.$().trigger("click");
                                    return true;
                                }
                            }
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Could open the Panel");
                        },
                        errorMessage: sErrorMessage || "Could not open the Panel"
                    });
                },

                iPressOnCalendarAppointment: function(sTypeOfAppointment, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.ui.unified.CalendarAppointment",
                        check: function(aCalendarAppointments) {
                            for (var i = 0; i < aCalendarAppointments.length; i++) {
                                if (aCalendarAppointments[i].getProperty("type") === sTypeOfAppointment) {
                                    aCalendarAppointments[i].$().trigger("click");
                                    return true;
                                }
                            }
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Could press on Calendar appointment");
                        },
                        errorMessage: sErrorMessage || "Could not press on Calendar appointment"
                    });
                },

                iHoverOnCalendarAppointment: function(sTypeOfAppointment, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.ui.unified.CalendarAppointment",
                        check: function(aCalendarAppointments) {
                            for (var i = 0; i < aCalendarAppointments.length; i++) {
                                if (aCalendarAppointments[i].getProperty("type") === sTypeOfAppointment) {
                                    aCalendarAppointments[i].$().trigger("mouseover");
                                    return true;
                                }
                            }
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Could hover on Calendar appointment");
                        },
                        errorMessage: sErrorMessage || "Could not hover on Calendar appointment"
                    });
                },

                iPressButtonByText: function(sText, bDialog, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        searchOpenDialogs: bDialog,
                        controlType: "sap.m.Button",
                        check: function(aButtons) {
                            for (var i = 0; i < aButtons.length; i++) {
                                if (aButtons[i].getText().indexOf(sText) > -1) {
                                    aButtons[i].$().trigger("tap");
                                    return true;
                                }
                            }
                        },
                        success: function(aButtons) {
                            ok(true, sSuccessMessage || "Could click button with text: " + sText);
                        },
                        errorMessage: sErrorMessage || "Could not click button with text: " + sText
                    });
                },

                iPressAcceptButton: function() {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        searchOpenDialogs: true,
                        check: function(aButtons) {
                            aButtons[2].$().trigger("tap");
                            return true;
                        }
                    });
                },

                iPressButtonOnDetailPage: function(sButtonId, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.semantic.MainAction",
                        viewName: sViewDetailPage,
                        check: function(aButton) {
                            for (var i = 0; i < aButton.length; i++) {
                                if (aButton[i].getId().indexOf(sButtonId) > -1) {
                                    aButton[i].$().trigger("tap");
                                    return true;
                                }
                            }
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Could press button on PlanningCalendar Detail page.");
                        },
                        errorMessage: sErrorMessage || "Could not press button on PlanningCalendar Detail page."
                    });
                },

                iPressMultiSelectAction: function(sIdMultiSelect, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.semantic.MultiSelectAction",
                        viewName: sViewPlanningCalendar,
                        success: function(oMultiSelect) {
                            oMultiSelect[0].$().trigger("tap");
                            ok(true, sSuccessMessage || "Could click on MultiSelectAction with id: " + sIdMultiSelect);
                        },
                        errorMessage: sErrorMessage || "Could not click on MultiSelectAction with id: " + sIdMultiSelect
                    });
                },

                iWaitUntilPlanningCalendarRowsAreShown: function() {
                    return this.waitFor({
                        controlType: "sap.m.PlanningCalendar",
                        check: function(aPlanningCalendars) {
                            if (aPlanningCalendars[0].getRows().length > 0) {
                                return true;
                            }
                        }
                    });
                },

                iWaitUntilDialogIsPrefilled: function(sIdTimePicker) {
                    return this.waitFor({
                        controlType: "sap.m.TimePicker",
                        id: sIdTimePicker,
                        searchOpenDialogs: true,
                        check: function(aTimePickers) {
                            var iAmountOfTimePickersEnables = 0;

                            for (var i = 0; i < aTimePickers.length; i++) {
                                if (aTimePickers[i].getEnabled()) {
                                    iAmountOfTimePickersEnables++;
                                }
                            }
                            if (iAmountOfTimePickersEnables === 2) {
                                return true;
                            }
                        }
                    });
                },

                iWaitUntilPlanningCalendarIsNotBusy: function() {
                    return this.waitFor({
                        controlType: "sap.m.PlanningCalendar",
                        check: function(aPlanningCalendars) {
                            if (!aPlanningCalendars[0].getBusy()) {
                                return true;
                            }
                        }
                    });
                },

                iSetComboBoxValue: function(sComboBoxId, iPosition, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.ComboBox",
                        check: function(aComboBoxs) {
                            for (var i = 0; i < aComboBoxs.length; i++) {
                                if (aComboBoxs[i].getId().indexOf(sComboBoxId) > -1) {
                                    var sCategoryValue = aComboBoxs[i].getSelectableItems()[iPosition].getText();
                                    aComboBoxs[i].setValue(sCategoryValue);

                                    aComboBoxs[i].setSelectedIndex(iPosition);
                                    return true;
                                }
                            }
                        },
                        success: function() {
                            ok(true, sSuccessMessage);
                        },
                        errorMessage: sErrorMessage
                    });
                },

                iSetInputValue: function(sInputId, sInputValue, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iSetValue(sInputId,
                        sInputValue,
                        "sap.m.Input",
                        sSuccessMessage,
                        sErrorMessage);
                },

                iSetTextAreaValue: function(sTextAreaId, sTextAreaValue, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iSetValue(sTextAreaId,
                        sTextAreaValue,
                        "sap.m.TextArea",
                        sSuccessMessage,
                        sErrorMessage);
                },

                iSetValueOfDatePicker: function(sIdDatePicker, sDateValue, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iSetValue(sIdDatePicker,
                        sDateValue,
                        "sap.m.DatePicker",
                        sSuccessMessage,
                        sErrorMessage);
                },

                iSetValueOfDateRangeSelection: function(sIdDateRangePicker, sDateRangeValue, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iSetValue(sIdDateRangePicker,
                        sDateRangeValue,
                        "sap.m.DateRangeSelection",
                        sSuccessMessage,
                        sErrorMessage);
                },

                iSetValueOfTimePicker: function(sIdsOfTimePicker, sTimeValue, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iSetValue(sIdsOfTimePicker,
                        sTimeValue,
                        "sap.m.TimePicker",
                        sSuccessMessage,
                        sErrorMessage);
                },

                iSelectListItem: function(sListId, iPositionInList, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        id: sListId,
                        viewName: sViewPlanningCalendar,

                        success: function(oList) {
                            oList.getItems()[iPositionInList].$().trigger("tap");

                            ok(true, sSuccessMessage || "Selected ListItem of position " + iPositionInList + ".");
                        },
                        errorMessage: sErrorMessage || "Not possible to select on ListItem of position " + iPositionInList + "."
                    });
                },

                iSelectListItemInMultiSelectMode: function(sListId, iPositionInList, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        id: sListId,
                        viewName: sViewPlanningCalendar,

                        success: function(oList) {
                            oList.getItems()[iPositionInList]._oMultiSelectControl.$().trigger("tap");

                            ok(true, sSuccessMessage || "Selected ListItem of position " + iPositionInList + ".");
                        },
                        errorMessage: sErrorMessage || "Not possible to select on ListItem of position " + iPositionInList + "."
                    });
                },

                iCheckTableBusy: function(sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        controlType: "sap.ui.table.Column",
                        check: function(aColumns) {
                            var oTable = aColumns[0].getParent();
                            return oTable.getBusy();
                        },
                        success: function(aTables) {
                            Opa5.assert.ok(aTables, sSuccessMessage || "Found a busy table.");
                        },
                        errorMessage: sErrorMessage || "Didn't find a busy table."
                    });
                },

                iDeleteToken: function(sTextOfToken, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iDeleteToken(sTextOfToken, sSuccessMessage, sErrorMessage);
                },

                iAddItemFromValueHelpDialog: function(sDialogId, sTokenName, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        controlType: "sap.ui.comp.valuehelpdialog.ValueHelpDialog",
                        check: function(aValueHelp) {
                            if (aValueHelp[0]._oTable.getSelectedIndices().length) {
                                aValueHelp[0]._addRemoveTokenByKey(sTokenName,
                                    aValueHelp[0]._oTable.getContextByIndex(3).getObject(),
                                    true);

                                // This part of the code is only needed if the tests are executed without the debug window
                                aValueHelp[0]._addToken2Tokenizer(sTokenName,
                                    sTokenName,
                                    aValueHelp[0]._oSelectedTokens);

                                return true;
                            }

                            return false;
                        },
                        success: function(oDialog) {
                            Opa5.assert.ok(oDialog, sSuccessMessage || "Able to select an item from the valuehelp dialog.");
                        },
                        errorMessage: sErrorMessage || "Not able to select an item from the valuehelp dialog."
                    });
                }

            },
            assertions: {
                iShouldSeeTheElementOnPlanningCalendar: function(sTableId) {
                    return IntegrationAssertionHelper.iShouldSeeElementOnPage(sViewPlanningCalendar, sTableId);
                },

                iShouldSeeButton: function(sElementId, bExpectedValue, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        check: function(aButtons) {
                            var bButton = false;
                            for (var i = aButtons.length - 1; i >= 0; i--) {
                                if (aButtons[i].getId().indexOf(sElementId) !== -1) {
                                    bButton = true;
                                }
                            }
                            return bButton === bExpectedValue;
                        },
                        success: function() {
                            Opa5.assert.ok(true, sSuccessMessage || "Button " + sElementId + (bExpectedValue ? " found" : " not found"));
                        },
                        errorMessage: sErrorMessage || "Button " + sElementId + (bExpectedValue ? " not found" : " found")
                    });
                },

                iShouldSeeElementOnDetailPage: function(sElementId, bExpectedValue, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        id: sElementId,
                        viewName: sViewDetailPage,
                        visible: false,
                        check: function(oElement) {
                            return oElement.getVisible() === bExpectedValue;
                        },
                        success: function() {
                            Opa5.assert.ok(true, sSuccessMessage || "For the element with id: " + sElementId + " the viability was as expected: " + bExpectedValue);
                        },
                        errorMessage: sErrorMessage || "For the element with id: " + sElementId + " the viability was not as expected: " + bExpectedValue
                    });
                },

                iShouldSeeHeaderText: function(sOutputId, sExpectedValue, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        id: sOutputId,
                        viewName: sViewDetailPage,
                        check: function(oElement) {
                            return oElement.getText() === sExpectedValue;
                        },
                        success: function() {
                            Opa5.assert.ok(true, sSuccessMessage || "Element with id: " + sOutputId + " had expected value: " + sExpectedValue);
                        },
                        errorMessage: sErrorMessage || "Element with id: " + sOutputId + " had expected value: " + sExpectedValue
                    });
                },

                iShouldSeeMainActionOnDetailPageEnabled: function(sElementId, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        id: sElementId,
                        viewName: sViewDetailPage,
                        check: function(oElement) {
                            return oElement.getEnabled();
                        },
                        success: function() {
                            Opa5.assert.ok(true, sSuccessMessage || "Element with id: " + sElementId + " was enabled.");
                        },
                        errorMessage: sErrorMessage || "Element with id: " + sElementId + " was not enabled."
                    });
                },

                iShouldSeeADialog: function() {
                    return IntegrationAssertionHelper.iShouldSeeElementOfType("sap.m.Dialog");
                },

                iShouldSeeAPopover: function() {
                    return IntegrationAssertionHelper.iShouldSeeElementOfType("sap.m.Popover");
                },

                iShouldSeeAPopoverWithText: function(sSubString, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Popover",
                        success: function(aPopover) {
                            var bSubStringFound = false;
                            for (var i = aPopover.length - 1; i >= 0; i--) {
                                if (aPopover[i].$()[0].textContent.indexOf(sSubString) > -1) {
                                    bSubStringFound = true;
                                }
                            }
                            Opa5.assert.ok(bSubStringFound, sSuccessMessage || "Could see Popover with substring: " + sSubString);
                        },
                        errorMessage: sErrorMessage || "Could not see Popover with substring: " + sSubString
                    });
                },

                iShouldSeeToastMessage: function(sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        pollingInterval: 100,
                        viewName: sViewDetailPage,
                        check: function() {
                            return !!sap.ui.test.Opa5.getJQuery()(".sapMMessageToast").length;
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Found a Toast message.");
                        },
                        errorMessage: sErrorMessage || "No Toast message detected!"
                    });
                },

                iShouldSeeWarningMessage: function(bWarningDisplayed, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        pollingInterval: 100,
                        viewName: sViewDetailPage,
                        success: function() {
                            var bWarningShown = false,
                                bPassed = false;

                            if (!!sap.ui.test.Opa5.getJQuery()(".sapMMessageDialog").length > 0) {
                                    bWarningShown = true;
                            }
                            if (bWarningShown === bWarningDisplayed) {
                                bPassed = true;
                            }

                            Opa5.assert.ok(bPassed, sSuccessMessage || (bPassed ? "Warning message displayed correctly" : "Warning message does not need to be displayed"));
                        },
                        errorMessage: sErrorMessage || "Warning message is shown / not shown incorrectly"
                    });
                },

                iShouldSeeABusyDialog: function(sDialogId, sSuccessMessage, sErrorMessage) {
                    return IntegrationAssertionHelper.iCheckBusyMode("sap.m.Dialog", sDialogId, true);
                },

                iShouldSeeABusyPlanningCalendar: function(sPlanningCalendarId, sSuccessMessage, sErrorMessage) {
                    return IntegrationAssertionHelper.iCheckBusyMode("sap.m.PlanningCalendar", sPlanningCalendarId, false);
                },

                iSeeNElementsSelectedInValueHelpDialog: function(sDialogId, iAmountOfItems, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        id: sDialogId,
                        searchOpenDialogs: true,
                        controlType: "sap.m.Dialog",
                        check: function(aDialog) {
                            for (var i = 0; i < aDialog.length; i++) {
                                if (aDialog[i].getId().indexOf(sDialogId) > -1) {
                                    return aDialog[i]._oSelectedTokens.getTokens().length === iAmountOfItems;
                                }
                            }

                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Found a list with the id: " + sDialogId + " and " + iAmountOfItems + " Items selected.");
                        },
                        errorMessage: sErrorMessage || "Didn't find a list with the id: " + sDialogId + " and " + iAmountOfItems + " Items selected."
                    });
                },

                iSeeNElementsInList: function(sListId, iAmountOfItems, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.List",
                        viewName: sViewPlanningCalendar,
                        check: function(aList) {
                            for (var i = 0; i < aList.length; i++) {
                                if (aList[i].getId().indexOf(sListId) > -1) {
                                    return aList[0].getItems().length === iAmountOfItems;
                                }
                            }
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Found a list with the id: " + " and " + iAmountOfItems + " Items selected.");
                        },
                        errorMessage: sErrorMessage || "Didn't find a list with the id: " + " and " + iAmountOfItems + " Items selected."
                    });
                },

                iShouldSeeServiceDeleted: function(sServiceID, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.List",
                        check: function(aList) {
                            for(var i = 0; i < aList.length; i++) {
                                if(aList[i].getId() === sServiceID)
                                {
                                     return false;
                                }
                            }
                            return true;
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Deleted service demand from the master list with id: " + sServiceID); 
                            },
                        errorMessage: sErrorMessage || "Service Demand was not deleted from master list"
                    });
                },

                okAssert: function(sMessage) {
                    Opa5.assert.ok(true, sMessage);
                }
            }
        }
    });
});
