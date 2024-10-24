sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/coe/capacity/reuselib/utils/helpers",
    "sap/coe/planning/calendar/util/i18n",
    "sap/coe/capacity/reuselib/utils/P13nHelper"
], function(Controller, helpers, i18n, P13nHelper) {

    "use strict";

    var that;

    return Controller.extend("sap.coe.planning.calendar.fragment.DateRangeSettings.fragment", {

        /**
         * Called when the date range settings dialog has been opened
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        openDateRangeDialog: function(oEvent) {
            var oFragment = oEvent.getSource();
            this.oParentController = oFragment.getParent().getController();
            this.oAppComponent = this.oParentController.getOwnerComponent();
            this.oDateRangePast = oFragment.byId("idForDateRangePast");
            this.oDateRangeFuture = oFragment.byId("idForDateRangeFuture");

            this.setDateRangeValues();
        },

        /**
         * Sets the date range values that have been saved in the personalisation service (if any)
         * @public
         * @returns {void}
         */
        setDateRangeValues: function() {
            var aDateRanges = this.oParentController._getDateRangePers();
            this.oDateRangePast.setValue(aDateRanges[0]);
            this.oDateRangeFuture.setValue(aDateRanges[1]);

            /*UI Changes needed, moved to next wave
            var aDateRanges = this.oParentController._getDateRangePers(),
                oVariantModel = this.oParentController.byId("ServiceDemandFilterBar").getModel("VariantFilterModel"),
                bDateRangeSaved = oVariantModel.oData.staticRangeSaved;

            if (bDateRangeSaved) {
                this.oDateRangePast.setValue(oVariantModel.oData.dateRangePast);
                this.oDateRangeFuture.setValue(oVariantModel.oData.dateRangeFuture);
            }
            else {
                this.oDateRangePast.setValue(aDateRanges[0]);
                this.oDateRangeFuture.setValue(aDateRanges[1]); 
            }*/
            
        },

        /**
         * Saves the date range set in the personalisation service
         * @param {Object} oPersData - object with the data to be saved to the personalisation service
         * @private
         * @returns {void}
         */
        _savep13n: function(oPersData) {
            this.oAppComponent.updateP13n("_oDynamicDateRangeP13n", oPersData);
        },

        /**
         * User confirms the date range entered, is applied on frontend and saved in personalisation service
         * @param {Object} oPersData - object with the data to be saved to the personalisation service
         * @private
         * @returns {void}
         */
        onSelectDateRange: function(oEvent) {
            var oVariantModel = oEvent.getSource().getParent().getParent().byId("ServiceDemandFilterBar").getModel("VariantFilterModel"),
                iDateRangePast = this.oDateRangePast.getValue(),
                iDateRangeFuture = this.oDateRangeFuture.getValue(),
                aDateRange = helpers.getDateRangeForNumberOfWeeks(new Date(), iDateRangeFuture, iDateRangePast),
                oPersData = {pastDateRange: this.oDateRangePast.getValue(), futureDateRange: this.oDateRangeFuture.getValue()};

            // update the date range in the filter bar, unless there is a saved static date used
            if (!oVariantModel.oData.staticDateSaved) {
                oVariantModel.oData.startDate = aDateRange[0];
                oVariantModel.oData.endDate = aDateRange[1];
                oVariantModel.refresh();
            }

            /*UI Changes needed, moved to next wave
            if (oVariantModel.oData.staticRangeSaved) {
                oVariantModel.oData.dateRangePast = iDateRangePast;
                oVariantModel.oData.dateRangeFuture = iDateRangeFuture;
            }*/

            this._savep13n(oPersData);
            this.oParentController._setDateRangePers(oPersData);
            this.onCloseDialog(oEvent);
        },

        /**
         * Closes the dialog
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        onCloseDialog: function(oEvent) {
            var oDialog = oEvent.getSource().getParent();
            oDialog.close();
        }
    });

});
