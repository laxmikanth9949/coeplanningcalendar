sap.ui.define([
    "sap/coe/planning/calendar/fragment/SelectServiceOrder.fragment.controller"
], function(SelectServiceOrderController) {
    "use strict";

    QUnit.module("Fragment - SelectServiceOrderController", {
        beforeEach: function() {
            this.oSelectServiceOrderController = new SelectServiceOrderController();
        },
        afterEach: function() {
            this.oSelectServiceOrderController.destroy();
        }
    });

    QUnit.test("Should be possible to create an instance", function(assert) {
        assert.ok(this.oSelectServiceOrderController, "Was possible to create the instance");
        assert.strictEqual(this.oSelectServiceOrderController.getMetadata().getName(), "sap.coe.planning.calendar.fragment.SelectServiceOrder", "Was created with the expected name");
    });

});
