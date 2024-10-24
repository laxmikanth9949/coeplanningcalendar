sap.ui.define([
    "sap/coe/planning/calendar/controller/PlanningCalendar.controller"
], function(PlanningCalendarController) {
    "use strict";

    QUnit.module("Controller - PlanningCalendarController", {
        beforeEach: function() {
            this.oPlanningCalendarController = new PlanningCalendarController();
        },
        afterEach: function() {
            this.oPlanningCalendarController.destroy();
        }
    });

    QUnit.test("Should be possible to create an instance", function(assert) {
        assert.ok(this.oPlanningCalendarController, "Was possible to create the instance");
        assert.strictEqual(this.oPlanningCalendarController.getMetadata().getName(), "sap.coe.planning.calendar.controller.PlanningCalendar", "Was created with the expected name");
    });

});
