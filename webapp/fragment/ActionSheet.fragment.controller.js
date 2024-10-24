sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/coe/planning/calendar/util/helpers"
], function(Controller, helpers) {

    "use strict";

    return Controller.extend("sap.coe.planning.calendar.fragment.ActionSheet.fragment", {

        onExportToExcel: function() {
            var oParentView = this.getView().getParent().getParent(),
                sParams;

            if (helpers.isViewOf(oParentView, "Worklist")) {
                sParams = this._getWorklistParameters(oParentView);
                window.open(this._getUrl("ResDemandSet", sParams));
            } else if (helpers.isViewOf(oParentView, "Detail")) {
                sParams = this._getPlanningCalendarParameters(oParentView);
                window.open(this._getUrl("RPTASTDataSet", sParams));
            }
        },

        /**
         * Creates an url taking the service uri of the mainService
         *
         * @private
         * @param {string} path The requested resource of the service
         * @param {string} parameters The parameters added to the GET request
         * @returns {string} The url
         */
        _getUrl: function(path, parameters) {
            var oPopOver = this.getView().getParent(),
                oWorklistController = oPopOver.getParent().getController(),
                oAppComponent = oWorklistController.getOwnerComponent(oWorklistController),
                oManifest = oAppComponent.getManifestEntry("sap.app"),
                sUri = oManifest.dataSources.mainService.uri;

            return sUri + path + "?" + parameters;
        },

        _getWorklistParameters: function(oWorklistView) {
            var oBindingItemsInTable = oWorklistView.byId("worklistTable").getBinding("items"),
                oWorklistController = oWorklistView.getController(),
                sFilter = helpers.getFilterParameterStringFromBinding(oWorklistController.aCurrentFilters, oBindingItemsInTable);

            return sFilter !== undefined ? "$format=xlsx&" + sFilter : "$format=xlsx";
        },

        _getPlanningCalendarParameters: function(oDetailView) {
            var oDetailController = oDetailView.getController(),
                oModel = oDetailView.getModel(),
                sFilter = helpers.getFilterParameterStringFromModel(oDetailController.aCurrentFilters, oModel, "/ResourceList");

            return sFilter !== undefined ? "$format=xlsx&" + sFilter : "$format=xlsx";
        }

    });

});
