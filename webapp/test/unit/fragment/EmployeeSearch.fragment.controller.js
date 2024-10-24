sap.ui.define([
    "sap/coe/planning/calendar/fragment/EmployeeSearch.fragment.controller"
], function(EmployeeSearchController) {
    "use strict";

    QUnit.module("Fragment - EmployeeSearchController", {
        beforeEach: function() {
            this.oEmployeeSearchController = new EmployeeSearchController();
        },
        afterEach: function() {
            this.oEmployeeSearchController.destroy();
        }
    });

    QUnit.test("Should be possible to create an instance", function(assert) {
        assert.ok(this.oEmployeeSearchController, "Was possible to create the instance");
        assert.strictEqual(this.oEmployeeSearchController.getMetadata().getName(), "sap.coe.planning.calendar.fragment.EmployeeSearch", "Was created with the expected name");
    });

});
