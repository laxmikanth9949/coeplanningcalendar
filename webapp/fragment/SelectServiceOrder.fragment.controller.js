sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/coe/capacity/reuselib/utils/VariantFilterHelper",
    "sap/coe/planning/calendar/util/helpers",
    "sap/coe/planning/calendar/util/i18n",
    "sap/coe/capacity/reuselib/utils/TokenHelper",
    "sap/coe/planning/calendar/util/formatter"

], function(Controller, VariantHelper, helpers, i18n, TokenHelper, formatter) {

    "use strict";

    return Controller.extend("sap.coe.planning.calendar.fragment.SelectServiceOrder.fragment", {
        VariantHelper: VariantHelper,
        _viewInitialized: false,


        onAfterOpen: function() {
            if (!this._viewInitialized) {
                this._setFilterBar();
                this._setTable();
                this._initializeMasterListModel();
                this._attachAfterRenderingEvent();
                this._viewInitialized = true;
            }
            this._attachTableSelectionChangeListener();
            this._setTokens();
        },

        onAfterRendering: function() {
            this._hideFilterBarSource();
        },
        /**
         * When the ok button is pressed the tokens created by whatever selections were made are passed to a function
         * which will usae those tokens to populate the master list
         *
         * @public
         * @param {object} oEvent - object which calls the function
         * @returns {void}
         */
        onOkPress: function(oEvent) {
            this._addTokensToMasterList(oEvent.getParameter("tokens"));
            this.getView().close();
        },
        /**
         * When the cancel button is pressed the dialog is closed
         *
         * @public
         * @param {object} oEvent - object which calls the function
         * @returns {void}
         */
        onCancelPress: function(oEvent) {
            this.getView().close();
        },
        /**
         * When the search button is pressed on the filterbar, the table binding is filtered based on the selected
         * filters, the bindin is then updated
         *
         * @public
         * @param {object} oEvent - object which calls the function
         * @returns {void}
         */
        onSearch: function(oEvent) {
            var aFilters = oEvent.getParameter("filters"),
            oView = this.getView(),
            oTableBinding = oView.getTable().getBinding("rows");
            // Apply filter to binding if binding is defined
            if (oTableBinding) {
                oTableBinding.filter(aFilters);
                oView.update();
            }
        },
        /**
         * Gets the filterbar and sets it to the view
         *
         * @public
         * @returns {void}
         */
        _setFilterBar: function() {
            var oFilterBar = this.getView().byId("ServiceDemandFilterBar").getFilterBar();
            // TODO workaround for issue with setFilterBar function of ValueHelpDialog removing data from VariantFilterModel
            // Caches data from model and then reapplies it after filter bar is set
            var oModelCache = oFilterBar.getModel("VariantFilterModel").getProperty("/");
            this.getView().setFilterBar(oFilterBar);
            oFilterBar.getModel("VariantFilterModel").setProperty("/", oModelCache);
        },


        /**
         * Attached a selection change listener to the table so that each time a selection is made the table will fire event
         *
         * @public
         * @param {object} oEvent - object which calls the function
         * @returns {void}
         */
        _attachTableSelectionChangeListener: function() {
            var that = this,
                oTable = this.getView().getTable();

            //TODO: modify this functionality to detach the event listener when it is not needed
            oTable.attachRowSelectionChange(function(oEvent){
                that.onSelectionChange(oEvent);
            });

        },
        /**
         * Gets the table in the view and binds it to ResDemandSet, add all the column headings and attaches event listeners
         *
         * @public
         * @param {object} oEvent - object which calls the function
         * @returns {void}
         */
        _setTable: function() {
            var oDialog = this.getView(),
                oTable = oDialog.getTable(),
                oModel = oDialog.getParent().getModel();

            oTable.bindRows("/ResDemandSet");

            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({ text: i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_COLUMN_DEMAND_ID") }),
                template: new sap.m.Text({ text: "{path:'DemandID', formatter:'sap.coe.planning.calendar.util.formatter.toInteger'}" })
            }));

            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({ text: i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_COLUMN_ITEM_NUMBER") }),
                template: new sap.m.Text({ text: "{path:'ItemNo', formatter:'sap.coe.planning.calendar.util.formatter.toInteger'}" })
            }));

            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({ text: i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_COLUMN_ITEM_DESCRIPTION") }),
                template: new sap.m.Text({ text: "{ItemDescription}" })
            }));

            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({ text: i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_COLUMN_CUSTOMER") }),
                template: new sap.m.Text({ text: "{Customer}" })
            }));

            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({ text: i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_COLUMN_FIRST_NAME") }),
                template: new sap.m.Text({ text: "{FirstName}" })
            }));

            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({ text: i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_COLUMN_LAST_NAME") }),
                template: new sap.m.Text({ text: "{LastName}" })
            }));

            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({ text: i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_COLUMN_START_DATE") }),
                template: new sap.m.Text({ text: "{path: 'StartDate', formatter:'sap.coe.planning.calendar.util.formatter.date'}" })
            }));

            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({ text: i18n.getText("FRAGMENT_ASSIGN_SERVICE_ORDER_COLUMN_END_DATE") }),
                template: new sap.m.Text({ text: "{path: 'EndDate', formatter:'sap.coe.planning.calendar.util.formatter.date'}" })
            }));

            oModel.attachRequestSent(function() {
                oTable.setBusy(true);
            });

            oModel.attachBatchRequestSent(function() {
                oTable.setBusy(true);
            });

            oModel.attachRequestCompleted(function() {
                oDialog.update();
                oTable.setBusy(false);
            });

            oModel.attachBatchRequestCompleted(function() {
                oDialog.update();
                oTable.setBusy(false);
            });

            oModel.attachRequestFailed(function(response) {
                oTable.setBusy(false);
            });

            oModel.attachBatchRequestFailed(function() {
                oTable.setBusy(false);
            });
        },
        /**
         * Called after this fragment is opened, will check if the masterlist model has already been initialized otherwise
         * it will intialize the model
         *
         * @public
         * @returns {void}
         */
        _initializeMasterListModel: function() {
            var oMasterListModel = this.getView().getModel("MasterListModel"),
                oObjectMasterList;

            if (oMasterListModel === undefined || oMasterListModel.getProperty("/ResDemandSet") === undefined) {
                oObjectMasterList = { "ResDemandSet": [] };
                oMasterListModel = new sap.ui.model.json.JSONModel(oObjectMasterList);
                this.getView().getParent().getController().getOwnerComponent().setModel(oMasterListModel, "MasterListModel");
            }
        },
        /**
         * Get all the items in the master list, loops through them and creates tokens for each and set them to the view
         * @public
         * @returns {void}
         */
        _setTokens: function() {
            var aItemsInMasterList = this._getMasterListItemsForTokens(),
                aTokens = [];

            //Look for a better way to clean the selected tokens
            this.getView()._oSelectedTokens.setTokens(aTokens);

            for (var iItemIndex in aItemsInMasterList) {
                aTokens.push(this._createToken(aItemsInMasterList[iItemIndex]));
            }

            this.getView().setTokens(aTokens);
            this.getView().update();
        },
        /**
         * Called when an item is selected in the table, gets the selected item and manipulates token which it adds to the
         * tokens aggregation. the changes to text text occur because it needs to be displayed in that format
         * @public
         * @param {object} oEvent - object which calls the function
         * @returns {void}
         */
        onSelectionChange: function(oEvent) {
            var bMultiSelection = oEvent.getParameter("selectAll"),
                aSelectedTokens = this.getView()._oSelectedTokens.getAggregation("tokens"),
                oModel = this.getView().getParent().getModel(),
                oItem,
                iLastIndex = aSelectedTokens.length - 1 ,
                iCount = (bMultiSelection === true) ? iLastIndex : 0;

                if(aSelectedTokens.length > 0){
                    for(var i = iLastIndex; i >= iLastIndex - iCount; i--){
                        oItem = oModel.getProperty("/" + aSelectedTokens[i].getProperty("key"));
                        aSelectedTokens[i].setProperty("text", "SO: " + formatter.toInteger(oItem.DemandID) + " , Item No: " + formatter.toInteger(oItem.ItemNo));
                    }
                }
        },
        /**
         * Creates a token using the parameter object and returns it
         * @public
         * @param {object} oItem - object which cis used to create a token
         * @returns {void}
         */
        _createToken: function(oItem) {
            var oCustomData = new sap.ui.core.CustomData(),
                oToken = new sap.m.Token({ key: oItem.sKey, text: "SO: " + formatter.toInteger(oItem.oData.DemandID) + ", Item No: " + formatter.toInteger(oItem.oData.ItemNo) });

            oCustomData.setKey(oItem.sKey);
            oCustomData.setValue(oItem.oData);
            oToken.addCustomData(oCustomData);

            return oToken;
        },
        /**
         * Gets all the items currently in the list and manipulates them into a structure to be used as tokens for the fragment
         * @public
         * @returns {array} - returns an array of items in the structure needed
         */
        _getMasterListItemsForTokens: function() {
            var oListItems = this.getView().getParent().byId("worklistTable").getItems(),
                oModel = this.getView().getParent().getModel("MasterListModel"),
                aListItems = [],
                sKey, sPath, sModelProperty;

            for (var iItemIndex in oListItems) {
                sPath = oListItems[iItemIndex].getBindingContextPath();
                sModelProperty = sPath.split("/")[1];

                //WARNING HACK: We have to build the sKey parameter exactly in the same way as the ValueHelpDialog does. Only then, the table will recognize the tokens.
                sKey = sModelProperty + "('" + oModel.getProperty(sPath).ItemGUID + "')";
                //sKey = sModelProperty + "(guid'" + oModel.getProperty(sPath).ItemGUID + "')";

                aListItems.push(this._buildMasterListItemObject(sKey, oModel.getProperty(sPath)));
            }

            return aListItems;
        },

        _buildMasterListItemObject: function(sKey, oObject) {
            return {
                sKey: sKey,
                oData: oObject
            };
        },
        /**
         * Gets all the token and iterates through each of them to create objects from them for the master list
         * @public
         * @param {array} aTokens - array containing all the tokens
         * @returns {void}
         */
        _addTokensToMasterList: function(aTokens) {
            var oModel = this.getView().getParent().getModel("MasterListModel"),
                oNewJSONDataModel = { "ResDemandSet": [] },
                oResourceData;

            for (var iTokenIndex in aTokens) {
                oResourceData = this._getResourceFromToken(aTokens[iTokenIndex]);
                oNewJSONDataModel.ResDemandSet.push(oResourceData);
            }

            oModel.setData(oNewJSONDataModel);
        },
        /**
         * Uses the token passed as a parameter to get the the corrosponding object from
         * the ResDemandSet
         * @public
         * @param {array} oToken - object representing token which will be used to create the resource
         * @returns {void}
         */
        _getResourceFromToken: function(oToken) {
            if (oToken.getCustomData().length) {
                return oToken.getCustomData()[0].getProperty("value");
            }

            var ItemGUID = oToken.getKey().split("'")[1],
                oModel = this.getView().getParent().getModel("MasterListModel"),
                oResource;

            oResource = oModel.getProperty("/ResDemandSet").find(function(oItem) {
                return oItem.ItemGUID === ItemGUID;
            });

            return oResource;
        },

        _hideFilterBarSource: function() {
            var oFilterBar = this.getView().byId("ServiceDemandFilterBar").getFilterBar(),
                oFilterBarSource = $("[data-sap-ui=" + oFilterBar.getId() + "]")[1];

            if (oFilterBarSource && $(oFilterBarSource).is(":visible")) {
                $(oFilterBarSource).hide();
            }
        },

        /**
         *
         * We need to listen to the "onAfterRendering" event of the dialog.
         * These event is not provided with the standard -> Override the event function and call to the parent inside it.
         *
         * @private
         * @returns {void}
         */
        _attachAfterRenderingEvent: function() {
            var that = this,
                oDialog = this.getView();

            oDialog.onAfterRendering = function() {
                sap.ui.comp.valuehelpdialog.ValueHelpDialog.prototype.onAfterRendering.apply(this);
                that.onAfterRendering();
            };

        }
    });

});
