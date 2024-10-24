sap.ui.define([
    "sap/coe/capacity/reuselib/utils/baseclasses/Helpers"
], function(HelpersBaseClass) {
    "use strict";

    var HelperClass = HelpersBaseClass.extend("sap.coe.planning.calendar.util.helpers", {

        /**
         * Return the string $filter variable to append to the service request when this is build manually 
         *
         * Example of returned value: $filter=BegDate%20eq%20Tue%20May%2017%202016%2011%3a22%3a00%20GMT%2b0100%20%28GMT%20Daylight%20Time%29%20and%20EndDate%20eq%20Tue%20May%2017%202016%2011%3a22%3a00%20GMT%2b0100%20%28GMT%20Daylight%20Time%29
         *
         * @public
         *
         * @param {array} aFilters Array of sap.ui.model.Filter
         * @param {sap.ui.model.odata.v2.ODataListBinding} oBinding The filtered data
         *
         * @returns {string} The filter variable ready to append to the URL as a new variable
         *
         */
        getFilterParameterStringFromBinding: function(aFilters, oBinding) {
            return sap.ui.model.odata.ODataUtils.createFilterParams(aFilters, oBinding.oModel.oMetadata, oBinding.oEntityType);
        },

        //this function is to change the title displayed when we are viewing 'RSP'
        //navigating from RDL -> RSP, RSP -> RDL give the impression the user has navigated to another app
        //when really we are still inside coeplanningcalendar and thus the title will not change.
        //so we change it to give the impression the user is now in RSP
        setShellTitle: function(oComponent, sTitle){
            oComponent.getService("ShellUIService").then( // promise is returned
                function (oService) {
                    oService.setTitle(sTitle); // also could use .getTitle() first
                },
                function (oError) {
                    jQuery.sap.log.error("Cannot get ShellUIService", oError, "sap.coe.planning.calendar.Component");
                }
            );
        },

        /**
         * Return the string $filter variable to append to the service request
         * when this is build manually for export to excel functionality.
         *
         * Example of returned value: $filter=((OrgId%20eq%20%2730015950%27)%20and%20(BegDate%20eq%20datetime%272016-05-15T23%3a00%3a00%27%20and%20EndDate%20eq%20datetime%272016-05-22T22%3a59%3a59%27))
         *
         * @public
         *
         * @param {array} aFilters Array of sap.ui.model.Filter 
         * @param {sap.ui.model.odata.v2.ODataModel} oModel The model
         * @param {string} sPath The path used to build the filter
         *
         * @returns {string} The filter variable ready to append to the URL as a new variable
         *
         */
        getFilterParameterStringFromModel: function(aFilters, oModel, sPath) {
            var oEntity = oModel.oMetadata._getEntityTypeByPath(sPath),
                sFilter = sap.ui.model.odata.ODataUtils.createFilterParams(aFilters, oModel.oMetadata, oEntity);

            return sFilter;
        }

    });

    return new HelperClass();

});
