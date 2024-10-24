sap.ui.define([
    "sap/coe/planning/calendar/fragment/AssignServiceOrder.fragment.controller"
], function(AssignServiceOrderController) {
    "use strict";

    QUnit.module("Fragment - AssignServiceOrderController", {
        beforeEach: function() {
            this.oAssignServiceOrderController = new AssignServiceOrderController();
        },
        afterEach: function() {
            this.oAssignServiceOrderController.destroy();
        }
    });

    QUnit.test("Should be possible to create an instance", function(assert) {
        assert.ok(this.oAssignServiceOrderController, "Was possible to create the instance");
        assert.strictEqual(this.oAssignServiceOrderController.getMetadata().getName(), "sap.coe.planning.calendar.fragment.AssignServiceOrder", "Was created with the expected name");
    });

});
