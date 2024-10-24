sap.ui.define([
    "sap/coe/planning/calendar/controller/Worklist.controller",
    "sap/coe/capacity/reuselib/utils/VariantFilterHelper",
    "sap/coe/capacity/reuselib/utils/TokenHelper",
    "sap/coe/planning/calendar/util/helpers",
    "sap/ui/thirdparty/sinon",
    "sap/ui/thirdparty/sinon-qunit"
], function(WorklistController, oVariantFilterHelper, oTokenHelper, helpers) {
    "use strict";
    var sandbox = sinon.sandbox.create();

    QUnit.module("Controller - WorklistController", {
        beforeEach: function() {
            var oByIdStub;
            this.oWorklistController = new WorklistController();

            this.oViewStub = new sap.ui.base.ManagedObject();
            this.oViewStub.addStyleClass = function() {};
            sandbox.stub(this.oViewStub, "addStyleClass");
            this.oViewStub.addDependent = function() {};
            sandbox.stub(this.oViewStub, "addDependent");

            oByIdStub = sandbox.stub(this.oWorklistController, "byId");
            this.oStartEndDateStub = new sap.m.DateRangeSelection();
            oByIdStub.withArgs("idForStartEndDate").returns(this.oStartEndDateStub);

            this.oEventStub = new sap.ui.base.Event();

            this.oComponentStub = new sap.ui.base.ManagedObject();
            this.oComponentStub.getContentDensityClass = function() {};
            sandbox.stub(this.oComponentStub, "getContentDensityClass");

            sandbox.stub(this.oWorklistController, "getView").returns(this.oViewStub);
            sandbox.stub(this.oWorklistController, "getOwnerComponent").returns(this.oComponentStub);

            sandbox.stub(oTokenHelper, "applyToFBItem");
        },
        afterEach: function() {
            this.oWorklistController.destroy();
            this.oViewStub.destroy();
            this.oStartEndDateStub.destroy();
            this.oEventStub.destroy();
            this.oComponentStub.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Should be possible to create an instance", function(assert) {
        assert.ok(this.oWorklistController, "Was possible to create the instance");
        assert.strictEqual(this.oWorklistController.getMetadata().getName(), "sap.coe.planning.calendar.controller.Worklist", "Was created with the expected name");
    });

/*    QUnit.test("onActionSheetPress: Should create the ActionSheet fragment", function(assert) {
        var spyHelperInitializeFragment = sandbox.spy(helpers, "initializeFragmentFromObject"),
        ExpectedController = sap.coe.planning.calendar.fragment.ActionSheet,
        oInitializeFragmentCall;
        sandbox.stub(this.oEventStub, "getSource");

        this.oWorklistController.onActionSheetPress(this.oEventStub);
        oInitializeFragmentCall = spyHelperInitializeFragment.getCall(0).args[0];

        assert.ok(this.oWorklistController._actionSheet, "The fragment property is instantiated");
        assert.strictEqual(oInitializeFragmentCall.sFragment, ExpectedController.getMetadata().getName(), "The fragment has the expected fragment view");
        assert.strictEqual(oInitializeFragmentCall.ControllerClass, ExpectedController, "The fragment has the expected fragment controller");
        this.oWorklistController._actionSheet.destroy();
    });*/


});
