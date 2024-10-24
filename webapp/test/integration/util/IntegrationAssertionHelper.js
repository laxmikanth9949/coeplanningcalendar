sap.ui.define([
    "sap/ui/test/Opa5"
], function(Opa5) {
    "use strict";

    var IntegrationAssertionHelper = {};

    IntegrationAssertionHelper.setTestContext = function(oTestContext) {
        IntegrationAssertionHelper.oTestContext = oTestContext;
    };

    /**
     * Checks if a element of the type sElementType is found on the page
     * @param {String} type name e.g. sap.m.Popover
     * @public
     */
    IntegrationAssertionHelper.iShouldSeeElementOfType = function(sElementType, sSuccessMessage, sErrorMessage) {
        return this.oTestContext.waitFor({
            controlType: sElementType,
            success: function(oElement) {
                Opa5.assert.ok(oElement, sSuccessMessage || "Could see Element with type: " + sElementType);
            },
            errorMessage: sErrorMessage || "Could not see Element with type: " + sElementType
        });
    };

    /**
     * Checks if a element with the id sId is found on the page with the name sPageName
     * @param {String} name of the page
     * @param {String} id of the element
     * @public
     */
    IntegrationAssertionHelper.iShouldSeeElementOnPage = function(sPageName, sId, sSuccessMessage, sErrorMessage) {
        return this.oTestContext.waitFor({
            id: sId,
            viewName: sPageName,
            success: function(oTable) {
                Opa5.assert.ok(oTable, sSuccessMessage || "Could see Element with id: " + sId + " on " + sPageName + "-Page.");
            },
            errorMessage: sErrorMessage || "Could not see Element with id: " + sId + " on " + sPageName + "-Page."
        });
    };

    IntegrationAssertionHelper.iCheckBusyMode = function(sControlType, sId, bSearchOpenDialogs, sSuccessMessage, sErrorMessage) {
        return this.oTestContext.waitFor({
            controlType: sControlType,
            searchOpenDialogs: bSearchOpenDialogs,
            check: function(aElements) {
                for(var i = 0; i < aElements.length; i++){
                    if (aElements[i].getId().indexOf(sId) > -1) {
                        return aElements[i].getBusy();
                    }
                }
                return false;
            },
            success: function() {
                ok(true, sSuccessMessage || sControlType + " with id " + sId + "is Busy.");
            },
            errorMessage: sErrorMessage || sControlType + " with id " + sId + "is not Busy."
        });
    };

    return IntegrationAssertionHelper;
});
