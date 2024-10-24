sap.ui.define([
    "sap/ui/test/opaQunit"
], function(opaTest) {
    "use strict";

    QUnit.module("Worklist");

    // 1: Start Application
    opaTest("Should see the worklist table", function(Given, When, Then) {
        Given.iStartTheApp();
        When.onTheWorklistPage.Init();
        Then.onTheWorklistPage.iShouldSeeTheTable("worklistTable");
    });

    

    opaTest("Search with date range, no cancellation status or SO", function(Given, When, Then) {
        
        When.onTheWorklistPage.iPressButtonByText("Go");
        Then.onTheWorklistPage.iShouldSeeToastMessage();
    });

    opaTest("Search with SO and no cancellation status", function(Given, When, Then) {
        When.onTheWorklistPage.iSetInputValue("DemandID", "73339882", "Service order number entered successfully", "Service order number was not entered successfully");
        When.onTheWorklistPage.iPressButtonByText("Go");
        Then.onTheWorklistPage.iShouldSeeToastMessage();
        
    });

    opaTest("Search with cancellation status, no date range or SO", function(Given, When, Then) {
        When.onTheWorklistPage.iSetInputValue("DemandID", "", "Service order number removed successfully", "Service order was not removed");
        When.onTheWorklistPage.iSetDates("idForStartEndDate", "", "date range removed successfully", "date range was not removed");
        When.onTheWorklistPage.iSetComboBoxValue("idForCancellationStatus", 0, "Cancellation combo box successfully set to cancelled", "Failure to set cancellation combo box set to cancelled");
        When.onTheWorklistPage.iPressButtonByText("Go");

        Then.onTheWorklistPage.iShouldSeeToastMessage();
        
    });
    
    // 2: Display Service Order details
    opaTest("Should see the Service Order details popover", function(Given, When, Then) {
        When.onTheWorklistPage.iPressLinkWithText("73323298",
            "Could click on Service Order Detail link.",
            "Could not click on Service Order Detail link.");

        Then.onTheWorklistPage.iShouldSeeAPopover();
        Then.onTheWorklistPage.iCheckPopoverValues("OSDLinkID", "73323298 - 10");
    });

    // 3: Select items to assign
    opaTest("Check Assign Resources link disabled.", function(Given, When, Then) {
        Then.onTheWorklistPage.iShouldSeeLinkEnabled("manageLineItemsLink",
            false,
            "Could check if link is enabled",
            "Could not check if link is enabled");
    });

    opaTest("Check Assign Resources link enabled.", function(Given, When, Then) {
        When.onTheWorklistPage.iSelectItemsFromTable("73323298",
            "Could click on Service Demand 73323298",
            "Could not click on Service Demand 73323298");

        Then.onTheWorklistPage.iShouldSeeLinkEnabled("manageLineItemsLink",
            true,
            "Could check if link is enabled",
            "Could not check if link is enabled");
    });

    opaTest("Close warning message for backend error.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressButtonByText("OK", true);
        Then.onTheWorklistPage.iShouldSeeWarningMessage(false);
    });

    // 4: Navigation to Planning Calendar
    opaTest("Should select anouther 2 items and navigate to the Planning Calendar", function(Given, When, Then) {
        When.onTheWorklistPage.iSelectItemsFromTable("73339882",
            "Could click on Service Demand 73339882",
            "Could not click on Service Demand 73339882");
        When.onTheWorklistPage.iSelectItemsFromTable("73337411",
            "Could click on Service Demand 73337411",
            "Could not click on Service Demand 73337411");
        When.onTheWorklistPage.iPressLinkWithText("Assign Resources",
            "Could click on link to Planning Calendar",
            "Could not click on link to Planning Calendar");

        Then.onThePlanningCalendarPage.iShouldSeeTheElementOnPlanningCalendar("page");
        Then.onTheWorklistPage.iShouldSeeLableWithValue("Default"); //The variant is loaded and the search triggered
    });

    // 4.1: Select Service Order from Planning Calendar
    opaTest("Check Planning Calendar value help.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iPressOnIcon("idOpenSelectServiceOrder", "sap-icon://add");
        When.onThePlanningCalendarPage.iCheckTableBusy();

        Then.onThePlanningCalendarPage.iShouldSeeADialog();
        Then.onThePlanningCalendarPage.iSeeNElementsSelectedInValueHelpDialog("idForValueHelpDialog", 3);
    });

    // 4.2: Remove items of the master list from Select Demands popup
    opaTest("Deselect item in value help dialog.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iDeleteToken("ResDemandSet('001999D696B51ED5A2ABCB2A520F9C39')");
        When.onThePlanningCalendarPage.iPressButtonByText("OK", true);

        Then.onThePlanningCalendarPage.iSeeNElementsInList("list", 2);
    });

    // 4.3: Add items to the master list from Select Demands popup
    // This only somethimes works with the debug window opened or you have to open the valuehelp dialog one manually!
    opaTest("Reopen the valuehelp dialog.", function(Given, When, Then) {
        // This action is needed because else the second iPressOnIcon does not work
        When.onThePlanningCalendarPage.iPressOnIcon("idForShareMenuContent", "sap-icon://action");
        When.onThePlanningCalendarPage.iPressOnIcon("idOpenSelectServiceOrder", "sap-icon://add");

        Then.onThePlanningCalendarPage.iShouldSeeADialog();
        Then.onThePlanningCalendarPage.iSeeNElementsSelectedInValueHelpDialog("idForValueHelpDialog", 2);
    });

    opaTest("Add demand from valuehelp dialog.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iAddItemFromValueHelpDialog("idForAssignServiceOrderDialog",
            "ResDemandSet('C45444889FD81EE595ADBDDA95C2C4FD')");

        Then.onThePlanningCalendarPage.iSeeNElementsSelectedInValueHelpDialog("idForValueHelpDialog", 3);
    });

    opaTest("Check if new item is added to the masterlist.", function(Given, When, Then){
        When.onThePlanningCalendarPage.iPressButtonByText("OK", true);

        Then.onThePlanningCalendarPage.iSeeNElementsInList("list", 3);
    });

    // 4.1b: Master list interaction
    opaTest("Interaction with master list.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iSelectListItem("list", 0);

        Then.onThePlanningCalendarPage.iShouldSeeElementOnDetailPage("ObjectPageLayoutHeaderTitle", true);
        Then.onThePlanningCalendarPage.iShouldSeeHeaderText("idForHeaderTileOrganization", "50025384");
        Then.onThePlanningCalendarPage.iShouldSeeMainActionOnDetailPageEnabled("assignSelectedItemsButton");
    });

    // 4.1b.1: Binding of the header
    opaTest("Select different demand from master list.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iSelectListItem("list", 1);

        Then.onThePlanningCalendarPage.iShouldSeeElementOnDetailPage("ObjectPageLayoutHeaderTitle", true);
        Then.onThePlanningCalendarPage.iShouldSeeHeaderText("idForHeaderTileOrganization", "50008815");
        Then.onThePlanningCalendarPage.iShouldSeeMainActionOnDetailPageEnabled("assignSelectedItemsButton");
    });

    // 4.1b.2: Header behaviour on multiselect
    opaTest("Select another demand in multiselectmode.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iPressMultiSelectAction("idForMultiSelectAction");
        When.onThePlanningCalendarPage.iSelectListItemInMultiSelectMode("list", 0);

        Then.onThePlanningCalendarPage.iShouldSeeElementOnDetailPage("ObjectPageLayoutHeaderTitle", true);
        Then.onThePlanningCalendarPage.iShouldSeeHeaderText("idForHeaderTileOrganization", "50025384");
        Then.onThePlanningCalendarPage.iShouldSeeMainActionOnDetailPageEnabled("assignSelectedItemsButton");
    });

    // 4.1b.3: Header behaviour on deselect
    opaTest("Deselect demand in multiselectmode.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iSelectListItemInMultiSelectMode("list", 0);

        Then.onThePlanningCalendarPage.iShouldSeeElementOnDetailPage("ObjectPageLayoutHeaderTitle", true);
        Then.onThePlanningCalendarPage.iShouldSeeHeaderText("idForHeaderTileOrganization", "50025384");
        Then.onThePlanningCalendarPage.iShouldSeeMainActionOnDetailPageEnabled("assignSelectedItemsButton");
    });

    // 4.1b.4: Header behaviour on deselect all
    opaTest("Deselect all demands.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iSelectListItemInMultiSelectMode("list", 1);

        Then.onThePlanningCalendarPage.iShouldSeeElementOnDetailPage("ObjectPageLayoutHeaderTitle", false);
    });

    // 4.1c Assigning Item single
    opaTest("Should not display 'save all' button when assigning just one item.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iSelectListItemInMultiSelectMode("list", 0);
        When.onThePlanningCalendarPage.iWaitUntilPlanningCalendarRowsAreShown();
        When.onThePlanningCalendarPage.iPressButtonOnDetailPage("assignSelectedItemsButton");

        Then.onThePlanningCalendarPage.iShouldSeeButton("idForSaveAllButton", false);
    });

    opaTest("Assign single item.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iPressButton("idForSaveButton", true);

        Then.onThePlanningCalendarPage.iShouldSeeABusyDialog("idForAssignServiceOrderDialog");
        Then.onThePlanningCalendarPage.iShouldSeeToastMessage();
        Then.onThePlanningCalendarPage.iShouldSeeServiceDeleted("73323298"); 

    });

    // 4.1c.1 Assign multiple items
    opaTest("Should display 'save all' button when assigning multiple items.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iSelectListItemInMultiSelectMode("list", 0);
        When.onThePlanningCalendarPage.iSelectListItemInMultiSelectMode("list", 1);
        When.onThePlanningCalendarPage.iPressButtonOnDetailPage("assignSelectedItemsButton");

        Then.onThePlanningCalendarPage.iShouldSeeButton("idForSaveAllButton", true);
    }); 

    opaTest("Assign multiple items.", function(Given, When, Then) {
        When.onThePlanningCalendarPage.iPressButton("idForSaveAllButton", true);

        Then.onThePlanningCalendarPage.iShouldSeeABusyPlanningCalendar("resourcePlanningCalendarId");
        Then.onThePlanningCalendarPage.iShouldSeeToastMessage();
        Then.onThePlanningCalendarPage.iSeeNElementsInList("list", 0, "After successful multi-assignment, the assignments disappeared from the list");

    }); 


    opaTest("Tear down and clean context", function(Given, When, Then) {
        Given.iTeardownMyAppFrame();

        Then.onTheWorklistPage.okAssert("Worklist context cleaned");
    });
});
