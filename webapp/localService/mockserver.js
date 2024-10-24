sap.ui.define([
    "sap/ui/core/util/MockServer",
    "sap/coe/planning/calendar/util/helpers",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/coe/planning/calendar/controller/Worklist.controller",
    "sap/coe/planning/calendar/component/ServiceDemandFilterBar",
    "sap/coe/capacity/reuselib/controls/EmployeeSingleSelect/EmployeeSearchComponent",
    "sap/coe/capacity/reuselib/controls/QualificationSelect/QualificationSelectComponent",
    "sap/ui/thirdparty/sinon"
], function(MockServer, oHelper) {
    "use strict";
    return {
        init: function() {
            // create
            /* eslint-disable sap-no-hardcoded-url */
            var oHost = "https://",
                oMockServer = new MockServer({
                rootUri: oHost + "pgtmain.wdf.sap.corp/sap/opu/odata/sap/ZS_AGS_DASHBOARDS_SRV/"
            });
            /* eslint-enable sap-no-hardcoded-url */
            var oUriParameters = jQuery.sap.getUriParameters();
            // configure
            MockServer.config({
                autoRespond: true,
                autoRespondAfter: oUriParameters.get("serverDelay") || 1000
            });
            // simulate
            var sPath = jQuery.sap.getModulePath("sap.coe.planning.calendar.localService");
            oMockServer.simulate(sPath + "/metadata.xml", {
                sMockdataBaseUrl: sPath + "/mockdata",
                aEntitySetsNames: ["OrgUnitSet", "SubOrgUnitSet", "ResDemandSet", "QualificationList",
                    "ResourceList", "ResPublicHolidaysSet", "RPTASTDataSet", "ResServiceTeamSet", "ResTimeZoneSet",
                    "SearchVariants", "VariantDetails", "TimeAllocationList", "ServiceProductSet", "QualSearchHelpSet"
                ],
                bGenerateMissingMockData: true
            });


            sap.coe.planning.calendar.component.ServiceDemandFilterBar.prototype._setDefaultFieldsOriginal = sap.coe.planning.calendar.component.ServiceDemandFilterBar.prototype._setDefaultFields;
            sap.coe.planning.calendar.component.ServiceDemandFilterBar.prototype._setDefaultFields = function() {
                var clock = sinon.useFakeTimers(new Date("Mon Jul 25 2016 09:00:00 GMT+0100 (GMT Daylight Time)").getTime()); //Mock all the calls to Date() returning 25/07/2016 at 9 am in _setTestFilterOptions method
                var returnValue = this._setDefaultFieldsOriginal.apply(this, arguments);
                clock.restore();
                return returnValue;
            };

            sap.coe.capacity.reuselib.controls.EmployeeSingleSelect.EmployeeSearchComponent.prototype._createFiltersForEmployeeSearchOrginal = sap.coe.capacity.reuselib.controls.EmployeeSingleSelect.EmployeeSearchComponent.prototype._createFiltersForEmployeeSearch;
            sap.coe.capacity.reuselib.controls.EmployeeSingleSelect.EmployeeSearchComponent.prototype._createFiltersForEmployeeSearch = function() {
                var clock = sinon.useFakeTimers(new Date("Mon Jul 25 2016 01:00:00 GMT+0100 (GMT Daylight Time)").getTime()); //Mock all the calls to Date() returning 25/07/2016 at 1 am in _createFiltersForEmployeeSearch method
                var returnValue = this._createFiltersForEmployeeSearchOrginal.apply(this, arguments);
                clock.restore();
                return returnValue;
            };

            sap.coe.capacity.reuselib.controls.QualificationSelect.QualificationSelectComponent.prototype._getFiltersOriginal = sap.coe.capacity.reuselib.controls.QualificationSelect.QualificationSelectComponent.prototype._getFilters;
            sap.coe.capacity.reuselib.controls.QualificationSelect.QualificationSelectComponent.prototype._getFilters = function() {
                var clock = sinon.useFakeTimers(new Date("Mon Jul 25 2016 09:00:00 GMT+0100 (GMT Daylight Time)").getTime()); //Mock all the calls to Date() returning 25/07/2016 at 9 am in _createFilters method
                var returnValue = this._getFiltersOriginal.apply(this, arguments);
                clock.restore();
                // Need to overwrite sPath as backend implementation is unusual
                returnValue[2].sPath = "QKID";
                //Filters don't work well in Qualification Component. Return empty filters in Mockserver temporarily.
                return [returnValue[2]];
            };

            sap.coe.capacity.reuselib.controls.BaseControl.BaseFragmentComponent.prototype._initFragmentOriginal = sap.coe.capacity.reuselib.controls.BaseControl.BaseFragmentComponent.prototype._initFragment;
            sap.coe.capacity.reuselib.controls.BaseControl.BaseFragmentComponent.prototype._initFragment = function() {
                var clock = sinon.useFakeTimers(new Date("Mon Jul 25 2016 09:00:00 GMT+0100 (GMT Daylight Time)").getTime()); //Mock all the calls to Date() returning 25/07/2016 at 9 am in _init method of the sap.m.PlanningCalendar
                this._initFragmentOriginal.apply(this, arguments);
                clock.restore();
            };

            this._mockVariantCreateRequest();
            this._mockODataRead();

            // start
            oMockServer.start();
        },

        _mockVariantCreateRequest: function() {
            sap.ui.model.odata.v2.ODataModel.prototype._createBeforeMockVariant = sap.ui.model.odata.v2.ODataModel.prototype.create;
            sap.ui.model.odata.v2.ODataModel.prototype.create = function() {

                if (arguments[0].indexOf("SearchVariants") !== -1) {
                    var oRequestCopy = JSON.parse(JSON.stringify(arguments[1]));

                    var successOriginal = arguments[2].success;

                    arguments[2].success = function(odata, response) {
                        odata.VariantDetails.results = oRequestCopy.VariantDetails;
                        if (!odata.VariantDetails.results[odata.VariantDetails.results.length - 1].VariantId) { //SaveAs
                            odata.VariantDetails.results[odata.VariantDetails.results.length - 1].VariantId = "newVariantID";
                        }
                        successOriginal(odata, response);
                    };
                }

                return this._createBeforeMockVariant.apply(this, arguments);
            };
        },

        _mockODataRead: function() {
            sap.ui.model.odata.v2.ODataModel.prototype._readOriginal = sap.ui.model.odata.v2.ODataModel.prototype.read;
            sap.ui.model.odata.v2.ODataModel.prototype.read = function() {
                if (arguments[0].indexOf("QualSearchHelpSet") !== -1 && arguments[1].urlParameters[1]) {
                    var sQuery = decodeURI(arguments[1].urlParameters[1]).split("'")[1],
                        aFilters = [],
                        sFilter;

                    if (sQuery && sQuery.length > 0) {
                        aFilters.push(new sap.ui.model.Filter("QualificationID", sap.ui.model.FilterOperator.Contains, sQuery));
                        aFilters.push(new sap.ui.model.Filter("QualificationText", sap.ui.model.FilterOperator.Contains, sQuery));
                    }

                    sFilter = oHelper.getFilterParameterStringFromModel(aFilters, this, "/QualSearchHelpSet").replace("and", "or");
                    arguments[1].urlParameters[1] = sFilter;
                }

                return this._readOriginal.apply(this, arguments);
            };
        }
    };
});
