sap.ui.define([
    "sap/ui/test/opaQunit"
], function(opaTest) {
    "use strict";

    QUnit.module("Duration Warning");

    // 1: Start The Application
    opaTest("Should see the worklist table", function(Given, When, Then) {
        Given.iStartTheApp();
        When.onTheWorklistPage.Init();
        Then.onTheWorklistPage.iShouldSeeTheTable("worklistTable");
    });

    opaTest("Should select 3 items and navigate to the Planning Calendar", function(Given, When, Then) {
        When.onTheWorklistPage.iSelectItemsFromTable("73317972",
            "Could click on Service Demand 73317972",
            "Could not click on Service Demand 73317972");
        When.onTheWorklistPage.iSelectItemsFromTable("73346286",
            "Could click on Service Demand 73346286",
            "Could not click on Service Demand 73346286");
        When.onTheWorklistPage.iSelectItemsFromTable("73346283",
            "Could click on Service Demand 73346283",
            "Could not click on Service Demand 73346283");

        When.onTheWorklistPage.iPressLinkWithText("Assign Resources",
            "Could click on link to Planning Calendar",
            "Could not click on link to Planning Calendar");

        Then.onThePlanningCalendarPage.iShouldSeeTheElementOnPlanningCalendar("page");
        Then.onTheWorklistPage.iShouldSeeLableWithValue("Default");
    });

    opaTest("Warning not shown because the dates difference is less than the service duration", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iSelectListItem("list", 0);
        When.onThePlanningCalendarPage.iWaitUntilPlanningCalendarRowsAreShown();
        When.onThePlanningCalendarPage.iPressButtonOnDetailPage("assignSelectedItemsButton");
        When.onThePlanningCalendarPage.iPressButton("idForSaveButton", true);

        Then.onThePlanningCalendarPage.iShouldSeeWarningMessage(false);
        Then.onThePlanningCalendarPage.iShouldSeeABusyDialog("idForAssignServiceOrderDialog");
        Then.onThePlanningCalendarPage.iShouldSeeToastMessage();
        Then.onThePlanningCalendarPage.iShouldSeeServiceDeleted("73317972");
    });

    opaTest("Warning is shown after changing the dates because the dates difference is more than the service duration", function(Given, When,
        Then) {
        When.onThePlanningCalendarPage.iSelectListItem("list", 0);
        When.onThePlanningCalendarPage.iWaitUntilPlanningCalendarRowsAreShown();
        When.onThePlanningCalendarPage.iPressButtonOnDetailPage("assignSelectedItemsButton");

        When.onThePlanningCalendarPage.iSetValueOfDatePicker("begDate",
            "2016-06-14",
            "Could set start Date.",
            "Could not set start Date.");

        When.onThePlanningCalendarPage.iPressButton("idForSaveButton", true);

        Then.onThePlanningCalendarPage.iShouldSeeWarningMessage(true);
    });

    opaTest("Warning is not shown after changing the dates because the dates difference is less than the service duration", function(Given,
        When, Then) {
        When.onThePlanningCalendarPage.iPressButtonByText("OK", true);

        When.onThePlanningCalendarPage.iSetValueOfDatePicker("begDate",
            "2016-07-25",
            "Could set start Date.",
            "Could not set start Date.");

        When.onThePlanningCalendarPage.iPressButton("idForSaveButton", true);

        Then.onThePlanningCalendarPage.iShouldSeeWarningMessage(false);
    });

    opaTest("Warning is shown because the dates difference is more than the service duration", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iSelectListItem("list", 0);
        When.onThePlanningCalendarPage.iWaitUntilPlanningCalendarRowsAreShown();
        When.onThePlanningCalendarPage.iPressButtonOnDetailPage("assignSelectedItemsButton");
        When.onThePlanningCalendarPage.iPressButton("idForSaveButton", true);

        Then.onThePlanningCalendarPage.iShouldSeeWarningMessage(true);

        // Accept the warning and save the assignment
        When.onThePlanningCalendarPage.iPressButtonByText("OK", true);
        When.onThePlanningCalendarPage.iPressButton("idForSaveButton", true);

        Then.onThePlanningCalendarPage.iShouldSeeWarningMessage(false);
    });

    opaTest("Tear down and clean context", function(Given, When, Then) {
        Given.iTeardownMyAppFrame();

        Then.onTheWorklistPage.okAssert("Worklist context cleaned");
    });
});