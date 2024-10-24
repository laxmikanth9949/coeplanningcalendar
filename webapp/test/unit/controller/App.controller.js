sap.ui.define([
    "sap/coe/planning/calendar/controller/App.controller"
], function(AppController) {
    "use strict";

    QUnit.module("Controller - AppController", {
        beforeEach: function() {
            this.oAppController = new AppController();
        },
        afterEach: function() {
            this.oAppController.destroy();
        }
    });

    QUnit.test("Should be possible to create an instance", function(assert) {
        assert.ok(this.oAppController, "Was possible to create the instance");
        assert.strictEqual(this.oAppController.getMetadata().getName(), "sap.coe.planning.calendar.controller.App", "Was created with the expected name");
    });

});
