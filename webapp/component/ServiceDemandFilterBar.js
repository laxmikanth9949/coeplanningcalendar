sap.ui.define([
    "sap/ui/core/Control",
    "sap/coe/planning/calendar/util/helpers",
    "sap/coe/capacity/reuselib/controls/CustomVariantManager/CustomVariantManagerComponent",
    "sap/coe/capacity/reuselib/utils/VariantFilterHelper",
    "sap/coe/capacity/reuselib/utils/TokenHelper",
    "sap/coe/planning/calendar/util/i18n",
    "sap/coe/capacity/reuselib/fragment/ProductSearch.fragment.controller",
    "sap/m/MessageToast",
    "sap/coe/capacity/reuselib/utils/baseclasses/Helpers"
], function(Control, helpers, CustomVariantManager, oFilterHelper, TokenHelper, i18n, ProductSearchController, MessageToast, reuseHelper) {

    return Control.extend("sap.coe.planning.calendar.component.ServiceDemandFilterBar", {

        /**
         * @event search Fired for every search.
         * @param {Array} oEvent.filters The array of filter ready to be applied to an element.
         */
        metadata: {
            properties: {
                preventSearchAfterLoad: {
                    type: "boolean",
                    defaultValue: false
                }
            },
            events: {
                search: {
                    parameters: {
                        filters: { type: "array" }
                    }
                }
            }
        },

        /**
         * @property {Object} renderer - renderer of composite control
         * @property {Function} renderer.render - render function that renders the fragment
         */
        renderer: {
            render: function(oRm, oControl) {
                oRm.renderControl(oControl.oFragment);
                oControl.onRender();
            }
        },

        init: function() {
            this.oFragment = helpers.initializeFragmentFromObject({
                oParentController: this,
                sFragment: "sap.coe.planning.calendar.component.ServiceDemandFilterBar",
                sCreateId: this.getId()
            });

            oFilterHelper.setVariantFilterModel(this);
        },

        /**
         * Get the element by id 
         *
         *
         * @public
         *
         * @param {string} sId The id of the element
         *
         * @returns {sap.ui.core.Control} The element 
         *
         */
        byId: function(sId) {
            return this.oFragment.byId(sId);
        },

        /**
         * Triggered after the control has been rendered.
         *
         *
         * @public
         * @returns {void}
         *
         */
        onRender: function() {
            var oFilterBar = this.getFilterBar(),
                oDefaultVariant = {
                    StaffingLevel: ["A", "A"]
                };
            // this.getParent() id idForValueHelpDialog... but doesnt seem to have correct dependencies !
            // this is program flow selecting '+' on PC and variants in help dialog    
            var oControllerWithAccessToCompoenent = this.getParent().getParent().getController();
            //just passing reference to parent with access to application component
            //the reason we cannot access component is bc dependencies not passed correctly
            //TODO implement all dependencies so child controller have access to app comp!
                
            if (oFilterBar.customVariantManager === undefined){
                oFilterBar.customVariantManager = new CustomVariantManager({
                    appId: "SAP.COE.PLANNING.CALENDARPilot04",
                    variantSet: "WORKLISTPilot04",
                    defaultVariant: oDefaultVariant,
                    preventSearchAfterLoad: this.getPreventSearchAfterLoad(),
                    filterBar: oFilterBar,
                    parentControllerContext: oControllerWithAccessToCompoenent
                });
            }


            this._addValidator(this.byId("idForDemandID"));
            this._addValidator(this.byId("idForProductID"));
        //awaiting back end changes to implement
       // this._addValidator(this.byId("idForItemNo"));
        },

        /**
         * This function is called after rendering of the component. In here the model is already bound to the control
         * @name onAfterRendering
         * @function
         * @memberOf StandardNotesListComponent#
         * @return {void}
         */
        onAfterRendering: function() {
            this.oWorklistController = helpers.getParentController(this.getParent());
            this.oOwnerComponent = this.oWorklistController.getOwnerComponent();


            if (this.getPreventSearchAfterLoad()) { //Coming from cross navigation
                this.getFilterBar().search();

                var oStaffingLevel = this.byId("idForStaffingLevel"),
                    oOrderType = this.byId("idForTransactionType"),
                    oUIArea = this.oOwnerComponent.getUIArea();

                //Invalidate manually the staffing level and order type fields and forze a delayed rerender. Token wasn't rendered but was created.
                oUIArea.mInvalidatedControls[oStaffingLevel.getId()] = oStaffingLevel;
                oUIArea.mInvalidatedControls[oOrderType.getId()] = oOrderType;
            }
        },

        /**
         * Event "clear" of the FilterBar.
         *
         *
         * @public
         * @returns {void}
         *
         */
        onClear: function(oEvent) {
            oFilterHelper.onFilterBarClear(oEvent);
        },

        /**
         * Event "search" of the FilterBar. Check the dates/date ranges to be used then fires the search of the filter bar.
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        onSearch: function(oEvent) {
            var oVariantFilterModel = this.getFilterBar().getModel("VariantFilterModel"),
                oVariantFilterContent = oVariantFilterModel.oData;
				
			// check if the user has entered an OrderType in their search
            if (!oVariantFilterContent.hasOwnProperty("TransactionType") || oVariantFilterContent.TransactionType.length === 0) {
                // we need to add both the selectable values to filter out irrelevant search results
                oVariantFilterContent.TransactionType = ["ZSK1", "ZS91"];
                oVariantFilterModel.refresh();
            }

            // if start/end date is not saved in variant we need to apply date range instead
            if (!oVariantFilterContent.hasOwnProperty("startDate")) {
                var aDateRange;
                this.aDateRangePers = this.oWorklistController._getDateRangePers();
                // if a custom date range has been saved
                if(this.aDateRangePers[0]) {
                    aDateRange = helpers.getDateRangeForNumberOfWeeks(new Date(), this.aDateRangePers[1], this.aDateRangePers[0]);
                    oVariantFilterContent.startDate = aDateRange[0];
                    oVariantFilterContent.endDate = aDateRange[1];
                }
                // use the default date range specified
                else {
                    aDateRange = helpers.getDateRangeForNumberOfWeeks(new Date(), 5, 1);
                    oVariantFilterContent.startDate = aDateRange[0];
                    oVariantFilterContent.endDate = aDateRange[1];
                }
                oVariantFilterModel.refresh();

                // when date range has been applied, then we can search
                this.onSearchVariants(oEvent);
            }
            else {
                this.onSearchVariants(oEvent);
            }
        },

        /**
         * Checks that mandatoy fields have been entered correctly and then fires the 'search' event of the filter bar
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         *
         */
        onSearchVariants: function(oEvent) {
            var aSelectedFilters = oFilterHelper.getFiltersSimple(oEvent),
            bMandatoryFieldsProvided = this._checkMandatoryFilters(aSelectedFilters);

            if(bMandatoryFieldsProvided){
                for (var i = 0; i < aSelectedFilters.length; i++) {
                    if (aSelectedFilters[i].sPath === "BegDate") {
                        aSelectedFilters[i].sPath = "StartDate";
                        break;
                    }
                }
                this._addFiltersForStaffingLevel(aSelectedFilters);
                this.fireEvent("search", {
                    filters: aSelectedFilters
                });
            }
        },

        //TODO this is a workaround, enhance back-end to return results for staffing codes
        //B(was "partially staffed"), C(was "completely staffed") and D(was "overstaffed")
        // when B(now "staffed") is selected.
        //jira task -> https://sapjira.wdf.sap.corp/browse/NGIPIRELAND05-382
        _addFiltersForStaffingLevel: function(aSelectedFilters){
            var aItems = this.byId("idForStaffingLevel").getSelectedItems();
            aItems.forEach(function(item) {
                if(item.getProperty("key") === "B"){
                    var oCompletelyStaffedFilter = {
                            oValue1: "C",
                            oValue2: undefined,
                            sOperator: "EQ",
                            sPath: "StaffingLevel",
                            _bMultiFilter: false
                    },
                    oOverstaffedFilter = {
                            oValue1: "D",
                            oValue2: undefined,
                            sOperator: "EQ",
                            sPath: "StaffingLevel",
                            _bMultiFilter: false
                    };
                    aSelectedFilters.push(oCompletelyStaffedFilter);
                    aSelectedFilters.push(oOverstaffedFilter);

                }
            });
        },

        /**
        * Checks if mandatory filters have been provided
        * @public
        * @param {array} aFilters - An array of filters.
        * @returns {boolean} - returns true or false based on if the mandatory filters are provided
        */
        _checkMandatoryFilters: function(aFilters) {
            var iStartDateCount = 0,
            iEndDateCount = 0,
            iCancellationStatusCount = 0,
            iDemandIDCount = 0,
            iOrgWithoutRSDCount = 0;

            aFilters.forEach(function(oElement) {
                if (oElement.sPath === "BegDate") {
                    iStartDateCount++;
                }
                else if (oElement.sPath === "EndDate") {
                    iEndDateCount++;
                }
                else if (oElement.sPath === "CancellationStatus") {
                    iCancellationStatusCount++;
                }
                else if (oElement.sPath === "DemandID") {
                    iDemandIDCount++;
                }
            });

            var aOrgSelection = this.byId("idForOrganization").getFragment().getTokens();
            for (var i = 0; i < aOrgSelection.length; i++) {
                if(aOrgSelection[i].getText().indexOf("RSD") < 0){
                    iOrgWithoutRSDCount++;
                    break;
                }
            }

            if ((iCancellationStatusCount < 1) && ((iDemandIDCount > 0) && (iOrgWithoutRSDCount > 0) && (iOrgWithoutRSDCount < 0))) {
                MessageToast.show(i18n.getText("COMPONENT_SERVICE_DEMAND_FILTERBAR_MESSAGETOAST_NO_CANCELLATION_STATUS"), {
                    duration: 5000,
                    width: "25em"
                });
                return false;
            }

            if (((iStartDateCount < 1) || (iEndDateCount < 1)) && (iOrgWithoutRSDCount > 0) && (iDemandIDCount < 1)) {
                MessageToast.show(i18n.getText("COMPONENT_SERVICE_DEMAND_FILTERBAR_MESSAGETOAST_NO_RSD"), {
                    duration: 5000,
                    width: "25em"
                });
                return false;
            }

            if (((iStartDateCount < 1) || (iEndDateCount < 1) || (iCancellationStatusCount < 1)) && (iDemandIDCount < 1) && (iOrgWithoutRSDCount > 0)) {
                MessageToast.show(i18n.getText("COMPONENT_SERVICE_DEMAND_FILTERBAR_MESSAGETOAST_NO_SO"), {
                    duration: 5000,
                    width: "25em"
                });
                return false;
            }

            if (((iStartDateCount < 1) || (iEndDateCount < 1)) && (iCancellationStatusCount > 0) && (iDemandIDCount < 1) && (aOrgSelection.length === 0)) {
                MessageToast.show(i18n.getText("COMPONENT_SERVICE_DEMAND_FILTERBAR_MESSAGETOAST_CANCEL_ONLY"), {
                    duration: 5000,
                    width: "25em"
                });
                return false;
            }

            if (((iStartDateCount === 1) || (iEndDateCount === 1)) && (iCancellationStatusCount === 0) && (iDemandIDCount < 1) && (aOrgSelection.length === 0)) {
                MessageToast.show(i18n.getText("COMPONENT_SERVICE_DEMAND_FILTERBAR_MESSAGETOAST_NO_REQUIRED_FIELDS"), {
                    duration: 5000,
                    width: "25em"
                });
                return false;
            }

            if (((iStartDateCount < 1) || (iEndDateCount < 1)) && (iCancellationStatusCount < 1) && (iDemandIDCount < 1) && (aOrgSelection.length === 0)) {
                MessageToast.show(i18n.getText("COMPONENT_SERVICE_DEMAND_FILTERBAR_MESSAGETOAST_NO_REQUIRED_FIELDS"), {
                    duration: 5000,
                    width: "25em"
                });
                return false;
            }

            return true;
        },

        /**
         * Event "delete" of Token.
         * @param {object} oEvent - The object which called the function
         * @public
         * @returns {void}
         *
         */
        //TODO: does not appear to be used
        onTokenDelete: function(oEvent) {
            var oVariantFilterModel = this.oView.getModel("VariantFilterModel");
            TokenHelper.onTokenDelete(oEvent, oVariantFilterModel);
        },

        /**
         * Event "selectionChange" of cancelation status ComboBox.
         * @param {object} oEvent - The object which called the function
         * @public
         * @returns {void}
         *
         */
        onCancelationStatusChange: function(oEvent) {
            TokenHelper.onComboBoxChange(oEvent);
        },

        /**
         * Event "selectionChange" of user status ComboBox.
         * @param {object} oEvent - The object which called the function
         * @public
         * @returns {void}
         *
         */
        onUserStatusChange: function(oEvent) {
            TokenHelper.onComboBoxChange(oEvent);
        },

        /**
         * Event "valueHelpRequest" of the service product MultiInput. Initialize and open the ProductSearch fragment of the reuse library
         * @param {object} oEvent - The object which called the function
         * @public
         * @returns {void}
         *
         */
        onProductSearchOpen: function(oEvent) {
            if (!this._oDialogProductSearch) {
                this._oDialogProductSearch = helpers.initializeFragmentFromObject({
                    oParentController: this,
                    sFragment: "sap.coe.capacity.reuselib.fragment.ProductSearch",
                    ControllerClass: ProductSearchController,
                    sCreateId: this.getId() + "--ProductSearch"
                });

            }
            this._oDialogProductSearch.setModel(helpers.copyModel(this.oView.getModel("VariantFilterModel")), "TempModel");
            jQuery.sap.syncStyleClass("sapUiSizeCompact");
            this._oDialogProductSearch.open();
        },

        /**
         * Return the Filter Bar 
         *
         *
         * @public
         *
         * @returns {sap.ui.comp.filterbar.FilterBar} The FilterBar 
         *
         */
        getFilterBar: function() {
            return this.byId("idForFilterBar");
        },

        /**
         * Fill the filterbar with the variables retrieved from cross navigation 
         *
         *
         * @public
         *
         * @param {Object} oParams Object with all the variables to fill
         * @param {Array} oParams.BegDate Array with a string date for start date
         * @param {Array} oParams.EndDate Array with a string date for end date
         * @param {Array} oParams.DemandServiceTeam Array with all the services team ids to fill
         * @param {Array} oParams.DemandQualification Array with all the qualifications ids to fill
         *
         * @returns {void}
         *
         */
        prefilFilters: function(oParams) {
            this.setPreventSearchAfterLoad(true);

            if (oParams.BegDate && oParams.EndDate) {
                this.byId("idForStartEndDate").setDateValue(new Date(oParams.BegDate[0].replace(new RegExp("%3A", "g"), ":")));
                this.byId("idForStartEndDate").setSecondDateValue(new Date(oParams.EndDate[0].replace(new RegExp("%3A", "g"), ":")));
            }

            if (oParams.DemandServiceTeam) {
                var oServiceTeam = this.byId("idForOrganization");

                for (var i = 0; i < oParams.DemandServiceTeam.length; i++) {
                    oServiceTeam.insertServiceTeam(oParams.DemandServiceTeam[i]);
                }
            }

            if (oParams.DemandQualification) {
                var oQualification = this.byId("idForQualification");

                for (i = 0; i < oParams.DemandQualification.length; i++) {
                    oQualification.insertQualification(oParams.DemandQualification[i]);
                }
            }

            //Prefil default filters for not staffed demands
            var oUtilsModel = new sap.ui.model.json.JSONModel(),
                oFilterBarModel = this.getModel("VariantFilterModel"),
                oFilterBarData = oFilterBarModel.getProperty("/");

            oFilterBarData.CancellationStatus = "02"; //Not Cancelled

            oFilterBarData.StaffingLevel = oFilterBarData.StaffingLevel || [];
            oFilterBarData.StaffingLevel.push("A"); //Not Staffed

            oFilterBarData.TransactionType = oFilterBarData.TransactionType || [];
            oFilterBarData.TransactionType.push("ZSK1"); //Service Delivery Order
            oFilterBarData.TransactionType.push("ZS21"); //Z_Old Support Delivery Order
            oFilterBarData.TransactionType.push("ZS91"); //Resource Request

            oFilterBarData.UserStatus = "0"; //Not cancelled

            //UtilsModel have to be loaded synchronously in cross navigation otherwise the fields are not ready for the search after rendering
            this.setModel(oUtilsModel, "UtilsModel");
            oUtilsModel.loadData(jQuery.sap.getModulePath("sap.coe.planning.calendar") + "/model/utilsModel.json", undefined, false);
            oUtilsModel.refresh();
            oFilterBarModel.refresh();
        },

        /**
         * Basic MultiInput Validator
         * @name _addValidator
         * @function
         * @memberOf BaseFragmentComponent#
         * @param {Object} oMultiInput
         * @return {Object}
         */
        _addValidator: function(oMultiInput) {
            oMultiInput.addValidator(function(args) {
                var sText = args.text;
                return new sap.m.Token({ key: sText, text: sText });
            });
        },

        /**
         * Genaric Token Change
         * @name onTokenChange
         * @function
         * @param {Object} oEvent - object which calls the function
         * @return {void}
         */
         
    onTokenChange: function(oEvent) {
    oEvent.preventDefault();
            var oVariantFilterModel = this.getModel("VariantFilterModel");
            var sType = oEvent.getParameter("type");
            var sPath, sKey, bTokenExists, oModelProperty;
            // Do not do anything for "tokenChanged" event only for "added" or "removed"
            // Dialogs take care of there own tokens process token events
            if (sType === "tokensChanged" || this.bInsertTokensFromDialog) {
                return;
            }
            sPath = TokenHelper.getFilterTypeToken(oEvent.getSource());
           
            oModelProperty = oVariantFilterModel.getProperty("/" + sPath);
       
          if (sType === "removed" || sType === "removedAll") {
          sKey = oEvent.getParameters("removedTokens").removedTokens[0].getProperty("key");
          bTokenExists = oModelProperty ? this._getTokenExists(oModelProperty, sKey) : false;
          TokenHelper.removeToken(oVariantFilterModel.getProperty("/"), sKey, sPath, true);
             
            } 
            else if (sType === "added") {
			sKey = oEvent.getParameters("addedTokens").addedTokens[0].getProperty("key");
			bTokenExists = oModelProperty ? this._getTokenExists(oModelProperty, sKey) : true;
           
            TokenHelper._addToken(oVariantFilterModel.getProperty("/"), sKey, sKey, sPath, true);
            
            }
        },




        _getTokenExists: function(oData, sKey) {
            var aExistingTokens = oData.filter(function(oItem) {
                return oItem.id === sKey;
            });
            return aExistingTokens.length > 0;
        }
    });
});
