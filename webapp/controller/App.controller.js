sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/coe/capacity/reuselib/controls/TimeZoneSelect/TimeZoneSettings",
	"sap/coe/capacity/reuselib/controls/ResourcePlanningCalendar/ResourcePlanningCalendarComponent",
], function(Controller, TimeZoneSettings, ResourcePlanningCalendarComponent) {
    "use strict";

    return Controller.extend("sap.coe.planning.calendar.controller.App", {
        aSplitRoutes: ["planningCalendar"],

        onInit: function(oEvent) {
            var oSource = oEvent.getSource(),
                oAppView = oSource.byId("idAppControl"),
                oSplitView = oSource.byId("idSplitAppControl"),
                oRouter = this.getOwnerComponent().getRouter();

            oRouter.attachRouteMatched(function(oRouterEvent) {
                if (this.aSplitRoutes.indexOf(oRouterEvent.getParameter("name")) !== -1) {
                    oAppView.setVisible(false);
                    oSplitView.setVisible(true);
                    oSplitView.removeStyleClass("sapUiHidden");
                } else {
                    oSplitView.addStyleClass("sapUiHidden");
                    oAppView.setVisible(true);
                }
            }, this);

        //  TimeZoneSettings._setTimeZoneModelToView(this, "sap.coe.capacity.reuselib");
            ResourcePlanningCalendarComponent.prototype._setTimeZoneModelToView(this, "sap.coe.capacity.reuselib");
            sap.ui.getCore().getConfiguration().getFormatSettings().setFirstDayOfWeek(1);
        },

        onBeforeRendering: function() {
        // Shell not loading in cFLP due to the tomezone button added into Resource planning calender component fragment and implemented further
		// commented Timezone navigation code here and navigated to Resource Planning Calendar component
        // TimeZoneSettings._setAppSettingButtons(this);
        // TimeZoneSettings._getUserTimeZone(this);
            ResourcePlanningCalendarComponent.prototype._getUserTimeZone(this);
		    ResourcePlanningCalendarComponent.prototype._TimezoneSettingsDialog(this);
		    ResourcePlanningCalendarComponent.prototype._getUserTimeZone(this);
        }

    });
});
