sap.ui.define([
    "sap/coe/planning/calendar/fragment/TableSettings.fragment.controller"
], function(TableSettingsController) {
    "use strict";

    QUnit.module("Fragment - TableSettingsController", {
        beforeEach: function() {
            this.oTableSettingsController = new TableSettingsController();
        },
        afterEach: function() {
            this.oTableSettingsController.destroy();
        }
    });

    QUnit.test("Should be possible to create an instance", function(assert) {
        assert.ok(this.oTableSettingsController, "Was possible to create the instance");
        assert.strictEqual(this.oTableSettingsController.getMetadata().getName(), "sap.coe.planning.calendar.fragment.TableSettings", "Was created with the expected name");
    });

});
