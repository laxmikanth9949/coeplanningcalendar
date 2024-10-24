sap.ui.define([
    "sap/coe/planning/calendar/fragment/ServiceDemandDetails.fragment.controller"
], function(ServiceDemandDetailsController) {
    "use strict";

    QUnit.module("Fragment - ServiceDemandDetailsController", {
        beforeEach: function() {
            this.oServiceDemandDetailsController = new ServiceDemandDetailsController();
        },
        afterEach: function() {
            this.oServiceDemandDetailsController.destroy();
        }
    });

    QUnit.test("Should be possible to create an instance", function(assert) {
        assert.ok(this.oServiceDemandDetailsController, "Was possible to create the instance");
        assert.strictEqual(this.oServiceDemandDetailsController.getMetadata().getName(), "sap.coe.planning.calendar.fragment.ServiceDemandDetails", "Was created with the expected name");
    });

});
