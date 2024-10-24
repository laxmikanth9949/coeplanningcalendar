sap.ui.define([
    "sap/coe/planning/calendar/fragment/ActionSheet.fragment.controller"
], function(ActionSheetController) {
    "use strict";

    QUnit.module("Fragment - ActionSheetController", {
        beforeEach: function() {
            this.oActionSheetController = new ActionSheetController();
        },
        afterEach: function() {
            this.oActionSheetController.destroy();
        }
    });

    QUnit.test("Should be possible to create an instance", function(assert) {
        assert.ok(this.oActionSheetController, "Was possible to create the instance");
        assert.strictEqual(this.oActionSheetController.getMetadata().getName(), "sap.coe.planning.calendar.fragment.ActionSheet", "Was created with the expected name");
    });

});
