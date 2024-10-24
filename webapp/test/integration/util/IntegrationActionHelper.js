sap.ui.define([
    "sap/ui/test/matchers/Properties",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "sap/ui/test/actions/Press"
], function(Properties, PropertyStrictEquals, Press) {
    "use strict";

    var IntegrationActionHelper = {};

    IntegrationActionHelper.setTestContext = function(oTestContext) {
        IntegrationActionHelper.oTestContext = oTestContext;
    };

    IntegrationActionHelper.iPressButton = function(sButtonId, bDialog, sSuccessMessage, sErrorMessage) {
        return this.oTestContext.waitFor({
            searchOpenDialogs: bDialog,
            controlType: "sap.m.Button",
            check: function(aButtons) {
                for (var i = 0; i < aButtons.length; i++) {
                    if (aButtons[i].getId().indexOf(sButtonId) > -1) {
                        aButtons[i].$().trigger("tap");
                        return true;
                    }
                }
            },
            success: function(aButtons) {
                ok(true, sSuccessMessage || "Could click button with id: " + sButtonId);
            },
            errorMessage: sErrorMessage || "Could not click button with id: " + sButtonId
        });
    };

    IntegrationActionHelper.iSetValue = function(sIdOfElement, sValue, sControlType, sSuccessMessage, sErrorMessage) {
        return this.oTestContext.waitFor({
            controlType: sControlType,
            check: function(aInputFields) {
                for (var i = 0; i < aInputFields.length; i++) {
                    if (aInputFields[i].getId().indexOf(sIdOfElement) > -1 && aInputFields[i].getEnabled()) {
                        aInputFields[i].setValue(sValue);
                        if (typeof aInputFields[i].fireChange === "function") {
                            aInputFields[i].fireChange();
                        }
                        return true;
                    }
                }
            },
            success: function() {
                ok(true, sSuccessMessage || sValue + " was set for element");
            },
            errorMessage: sErrorMessage || sValue + " was not set for element"
        });
    };

    IntegrationActionHelper.iDeleteToken = function(sTextOfToken, sSuccessMessage, sErrorMessage) {
        return this.oTestContext.waitFor({
            controlType: "sap.m.Token",
            check: function(aTokens) {
                for (var i = aTokens.length - 1; i >= 0; i--) {
                    if (aTokens[i].getText() === sTextOfToken) {
                        var oToken = aTokens[i];

                        oToken.fireDelete({
                            token: oToken
                        });

                        return true;
                    }
                }
            },
            success: function() {
                ok(true, sSuccessMessage || "Token " + sTextOfToken + " deleted.");
            },
            errorMessage: sErrorMessage || "Not possible to delete token " + sTextOfToken + "."
        });
    };

    IntegrationActionHelper.iPressOnIcon = function(sInputId, sSrc, sSuccessMessage, sErrorMessage) {
        return this.oTestContext.waitFor({
            controlType: "sap.ui.core.Icon",
            matchers: [new sap.ui.test.matchers.PropertyStrictEquals({
                name: "src",
                value: sSrc
            })],
            check: function(aInputs) {
                for (var i = 0; i < aInputs.length; i++) {
                    if (aInputs[i].getId().indexOf(sInputId) > -1) {
                        new Press().executeOn(aInputs[i]);
                        return true;
                    }
                }
            },
            success: function(aInputs) {

                ok(true, sSuccessMessage || "Value help for MultiInput " + sInputId + " triggered.");
            },
            errorMessage: sErrorMessage || "Failed to trigger value help for MultiInput " + sInputId + "."
        });
    };

    return IntegrationActionHelper;
});
