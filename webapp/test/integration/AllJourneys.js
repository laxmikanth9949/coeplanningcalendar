jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;


sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/coe/planning/calendar/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"sap/coe/planning/calendar/test/integration/pages/Worklist",
	"sap/coe/planning/calendar/test/integration/pages/PlanningCalendar"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.coe.planning.calendar.view."
	});


	sap.ui.require([
		"sap/coe/planning/calendar/test/integration/WorklistJourney",
		"sap/coe/planning/calendar/test/integration/PlanningCalendarJourney",
		"sap/coe/planning/calendar/test/integration/FilterBarJourney",
		"sap/coe/planning/calendar/test/integration/VariantManagerJourney",
		"sap/coe/planning/calendar/test/integration/DurationWarningJourney"
	], function () {
		QUnit.start();
	});
	
});
