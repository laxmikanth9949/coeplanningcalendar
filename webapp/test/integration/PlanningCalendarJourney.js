sap.ui.define([
    "sap/ui/test/opaQunit"
], function(opaTest) {
    "use strict";

    QUnit.module("PlanningCalendar");

    opaTest("Should see the planning calendar page.", function(Given, When, Then) {
        Given.iStartTheApp("PlanningCalendar");

        When.onThePlanningCalendarPage.Init();

        Then.onThePlanningCalendarPage.iShouldSeeTheElementOnPlanningCalendar("page");
    });


    //2. I want to create a normal Time Allocation:
    opaTest("Open create time allocation dialog.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iWaitUntilPlanningCalendarRowsAreShown();
        When.onThePlanningCalendarPage.iPressButton("idCreateTimeAllocation",
            false,
            "Could click create time allocation button.",
            "Could not click create time allocation button.");

        Then.onThePlanningCalendarPage.iShouldSeeADialog();
    });

    opaTest("Create non rec. time allocation.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iSetValueOfDatePicker("idBegDate",
            "2016-06-14",
            "Could set start Date.",
            "Could not set start Date.");
        When.onThePlanningCalendarPage.iSetValueOfDatePicker("idEndDate",
            "2016-06-14",
            "Could set end Date.",
            "Could not set end Date.");
        When.onThePlanningCalendarPage.iPressButton("idForSaveButton",
            false,
            "Could save time allocation.",
            "Could not save time allocation.");

        Then.onThePlanningCalendarPage.iShouldSeeToastMessage();
    });


    //3. I want to create a recurrent Time Allocation:
    opaTest("Create time allocation dialog open.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iWaitUntilPlanningCalendarIsNotBusy();
        When.onThePlanningCalendarPage.iPressButton("idCreateTimeAllocation",
            false,
            "Could click create time allocation button.",
            "Could not click create time allocation button.");

        Then.onThePlanningCalendarPage.iShouldSeeADialog();
    });

    opaTest("Create recurrent time allocation.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iPressOnRecurrencePanel("idRecurrenceForm");

        When.onThePlanningCalendarPage.iSetValueOfDateRangeSelection("idRecurrenceDateRange",
            "Jul 26, 2016 - Jul 27, 2016",
            "Could set date range selection",
            "Could not set date range selection.");
        When.onThePlanningCalendarPage.iSetInputValue("idRecurrencyNumber",
            1,
            "Could set Recurrency Number",
            "Could not set Recurrency Number.");
        When.onThePlanningCalendarPage.iSetTextAreaValue("idDescription",
            "I want to create a rec. TA",
            "Could set Recurrency Number",
            "Could not set Recurrency Number.");
        When.onThePlanningCalendarPage.iSetComboBoxValue("idRecurrencyType",
            1,
            "Could set Recurrency Type.",
            "Could not set Recurrency Type.");
        When.onThePlanningCalendarPage.iPressButton("idForSaveButton",
            true,
            "Could close create time allocation dialog.",
            "Could not close create time allocation dialog.");

        Then.onThePlanningCalendarPage.iShouldSeeToastMessage();
    });


    // 4. I want to edit a Time Allocation:
    opaTest("Open edit time allocation dialog.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iWaitUntilPlanningCalendarIsNotBusy();
        When.onThePlanningCalendarPage.iPressOnCalendarAppointment("Type02",
            "Could open detail appointment popover.",
            "Could not open detail appointment popover.");
        When.onThePlanningCalendarPage.iPressButton("idEditAllocation",
            true,
            "Could click edit time allocation button.",
            "Could not click edit time allocation button.");

        Then.onThePlanningCalendarPage.iShouldSeeADialog();
    });

    opaTest("Change time allocation.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iWaitUntilDialogIsPrefilled("idBegTimeRecurrence");
        When.onThePlanningCalendarPage.iSetValueOfTimePicker("idBegTimeRecurrence",
            "9:10",
            "Could close create time allocation dialog.",
            "Could not close create time allocation dialog.");
        When.onThePlanningCalendarPage.iPressButton("idForSaveButton",
            true,
            "Could close create time allocation dialog.",
            "Could not close create time allocation dialog.");

        Then.onThePlanningCalendarPage.iShouldSeeToastMessage();
    });


    // 5. I want to delete a Time Allocation:
    opaTest("Delete time allocation.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iWaitUntilPlanningCalendarIsNotBusy();
        When.onThePlanningCalendarPage.iPressOnCalendarAppointment("Type02",
            "Could open detail appointment popover.",
            "Could not open detail appointment popover.");
        When.onThePlanningCalendarPage.iPressButton("idDeleteAllocation",
            true,
            "Could click delete time allocation button.",
            "Could not click delete time allocation button.");

        When.onThePlanningCalendarPage.iPressAcceptButton();

        Then.onThePlanningCalendarPage.iShouldSeeToastMessage();
    });


    // 6. I want to edit a Service Order:
    //Edit service order is commented because is not supposed to be available for RPA. It is pending to implement the approach to distinguish between the two applications
    /*opaTest("Open edit Service Order dialog.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iWaitUntilPlanningCalendarIsNotBusy();
        When.onThePlanningCalendarPage.iPressOnCalendarAppointment("Type06",
            "Could open detail appointment popover.",
            "Could not open detail appointment popover.");
        When.onThePlanningCalendarPage.iPressButton("idEditAllocation",
            true,
            "Could click edit time allocation button.",
            "Could not click edit time allocation button.");

        When.onThePlanningCalendarPage.iSetValueOfDatePicker("BegDate",
            "2016-06-14",
            "Could set start Date.",
            "Could not set start Date.");

        When.onThePlanningCalendarPage.iPressButton("idForSaveAllButton",
            true,
            "Could click edit time allocation button.",
            "Could not click edit time allocation button.");

        Then.onThePlanningCalendarPage.iShouldSeeToastMessage();
    });
*/

    // 7. I want to open a Soft Booking:
    opaTest("Open a Soft Booking.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iWaitUntilPlanningCalendarIsNotBusy();
        When.onThePlanningCalendarPage.iPressOnCalendarAppointment("Type01",
            "Could open detail Soft Booking popover.",
            "Could not open detail Soft Booking popover.");

        Then.onThePlanningCalendarPage.iShouldSeeAPopover();
    });

    opaTest("Hover over calendar item.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iWaitUntilPlanningCalendarIsNotBusy();
        When.onThePlanningCalendarPage.iHoverOnCalendarAppointment("Type01");

        Then.onThePlanningCalendarPage.iShouldSeeAPopover();
        Then.onThePlanningCalendarPage.iShouldSeeAPopoverWithText("Task 2");
    });

    opaTest("Tear down and clean context", function(Given, When, Then) {
        Given.iTeardownMyAppFrame();
        Then.onThePlanningCalendarPage.okAssert("Planning Calendar context cleaned");
    });
});
