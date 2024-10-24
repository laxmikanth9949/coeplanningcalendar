sap.ui.define([
    "sap/coe/planning/calendar/component/ServiceDemandFilterBar",
    "sap/coe/planning/calendar/util/helpers",
    "sap/coe/capacity/reuselib/utils/VariantFilterHelper",
    "sap/coe/capacity/reuselib/utils/TokenHelper",
    "sap/ui/thirdparty/sinon",
    "sap/ui/thirdparty/sinon-qunit"
], function(ServiceDemandFilterBar, oHelpers, oFilterHelper, oTokenHelper) {
    "use strict";
    var sandbox = sinon.sandbox.create();
    var testHelper = {};

    testHelper.vars = {};
    testHelper.setupFakeEnvironment = function() {
        var oHelperInitializeStub = sandbox.stub(oHelpers, "initializeFragmentFromObject"),
            oHelperCopyModelStub = sandbox.stub(oHelpers, "copyModel"),
            oFilterHelperSetModelStub = sandbox.stub(oFilterHelper, "setVariantFilterModel"),
            oFilterHelperClearStub = sandbox.stub(oFilterHelper, "onFilterBarClear"),
            oFilterHelperGetFiltersStub = sandbox.stub(oFilterHelper, "getFiltersSimple"),
            oTokenHelperDeleteStub = sandbox.stub(oTokenHelper, "onTokenDelete"),
            oTokenHelperSetValidatorStub = sandbox.stub(oTokenHelper, "_setValidator"),
            onComboBoxChange = sandbox.stub(oTokenHelper, "onComboBoxChange"),
            oFakeDateRange = new sap.m.DateRangeSelection(),
            oFakeFragment = { byId: function() {}, getModel: function() {}, setModel: function() {}, open: function() {} },
            oFakeFragmentByStub = sandbox.stub(oFakeFragment, "byId"),
            oFakeFragmentGetModelStub = sandbox.stub(oFakeFragment, "getModel"),
            oFakeFragmentSetModelStub = sandbox.stub(oFakeFragment, "setModel"),
            oFakeFragmentOpenStub = sandbox.stub(oFakeFragment, "open"),
            oFakeFilterBar = new sap.ui.comp.filterbar.FilterBar(),
            oFakeFilters = [],
            oFakeCWField = new sap.m.MultiComboBox(),
            oFakeCWFieldItem = new sap.ui.core.Item(),
            oFakeEventCW = new sap.ui.base.Event(),
            oEventCWGetParametersStub = sandbox.stub(oFakeEventCW, "getParameters");

        oFakeCWFieldItem.setText("12");
        oFakeCWFieldItem.setKey("12");
        oFakeCWField.insertItem(oFakeCWFieldItem);
        oFakeFilterBar.customVariantManager = {};

        oFakeFragmentByStub.withArgs("idForFilterBar").returns(oFakeFilterBar);
        oFakeFragmentByStub.withArgs("idForStartEndDate").returns(oFakeDateRange);
        oFakeFragmentByStub.withArgs("idForCalenderWeek").returns(oFakeCWField);
        oHelperInitializeStub.returns(oFakeFragment);
        oHelperCopyModelStub.returns(new sap.ui.model.json.JSONModel());
        oFilterHelperGetFiltersStub.returns(oFakeFilters);
        oEventCWGetParametersStub.returns({ changedItem: oFakeCWFieldItem });

        testHelper.vars.oHelperInitializeStub = oHelperInitializeStub;
        testHelper.vars.oHelperCopyModelStub = oHelperCopyModelStub;
        testHelper.vars.oFilterHelperSetModelStub = oFilterHelperSetModelStub;
        testHelper.vars.oFilterHelperClearStub = oFilterHelperClearStub;
        testHelper.vars.oFilterHelperGetFiltersStub = oFilterHelperGetFiltersStub;
        testHelper.vars.oTokenHelperSetValidatorStub = oTokenHelperSetValidatorStub;
        testHelper.vars.oTokenHelperDeleteStub = oTokenHelperDeleteStub;
        testHelper.vars.onComboBoxChange = onComboBoxChange;
        testHelper.vars.oFakeFragmentByStub = oFakeFragmentByStub;
        testHelper.vars.oFakeFragmentGetModelStub = oFakeFragmentGetModelStub;
        testHelper.vars.oFakeFragmentSetModelStub = oFakeFragmentSetModelStub;
        testHelper.vars.oFakeFragmentOpenStub = oFakeFragmentOpenStub;
        testHelper.vars.oFakeFragment = oFakeFragment;
        testHelper.vars.oFakeFilterBar = oFakeFilterBar;
        testHelper.vars.oFakeDateRange = oFakeDateRange;
        testHelper.vars.oFakeFilters = oFakeFilters;
        testHelper.vars.oFakeCWField = oFakeCWField;
        testHelper.vars.oFakeCWFieldItem = oFakeCWFieldItem;
        testHelper.vars.oFakeEventCW = oFakeEventCW;
    };


    QUnit.module("Component - ServiceDemandFilterBar", {
        beforeEach: function() {
            testHelper.setupFakeEnvironment();
            this.oServiceDemandFilterBar = new ServiceDemandFilterBar();
            this.oServiceDemandFilterBar.oView = testHelper.vars.oFakeFragment;
            testHelper.vars.oFakeFragmentGetModelStub.withArgs("VariantFilterModel").returns(this.oServiceDemandFilterBar.getModel("VariantFilterModel"));
        },
        afterEach: function() {
            this.oServiceDemandFilterBar.destroy();
            testHelper.vars.oFakeDateRange.destroy();
            testHelper.vars.oFakeFilterBar.destroy();
            testHelper.vars.oFakeCWField.destroy();
            testHelper.vars.oFakeCWFieldItem.destroy();
            testHelper.vars.oFakeEventCW.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Should be possible to create an instance", function(assert) {
        assert.ok(this.oServiceDemandFilterBar, "Was possible to create the instance");
        assert.strictEqual(this.oServiceDemandFilterBar.getMetadata().getName(), "sap.coe.planning.calendar.component.ServiceDemandFilterBar", "Was created with the expected name");
    });

    QUnit.test("init: Should initialize the fragment", function(assert) {
        var oHelperInitializeStub = testHelper.vars.oHelperInitializeStub,
            oParentControllerCalled, sFragmentCalled;

        oParentControllerCalled = oHelperInitializeStub.args[0][0].oParentController;
        sFragmentCalled = oHelperInitializeStub.args[0][0].sFragment;

        assert.ok(oHelperInitializeStub.called, "The fragment was initialize");
        assert.strictEqual(Object.keys(oHelperInitializeStub.args[0][0]).length, 3, "The method was called with the expected amount of arguments");
        assert.strictEqual(oParentControllerCalled, this.oServiceDemandFilterBar, "The method was called with the expected parent controller");
        assert.strictEqual(sFragmentCalled, "sap.coe.planning.calendar.component.ServiceDemandFilterBar", "The method was called with the expected fragment");
    });

    QUnit.test("init: Should set the model for the variant", function(assert) {
        var oFilterHelperSetModelStub = testHelper.vars.oFilterHelperSetModelStub;

        assert.ok(oFilterHelperSetModelStub.called, "The variant model was initialize");
        assert.ok(oFilterHelperSetModelStub.args[0][0] === this.oServiceDemandFilterBar, this.oServiceDemandFilterBar, "The model was set at component level");
    });

    QUnit.test("byId: Should return the element of the fragment with that id", function(assert) {
        var oFakeFilterBar = testHelper.vars.oFakeFilterBar,
            oFilterBar = this.oServiceDemandFilterBar.byId("idForFilterBar");

        assert.strictEqual(oFilterBar, oFakeFilterBar, "The FilterBar was returned");
    });

    QUnit.test("onRender: Should set todays date as default", function(assert) {
        var oFakeDateRange = testHelper.vars.oFakeDateRange;

        this.oServiceDemandFilterBar.onRender();

        assert.strictEqual(oFakeDateRange.getDateValue().toString(), new Date().toString(), "The start date value is todays day");
        assert.strictEqual(oFakeDateRange.getSecondDateValue().toString(), new Date().toString(), "The end date value is todays day");
    });

    QUnit.test("onRender: Should create the calendar week model", function(assert) {
        this.oServiceDemandFilterBar.onRender();

        assert.ok(this.oServiceDemandFilterBar.getModel("cw"), "The calendar week model was created");
    });

    QUnit.test("onClear: The filterbar helper should handle the clear event", function(assert) {
        var oFilterHelperClearStub = testHelper.vars.oFilterHelperClearStub,
            oFakeEvent = new sap.ui.base.Event();

        this.oServiceDemandFilterBar.onClear(oFakeEvent);

        assert.ok(oFilterHelperClearStub.calledWith(oFakeEvent), "The filterbar helper recieved the expected event");
    });

    QUnit.test("onSearch: Should fire the serach event with the expeted filters", function(assert) {
        var oFakeFilters = testHelper.vars.oFakeFilters,
            oFireEventStub = sandbox.stub(this.oServiceDemandFilterBar, "fireEvent");

        this.oServiceDemandFilterBar.onSearch(new sap.ui.base.Event());

        assert.ok(oFireEventStub.called, "The event was triggered");
        assert.strictEqual(oFireEventStub.args[0][0], "search", "The event was 'search'");
        assert.strictEqual(oFireEventStub.args[0][1].filters, oFakeFilters, "The filters were sent as a parameter of the event");
    });

    QUnit.test("onDatePickerValueChange: Should show a warning message when the calendar week is already filled", function(assert) {
        var oFakeCWField = testHelper.vars.oFakeCWField,
            oMessageBoxShowStub = sandbox.stub(sap.m.MessageBox, "show");

        oFakeCWField.addSelectedKeys(["12"]);
        this.oServiceDemandFilterBar.onDatePickerValueChange(new sap.ui.base.Event());

        assert.ok(oMessageBoxShowStub.called, "A warning message was shown");
    });

    QUnit.test("onCWsChange: Should show set the date range from the calendar week value", function(assert) {
        var oFakeEventCW = testHelper.vars.oFakeEventCW,
            oFakeDateRange = testHelper.vars.oFakeDateRange,
            oExpectedBegDate = new Date(2017, 2, 19),
            oExpectedEndDate = new Date(2017, 2, 25);

        var clock = sandbox.useFakeTimers(new Date(2016, 7, 19).getTime());
        this.oServiceDemandFilterBar.onCWsChange(oFakeEventCW);
        clock.restore();

        assert.ok(oFakeDateRange.getDateValue().toString(), oExpectedBegDate.toString(), "The start date was correctly set");
        assert.ok(oFakeDateRange.getSecondDateValue().toString(), oExpectedEndDate.toString(), "The end date was correctly set");
    });

    QUnit.test("onCWsChange: Should show a warning message when the date range is already filled", function(assert) {
        var oFakeEventCW = testHelper.vars.oFakeEventCW,
            oMessageBoxShowStub = sandbox.stub(sap.m.MessageBox, "show");

        this.oServiceDemandFilterBar.onRender();
        this.oServiceDemandFilterBar.onCWsChange(oFakeEventCW);

        assert.ok(oMessageBoxShowStub.called, "A warning message was shown");
    });

    QUnit.test("onTokenDelete: The token helper should handle the deletion of the token", function(assert) {
        var oTokenHelperDeleteStub = testHelper.vars.oTokenHelperDeleteStub;

        this.oServiceDemandFilterBar.onTokenDelete(new sap.ui.base.Event());

        assert.ok(oTokenHelperDeleteStub.called, "The token helper was called");
    });

    QUnit.test("onCancelationStatusChange: The token helper should handle the status changes", function(assert) {
        var onComboBoxChange = testHelper.vars.onComboBoxChange;

        this.oServiceDemandFilterBar.onCancelationStatusChange(new sap.ui.base.Event());

        assert.ok(onComboBoxChange.called, "The token helper was called");
    });

    QUnit.test("onUserStatusChange: The token helper should handle the status changes", function(assert) {
        var onComboBoxChange = testHelper.vars.onComboBoxChange;

        this.oServiceDemandFilterBar.onUserStatusChange(new sap.ui.base.Event());

        assert.ok(onComboBoxChange.called, "The token helper was called");
    });

    QUnit.test("getFilterBar: Should return the filterbar", function(assert) {
        var oFakeFilterBar = testHelper.vars.oFakeFilterBar,
            oFilterBar;

        oFilterBar = this.oServiceDemandFilterBar.getFilterBar();

        assert.strictEqual(oFilterBar, oFakeFilterBar, "It was possible to get the filterbar");
    });

    QUnit.test("onProductSearchOpen: Should create the fragment for product search", function(assert) {
        this.oServiceDemandFilterBar.onProductSearchOpen(new sap.ui.base.Event());

        assert.ok(this.oServiceDemandFilterBar._oDialogProductSearch, "It was defined");
    });

    QUnit.test("onProductSearchOpen: Should create a temp model copy for the variant manager", function(assert) {
        var oHelperCopyModelStub = testHelper.vars.oHelperCopyModelStub,
            oFakeFragmentSetModelStub = testHelper.vars.oFakeFragmentSetModelStub;

        this.oServiceDemandFilterBar.onProductSearchOpen(new sap.ui.base.Event());

        assert.ok(oFakeFragmentSetModelStub.called, "The model was set");
        assert.ok(oHelperCopyModelStub.called, "The temp model is a copy");
    });

    QUnit.test("onProductSearchOpen: Should open the product search dialog", function(assert) {
        var oFakeFragmentOpenStub = testHelper.vars.oFakeFragmentOpenStub;

        this.oServiceDemandFilterBar.onProductSearchOpen(new sap.ui.base.Event());

        assert.ok(oFakeFragmentOpenStub.called, "The dialog was opened");
    });

});
