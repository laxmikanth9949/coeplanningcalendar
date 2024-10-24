sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/coe/planning/calendar/test/integration/pages/Common",
    "sap/coe/planning/calendar/test/integration/util/IntegrationActionHelper",
    "sap/coe/planning/calendar/test/integration/util/IntegrationAssertionHelper",
    "sap/ui/test/matchers/Properties",
    "sap/ui/test/actions/EnterText",
    "sap/ui/test/actions/Press"
], function(Opa5, Common, IntegrationActionHelper, IntegrationAssertionHelper, Properties, EnterText, Press) {
    "use strict";

    var sViewName = "Worklist";

    Opa5.createPageObjects({
        onTheWorklistPage: {
            actions: {
                Init: function() {
                    IntegrationActionHelper.setTestContext(this);
                    IntegrationAssertionHelper.setTestContext(this);

                    this.testVariables = {};
                },

                iPressButton: function(sButtonId, bDialog, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iPressButton(sButtonId, bDialog, sSuccessMessage, sErrorMessage);
                },

                iPressOnIcon: function(sInputId, sSrc, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iPressOnIcon(sInputId, sSrc, sSuccessMessage, sErrorMessage);
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

                iPressOnValueHelpRequestInput: function(sInputId, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Input",
                        check: function(aInputs) {
                            for (var i = 0; i < aInputs.length; i++) {
                                if (aInputs[i].getId().indexOf(sInputId) > -1) {
                                    aInputs[i].fireValueHelpRequest();
                                    return true;
                                }
                            }
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Value help for Input " + sInputId + " triggered.");
                        },
                        errorMessage: sErrorMessage || "Failed to trigger value help for Input " + sInputId + "."
                    });
                },

                iPressLinkWithText: function(sLinkText, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Link",
                        check: function(aLinks) {
                            for (var i = 0; i < aLinks.length; i++) {
                                if (aLinks[i].getText() === sLinkText) {
                                    aLinks[i].$().trigger("tap");
                                    return true;
                                }
                            }
                            return false;
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Could click on link with with text: " + sLinkText);
                        },
                        errorMessage: sErrorMessage || "Could not click on link with with text: " + sLinkText
                    });
                },

                iPressOnListItem: function(iPosition, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        controlType: "sap.m.StandardListItem",
                        success: function(aInputs) {
                            new Press().executeOn(aInputs[iPosition]);
                            ok(true, sSuccessMessage || "Click on StandardListItem of position " + iPosition + ".");
                        },
                        errorMessage: sErrorMessage || "Not possible to click on StandardListItem of position " + iPosition + "."
                    });
                },

                iPressSearchBttn: function(sId, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        controlType: "sap.m.SearchField",
                        check: function(aSearchField) {
                            for (var i = 0; i < aSearchField.length; i++) {
                                if (aSearchField[0].getId().indexOf(sId) > -1) {
                                    aSearchField[0].fireSearch();
                                    return true;
                                }
                            }
                            return false;
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Search button with ID " + sId + " pressed");
                        },
                        errorMessage: sErrorMessage || "Failed to press Search button with ID " + sId + "."
                    });
                },               

                iDeleteToken: function(sTextOfToken, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iDeleteToken(sTextOfToken, sSuccessMessage, sErrorMessage);
                },

                iListIsReady: function(sIdOfList, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.List",
                        check: function(aList) {
                            for (var i = 0; i < aList.length; i++) {
                                if (aList[i].getId().indexOf(sIdOfList) > -1 && !aList[i].isBusy()) {
                                    return true;
                                }
                            }
                            return false;
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "List " + sIdOfList + " ready.");
                        },
                        errorMessage: sErrorMessage || "List " + sIdOfList + " ready failed."
                    });
                },

                iTypeOnSearchField: function(sId, sText, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        controlType: "sap.m.SearchField",
                        check: function(aSearchField) {
                            for (var i = 0; i < aSearchField.length; i++) {
                                if (aSearchField[0].getId().indexOf(sId) > -1) {
                                    aSearchField[0].setValue(sText);
                                    return true;
                                }
                            }
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Type " + sText + " in field " + sId + ".");
                        },
                        errorMessage: sErrorMessage || "Fail type " + sText + " in field " + sId + "."
                    });
                },

                iChangeInputValue: function(sInputFieldId, sNewValue, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Input",
                        check: function(aInputs) {
                            for (var i = 0; i < aInputs.length; i++) {
                                if (aInputs[i].getId().indexOf(sInputFieldId) > -1) {
                                    var setTextEvent = new EnterText().setText(sNewValue);
                                    setTextEvent.executeOn(aInputs[i]);
                                    return true;
                                }
                            }
                        },
                        success: function(aInputs) {
                            ok(true, sSuccessMessage || "Changed text value of Input with id: " + sInputFieldId + " to " + sNewValue);
                        },
                        errorMessage: sErrorMessage || "Unable to change text value of Input with id: " + sInputFieldId + " to " + sNewValue
                    });
                },

                iSelectListItem: function(iPosition, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        controlType: "sap.m.StandardListItem",
                        success: function(aInputs) {
                            aInputs[iPosition]._oMultiSelectControl.$().trigger("tap");
                            ok(true, sSuccessMessage || "Selected StandardListItem of position " + iPosition + ".");
                        },
                        errorMessage: sErrorMessage || "Not possible to select on StandardListItem of position " + iPosition + "."
                    });
                },

                iPressListItem: function(iPosition, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        controlType: "sap.m.SelectList",
                        check: function(aSelectLists) {
                            new Press().executeOn(aSelectLists[0].getItems()[iPosition]);
                            return true;
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Was abel to click ListItem at position " + iPosition);
                        },
                        errorMessage: sErrorMessage || "Was not abel to click ListItem at position " + iPosition
                    });
                },

                iSelectItemsFromTable: function(sDemandId, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Table",
                        check: function(aTable) {
                            var oItem;
                            for (var i = 0; i < aTable[0].getItems().length; i++) {
                                oItem = aTable[0].getItems()[i];

                                if (oItem.getAggregation("cells")[8].getProperty("text") === sDemandId) {
                                    oItem._oMultiSelectControl.$().trigger("tap");
                                    return true;
                                }
                            }

                            return false;
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Could select item with demand id: " + sDemandId);
                        },
                        errorMessage: sErrorMessage || "Could not select item with demand id: " + sDemandId
                    });
                },

                iClickOnTheNItemInTheList: function(iIndex, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.List",
                        check: function(oList) {
                            oList[0].getItems()[iIndex].$().trigger("tap");
                            return true;
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Item at index " + iIndex + " clicked on successfully");
                        },
                        errorMessage: sErrorMessage || "Failed to click on item at index " + iIndex
                    });
                },

                iWaitForListRecieveData: function(iIndex, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.List",
                        check: function(oList) {
                            return !oList[0]._bReceivingData;
                        },
                        success: function(oList) {
                            ok(true, sSuccessMessage || "Navigation successful");
                        },
                        errorMessage: sErrorMessage || "Navigation failed"
                    });
                },

                iClickOnMultiSelectRB: function(iIndex, bSelect, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        controlType: "sap.m.List",
                        check: function(oList) {
                            var oItem = oList[0].getItems()[iIndex];
                            oItem.setSelected(bSelect);
                            oList[0].fireSelectionChange({ listItem: oItem });
                            return true;
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "The Radio Button of item at index " + iIndex + "was " +
                                (bSelect ? "selected" : "deselected") + " successfully");
                        },
                        errorMessage: sErrorMessage || "Failed to select the Radio Button of item at index " + iIndex
                    });
                },

                iSeeLableInVariant: function(sLabelText, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Label",
                        check: function(aInputs) {
                            for (var i = 0; i < aInputs.length; i++) {
                                if (aInputs[i].getText() === sLabelText) {
                                    return true;
                                }
                            }
                        },
                        success: function(aInputs) {
                            ok(true, sSuccessMessage || "Found lable with text: " + sLabelText);
                        },
                        errorMessage: sErrorMessage || "Could not find lable with text: " + sLabelText
                    });
                },

                iLookAtTheScreen: function(iPosition) {
                    return true;
                },

                iPressAcceptCancelButton: function(bAccept, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Dialog",
                        success: function(aDialog) {
                            if (bAccept) {
                                aDialog[0].getBeginButton().$().trigger("tap"); 
                            } else {
                                aDialog[0].getEndButton().$().trigger("tap");
                            }
                            ok(true, sSuccessMessage || "Focused on " + (bAccept ? "OK" : "Cancel") + "Button");
                        },
                        errorMessage: sErrorMessage || "did not find the " + (bAccept ? "OK" : "Cancel") + " Button"
                    });
                },

                iFocusAway: function(sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.MultiComboBox",
                        success: function(aInputs) {
                            aInputs[0].$().trigger("focusin");
                            ok(true, sSuccessMessage || "Focused on MultiComboBox");
                        },
                        errorMessage: sErrorMessage || "Could not find a MultiComboBox"
                    });
                },

                iSeeAmountOfTokensUpdated: function(sIdOfTextField, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.MultiInput",
                        check: function(aInputs) {
                            for (var i = 0; i < aInputs.length; i++) {
                                if (aInputs[i].getId().indexOf(sIdOfTextField) > -1) {
                                    this.iAmountOfTokens = this.iAmountOfTokens || aInputs[i].getTokens().length;
                                    if (aInputs[i].getTokens().length !== this.iAmountOfTokens) {
                                        this.iAmountOfTokens = undefined;
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            }
                        },
                        success: function(aInputs) {
                            ok(true, sSuccessMessage || "Amount of tokens updated in field " + sIdOfTextField + ".");
                        },
                        errorMessage: sErrorMessage || "No MultiInput found."
                    });
                },

                iDontSeeThePopover: function(sPopoverId, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Popover",
                        check: function(aPopover) {
                            for (var i = 0; i < aPopover.length; i++) {
                                if (aPopover[i].getId().indexOf(sPopoverId) > -1) {
                                        return false;
                                }
                            }
                            return true;
                        },
                        success: function(aInputs) {
                            ok(true, sSuccessMessage || "The Popover " + sPopoverId + " is closed.");
                        },
                        errorMessage: sErrorMessage || "No MultiInput found."
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
                                    var aItems = aComboBoxs[i].getSelectedItem();
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

                iSetDates: function(sInputId, sInputValue, sSuccessMessage, sErrorMessage) {
                    return IntegrationActionHelper.iSetValue(sInputId,
                        sInputValue,
                        "sap.m.DateRangeSelection",
                        sSuccessMessage,
                        sErrorMessage);
                },

                iFocusAwayClickToken: function(sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Token",
                        success: function(aTokens) {
                            aTokens[0].$().trigger("tap");
                        },
                        errorMessage: sErrorMessage || "did not find a Button"
                    });
                }

            },
            assertions: {
                iShouldSeeADialog: function(sSuccessMessage, sErrorMessage) {
                    return IntegrationAssertionHelper.iShouldSeeElementOfType("sap.m.Dialog");
                },

                iShouldSeeTheTable: function(sTableId, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        id: sTableId,
                        viewName: sViewName,
                        success: function(oTable) {
                            Opa5.assert.ok(oTable, sSuccessMessage || "Found the Table " + sTableId);
                        },
                        errorMessage: sErrorMessage || "Can't see the Table " + sTableId + "."
                    });
                },

                iShouldSeeLableWithValue: function(sLabelText, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Label",
                        check: function(aInputs) {
                            for (var i = 0; i < aInputs.length; i++) {
                                if (aInputs[i].getText() === sLabelText) {
                                    return true;
                                }
                            }
                        },
                        success: function(aInputs) {
                            Opa5.assert.ok(aInputs, sSuccessMessage || "Found lable with text: " + sLabelText);
                        },
                        errorMessage: sErrorMessage || "Could not find lable with text: " + sLabelText
                    });
                },

                iShouldSeeNTokens: function(sIdOfTextField, iAmountOfTokens, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.MultiInput",
                        success: function(aInputs) {
                            for (var i = 0; i < aInputs.length; i++) {
                                if (aInputs[i].getId().indexOf(sIdOfTextField) > -1) {
                                    Opa5.assert.equal(aInputs[i].getTokens().length, iAmountOfTokens, sSuccessMessage || "Found expected amount of tokens in field " + sIdOfTextField + ".");
                                    break;
                                }
                            }
                        },
                        errorMessage: sErrorMessage || "No MultiInput found."
                    });
                },

                iShouldSeeValueInMultiComboBox: function(sMultiComboBoxId, sTokenValue, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.MultiComboBox",
                        check: function(aMultiComboBox) {
                            for (var i = 0; i < aMultiComboBox.length; i++) {
                                if (aMultiComboBox[i].getItemByText(sTokenValue)) {
                                    return true;
                                }
                            }
                        },
                        success: function(aInputs) {
                            Opa5.assert.ok(aInputs, sSuccessMessage || "Could see MultiComboBox with token value: " + sTokenValue);
                        },
                        errorMessage: sErrorMessage || "Could not see MultiComboBox with token value: " + sTokenValue
                    });
                },

                iShouldSeeNItemsCheckedInList: function(sIdOfList, iExpectedAmountOfSelected, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.List",
                        success: function(aList) {
                            for (var i = 0; i < aList.length; i++) {
                                if (aList[i].getId().indexOf(sIdOfList) > -1) {
                                    Opa5.assert.equal(aList[i].getSelectedItems().length,
                                        iExpectedAmountOfSelected,
                                        sSuccessMessage || "Found expected amount of selected items in list " + sIdOfList + ".");
                                    break;
                                }
                            }
                        },
                        errorMessage: sErrorMessage || "List " + sIdOfList + " not found."
                    });
                },

                iShouldItemBeDeselectedInList: function(sIdOfList, sTextOfListItem, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.List",
                        success: function(aList) {
                            for (var i = 0; i < aList.length; i++) {
                                if (aList[i].getId().indexOf(sIdOfList) > -1) {
                                    var itemFound = aList[i].getSelectedItems().find(
                                        function(item) {
                                            return item.getTitle() === sTextOfListItem;
                                        }
                                    );
                                    Opa5.assert.notOk(itemFound, sSuccessMessage || "Item " + sTextOfListItem + " deselected in list " + sIdOfList + ".");
                                    break;
                                }
                            }
                        },
                        errorMessage: sErrorMessage || "List " + sIdOfList + " not found."
                    });
                },

                iShouldSeeLinkEnabled: function(sLinkId, bEnabled, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.Link",
                        check: function(aLinks) {
                            for (var i = 0; i < aLinks.length; i++) {
                                if (aLinks[i].getId().indexOf(sLinkId) > -1) {
                                    return aLinks[i].getEnabled() === bEnabled;
                                }
                            }
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "List with id " + sLinkId + " found.");
                        },
                        errorMessage: sErrorMessage || "List with id " + sLinkId + " not found."
                    });
                },

                iShouldSeeAPopover: function() {
                    return IntegrationAssertionHelper.iShouldSeeElementOfType("sap.m.Popover");
                },

                iCheckPopoverValues: function(sLinkId, sLinkText, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        id: sLinkId,
                        searchOpenDialogs: true,
                        controlType: "sap.m.Link",
                        check: function(aLinks) {
                            return aLinks[0].getText() === sLinkText;
                        },
                        success: function() {
                            ok(true, sSuccessMessage || "Link " + sLinkText + " was found.");
                        },
                        errorMessage: sErrorMessage || "Link " + sLinkText + " was not found."
                    });
                },

                iShouldItemBeSelectedInList: function(sIdOfList, sTextOfListItem, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.List",
                        success: function(aList) {
                            for (var i = 0; i < aList.length; i++) {
                                if (aList[i].getId().indexOf(sIdOfList) > -1) {
                                    var itemFound = aList[i].getSelectedItems().find(
                                        function(item) {
                                            return item.getTitle() === sTextOfListItem;
                                        }
                                    );

                                    Opa5.assert.ok(itemFound, sSuccessMessage || "Item " + sTextOfListItem + " selected in list " + sIdOfList + ".");
                                    break;
                                }
                            }
                        },
                        errorMessage: sErrorMessage || "List " + sIdOfList + " not found."
                    });
                },

                iShouldSeeNItemsInTheList: function(iItems, sSuccessMessage, sErrorMessage) {
                    var iNoOfItems = 0;
                    return this.waitFor({
                        controlType: "sap.m.List",
                        success: function(oList) {
                            Opa5.assert.ok((oList[0].getItems().length === iItems), sSuccessMessage || iItems + " items found in list");
                        },
                        errorMessage: sErrorMessage || "Error: " + iNoOfItems + " found, not " + iItems + " as expected"
                    });
                },

                iShouldSeeThisItemAsTheNItemInList: function(sTextToMatch, iIndex, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.StandardListItem",
                        matchers: new Properties({
                            description: sTextToMatch
                        }),
                        success: function(aItems) {
                            Opa5.assert.ok(aItems[0], sErrorMessage || "Found item at index " + iIndex + " with description: " + sTextToMatch);
                        },
                        errorMessage: sErrorMessage || "Item with description: " + sTextToMatch + "not found"
                    });
                },

                iShouldSeeNItemsSelected: function(iIndex, sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        controlType: "sap.m.StandardListItem",
                        matchers: new Properties({
                            selected: true
                        }),
                        success: function(aItems) {
                            Opa5.assert.equal(aItems.length, iIndex, sSuccessMessage || iIndex + " items are selected");
                        },
                        errorMessage: sErrorMessage || "Fail: " + iIndex + " items are selected"
                    });
                },

                iShouldSeeToastMessage: function(sSuccessMessage, sErrorMessage) {
                    return this.waitFor({
                        pollingInterval: 100,
                        viewName: sViewName,
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
                        viewName: sViewName,
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

                okAssert: function(sMessage) {
                    Opa5.assert.ok(true, sMessage || "ok assert");
                }
            }
        }
    });
});
