sap.ui.define([
    "sap/coe/planning/calendar/controller/Detail.controller"
], function(DetailController) {
    "use strict";

    QUnit.module("Controller - DetailController", {
        beforeEach: function() {
            this.oDetailController = new DetailController();
        },
        afterEach: function() {
            this.oDetailController.destroy();
        }
    });

    QUnit.test("Should be possible to create an instance", function(assert) {
        assert.ok(this.oDetailController, "Was possible to create the instance");
        assert.strictEqual(this.oDetailController.getMetadata().getName(), "sap.coe.planning.calendar.controller.Detail", "Was created with the expected name");
    });

});
