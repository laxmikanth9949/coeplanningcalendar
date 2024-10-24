sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/coe/planning/calendar/util/formatter",
    "sap/coe/capacity/reuselib/utils/P13nHelper"
], function(Controller, Formatter, P13nHelper) {
    "use strict";

    return Controller.extend("sap.coe.planning.calendar.fragment.TableP13nDialog.fragment", {
        formatter: Formatter,

        /**
         * Called by beforeOpen event of dialog. Caches table pers settings before changes are made.
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        onBeforeOpen: function(oEvent) {
            var oFragment = oEvent.getSource();
            this.oParentController = oFragment.getParent().getController();
            // Store current table settings to global object before changes are made
            var oModelData = {};
            $.extend(true, oModelData, oEvent.getSource().getModel().oData);
            this._aCachedData = oModelData.Columns;
            // Sets first column in list as selected
            var oFirstItem = this.byId("columnList").getItems()[0];
            if (oFirstItem && oFirstItem.setSelected) {
                oFirstItem.setSelected(true);
            }
        },

        /**
         * Cancels changes in progress and closes dialog
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        onCancelChanges: function(oEvent) {
            var oSrc = oEvent.getSource(),
                oModel = oSrc.getModel();
            // Restored table settings from global object
            oModel.setProperty("/Columns", this._aCachedData);
            oModel.updateBindings();
            oSrc.getParent().close();
        },

        /**
         * Handles selection of All checkbox. Toggles visibility of columns.
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        onSelectAll: function(oEvent) {
            var bSelected = oEvent.getParameter("selected"),
                oModel = oEvent.getSource().getModel(),
                oData = oModel.getProperty("/Columns");
            // Loop through columns and toggle visibility based on if all checkbox is selected or not selected
            oData.forEach(function(oColumn) {
                oColumn.visible = bSelected;
            });
            oModel.setProperty("/Columns", oData);
        },

        /**
         * Handles selection of column checkbox. Toggles visibility of selected column.
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        setColumnVisibilty: function(oEvent) {
            var bSelected = oEvent.getParameter("selected"),
                sId = oEvent.getSource().data("colId"), // TODO maybe just retrieve from binding
                oModel = oEvent.getSource().getModel(),
                oData = oModel.getProperty("/Columns");
            // Find relevant column and update visibility based on checkbox selection
            oData.forEach(function(oColumn) {
                if (oColumn.id === sId) {
                    oColumn.visible = bSelected;
                }
            });
            oModel.setProperty("/Columns", oData);
        },

        /**
         * Handles press of up/down move item buttons. Updates index property of affected columns in model.
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        moveItem: function(oEvent) {
            var iDirection = oEvent.getParameter("id").indexOf("upButton") > -1 ? -1 : 1,
                oList = this.byId("columnList"),
                oSelectedItem = oList.getSelectedItem();
            // Abort if nothing selected
            if (!oSelectedItem) {
                return;
            }
            // The items themselves
            var oModel = oEvent.getSource().getModel(),
            oData = oModel.getProperty("/Columns");
            // Get array index of selected item
            var nItem = oSelectedItem.getBindingContext().getPath().split("/").pop() * 1;
            // Get array index of item to swap with
            var nSwap = nItem + iDirection;
            // Abort if out of bounds
            if (nSwap < 0 || nSwap >= oData.length) {
                return;
            }
            // Do the swap
            var oTemp = oData[nSwap];
            oData[nSwap] = oData[nItem];
            // Make sure the order member is adapted as well!
            oData[nSwap].index = nSwap;
            oData[nItem] = oTemp;
            // Make sure the order member is adapted as well!
            oData[nItem].index = nItem;
            // Remove selection before binding
            oList.removeSelections(true);
            oModel.updateBindings();
            // Switch the selected item
            var oSwapItem = oList.getItems()[nSwap];
            oList.setSelectedItem(oSwapItem, true);

        },

        /**
         * Handles press of dialog OK button. Applies personalisations to table and saves to P13n service.
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        onConfirmColumns: function(oEvent) {
            var oParentView = this.getView().getParent(),
                oData = this.byId("columnList").getModel().getProperty("/Columns"),
                oPersData = {};

            for (var i = 0; i < oData.length; i++) {
                oPersData[oData[i].id] = {visible: oData[i].visible, index: oData[i].index};
            }

            // Call function to trigger table columsn update
            P13nHelper.updateColumns(oParentView, oData);
            this.oParentController._setColumnSettingsPers(oData);
            // Save table settings to p13n service
            P13nHelper.saveData(oParentView.getController()._oOwnerComponent._tableP13n, oPersData);
            sap.git.usage.MobileUsageReporting.postEvent("RSD Calendar - Table Column p13n settings saved", oParentView.getController().getOwnerComponent());
            oEvent.getSource().getParent().close();
        },

        /**
         * Handles reset button press. Updates dialog list with default column settings.
         * @param {Object} oEvent - object which calls the function
         * @public
         * @returns {void}
         */
        resetTableToDefault: function(oEvent) {
            // Retrive default table settings from P13nHelper and update to model
            oEvent.getSource().getModel().setProperty("/Columns", P13nHelper.getDefaultColumnLayout());
        }
    });
});