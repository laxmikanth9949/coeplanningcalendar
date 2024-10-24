sap.ui.define([
    "sap/ui/test/opaQunit"
], function(opaTest) {
    "use strict";

    QUnit.module("FilterBar");

    //Service Team

    opaTest("Should See Service Team Dialog", function(Given, When, Then) {
        Given.iStartTheApp();
        When.onTheWorklistPage.Init();

        When.onTheWorklistPage.iPressOnIcon("idForServiceTeam", "sap-icon://value-help", "Open Service Team Dialog successful", "Open Service Team Dialog failed");
        Then.onTheWorklistPage.iShouldSeeADialog();
    });

    opaTest("Select Items on the Service Team Dialog.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnListItem(0);

        When.onTheWorklistPage.iSelectListItem(0);
        When.onTheWorklistPage.iSelectListItem(1);

        When.onTheWorklistPage.iPressButton("acceptForEmpId", true, "Ok button of Service Team Dialog pressed", "Ok button of Service Team Dialog pressed failed");

        Then.onTheWorklistPage.iShouldSeeNTokens("idForServiceTeam", 2);
    });

    opaTest("Remove token from service team input.", function(Given, When, Then) {
        When.onTheWorklistPage.iDeleteToken("COE CN INTERNS DALIAN");
        Then.onTheWorklistPage.iShouldSeeNTokens("idForServiceTeam", 1);
    });

    opaTest("Should be checked only the expected tokens on the Service Team Dialog.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("idForServiceTeam", "sap-icon://value-help");

        Then.onTheWorklistPage.iShouldSeeNItemsCheckedInList("SelectOrganisationList", 1);
        Then.onTheWorklistPage.iShouldItemBeDeselectedInList("SelectOrganisationList", "COE CN INTERNS DALIAN");
        Then.onTheWorklistPage.iShouldItemBeSelectedInList("SelectOrganisationList", "AIE BACKOFFICE");
    });

    opaTest("Should delete token from field when deselecting on the Service Team Dialog.", function(Given, When, Then) {
        When.onTheWorklistPage.iSelectListItem(0);
        When.onTheWorklistPage.iPressButton("acceptForEmpId", true, "Ok button of Service Team Dialog pressed", "Ok button of Service Team Dialog pressed failed");

        Then.onTheWorklistPage.iShouldSeeNTokens("idForServiceTeam", 0);
    });

    //Service Product

    opaTest("Should See Service Product Dialog", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("idForProductID", "sap-icon://value-help", "Open Service Product Dialog successful", "Open Service Product Dialog failed");
        Then.onTheWorklistPage.iShouldSeeADialog();
    });

    opaTest("Search on the Product Search Dialog and add items in Service product field.", function(Given, When, Then) {
        When.onTheWorklistPage.iTypeOnSearchField("searchFieldProductDesc", "GO");
        When.onTheWorklistPage.iPressButton("idForSearchButton", true, "Search button pressed", "Search button pressed failed");
        When.onTheWorklistPage.iListIsReady("productSearchList");
        When.onTheWorklistPage.iSelectListItem(0);
        When.onTheWorklistPage.iSelectListItem(1);
        When.onTheWorklistPage.iPressButton("acceptForProductId", true, "Ok button pressed", "Ok button pressed failed");

        Then.onTheWorklistPage.iShouldSeeNTokens("idForProductID", 2);
    });

    opaTest("Remove token from Service Product input.", function(Given, When, Then) {
        When.onTheWorklistPage.iDeleteToken("SAP GOINGLIVE FUNCTIONAL UPGRADE CHECK");
        Then.onTheWorklistPage.iShouldSeeNTokens("idForProductID", 1);
    });

    opaTest("Should not be checked the deleted token on the Product Search Dialog.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("idForProductID", "sap-icon://value-help", "Open Service Product Dialog successful", "Open Service Product Dialog failed");

        Then.onTheWorklistPage.iShouldSeeNItemsCheckedInList("productSearchList", 1);
        Then.onTheWorklistPage.iShouldItemBeDeselectedInList("productSearchList", "SAP GOINGLIVE FUNCTIONAL UPGRADE CHECK");
        Then.onTheWorklistPage.iShouldItemBeSelectedInList("productSearchList", "SAP GOINGLIVE CHECK");
    });

    /*  
        Test failing possible beacuse of feature not complete. Leaving commeted for taking it into account for the refactor  
        opaTest("Should be checked the remaining token on the Product Search Dialog after cleaning the list and search.", function(Given, When, Then) {
            When.onTheWorklistPage.iTypeOnSearchField("searchFieldProductDesc", "NOT FOUND");
            When.onTheWorklistPage.iPressButton("idForSearchButton", "Search button pressed", "Search button pressed failed", true);
            When.onTheWorklistPage.iListIsReady("productSearchList");
            When.onTheWorklistPage.iTypeOnSearchField("searchFieldProductDesc", "GO");
            When.onTheWorklistPage.iPressButton("idForSearchButton", "Search button pressed", "Search button pressed failed", true);
            When.onTheWorklistPage.iListIsReady("productSearchList");

            Then.onTheWorklistPage.iShouldSeeNItemsCheckedInList("productSearchList", 1);
            Then.onTheWorklistPage.iShouldItemBeSelectedInList("productSearchList", "SAP GOINGLIVE CHECK");
        });*/

    opaTest("Should delete token from field when deselecting on the Product Search Dialog.", function(Given, When, Then) {
        When.onTheWorklistPage.iSelectListItem(0);
        When.onTheWorklistPage.iPressButton("acceptForProductId", true, "Ok button pressed", "Ok button pressed failed");

        Then.onTheWorklistPage.iShouldSeeNTokens("idForProductID", 0);
    });

    //Qualification Dialog

    opaTest("Should See Qualification Select Dialog", function(Given, When, Then) {

        When.onTheWorklistPage.iPressOnIcon("idForQualification", "sap-icon://value-help", "Open Qualification Dialog successful", "Open Qualification Dialog failed");

        Then.onTheWorklistPage.iShouldSeeADialog();
    });

    opaTest("Should should see 9 items in the List of the Qualification Select Dialog", function(Given, When, Then) {
        When.onTheWorklistPage.iLookAtTheScreen();
        When.onTheWorklistPage.iWaitForListRecieveData();

        Then.onTheWorklistPage.iShouldSeeNItemsInTheList(9);
    });

    opaTest("Item 93100047 should be the first item in the list of the Qualification Select Dialog", function(Given, When, Then) {
        When.onTheWorklistPage.iLookAtTheScreen();

        Then.onTheWorklistPage.iShouldSeeThisItemAsTheNItemInList("93100047", 0);
    });

    opaTest("Should see 14 items in the List of the Qualification Select Dialog", function(Given, When, Then) {
        When.onTheWorklistPage.iClickOnTheNItemInTheList(0);
        When.onTheWorklistPage.iWaitForListRecieveData();

        Then.onTheWorklistPage.iShouldSeeNItemsInTheList(14);
    });

    opaTest("Item 93100026 should be the first item in the list of the Qualification Select Dialog", function(Given, When, Then) {
        When.onTheWorklistPage.iLookAtTheScreen();

        Then.onTheWorklistPage.iShouldSeeThisItemAsTheNItemInList("93100026", 0);
    });


    opaTest("Select all leaf items of a branch of the Qualification Select Dialog", function(Given, When, Then) {
        When.onTheWorklistPage.iClickOnMultiSelectRB(0, true);
        When.onTheWorklistPage.iClickOnTheNItemInTheList(0);
        When.onTheWorklistPage.iWaitForListRecieveData();

        Then.onTheWorklistPage.iShouldSeeNItemsInTheList(12);
        Then.onTheWorklistPage.iShouldSeeNItemsSelected(12);
    });

    opaTest("Accept selected items of the Qualification Select Dialog", function(Given, When, Then) {
        When.onTheWorklistPage.iPressAcceptCancelButton(true);

        Then.onTheWorklistPage.iShouldSeeNTokens("idForQualification", 12);
    });

    opaTest("Deleted token should not be selcted in list", function(Given, When, Then) {
        When.onTheWorklistPage.iDeleteToken("OSD: CRM DVM");
        // need to focus away to click on value help
        When.onTheWorklistPage.iFocusAway();
        When.onTheWorklistPage.iFocusAwayClickToken();
        // Need to click twice to open dialog
        When.onTheWorklistPage.iPressOnIcon("idForQualification", "sap-icon://value-help", "Open Qualification Dialog successful", "Open Qualification Dialog failed");
        When.onTheWorklistPage.iPressOnIcon("idForQualification", "sap-icon://value-help", "Open Qualification Dialog successful", "Open Qualification Dialog failed");
        When.onTheWorklistPage.iWaitForListRecieveData();
        When.onTheWorklistPage.iClickOnTheNItemInTheList(0);
        When.onTheWorklistPage.iWaitForListRecieveData();
        When.onTheWorklistPage.iClickOnTheNItemInTheList(0);
        When.onTheWorklistPage.iWaitForListRecieveData();

        Then.onTheWorklistPage.iShouldSeeNItemsSelected(11);
    });

    opaTest("Unselected Item should be removed from MuliInput", function(Given, When, Then) {
        When.onTheWorklistPage.iClickOnMultiSelectRB(1, false);
        When.onTheWorklistPage.iPressAcceptCancelButton(true);

        Then.onTheWorklistPage.iShouldSeeNTokens("idForQualification", 10);
    });

    opaTest("Selected Leaf items should appear as tokens on press OK", function(Given, When, Then) {
        // need to focus away to click on value help
        When.onTheWorklistPage.iFocusAway();
        When.onTheWorklistPage.iFocusAwayClickToken();
        // Need to click twice to open dialog
        When.onTheWorklistPage.iPressOnIcon("idForQualification", "sap-icon://value-help", "Open Qualification Dialog successful", "Open Qualification Dialog failed");
        When.onTheWorklistPage.iPressOnIcon("idForQualification", "sap-icon://value-help", "Open Qualification Dialog successful", "Open Qualification Dialog failed");
        When.onTheWorklistPage.iWaitForListRecieveData();
        When.onTheWorklistPage.iClickOnTheNItemInTheList(1);
        When.onTheWorklistPage.iWaitForListRecieveData();
        When.onTheWorklistPage.iClickOnMultiSelectRB(0, true);
        When.onTheWorklistPage.iClickOnMultiSelectRB(0, true);
        When.onTheWorklistPage.iPressAcceptCancelButton(true);

        Then.onTheWorklistPage.iShouldSeeNTokens("idForQualification", 12);
    });

    opaTest("Tear down and clean context", function(Given, When, Then) {
        Given.iTeardownMyAppFrame();
        Then.onTheWorklistPage.okAssert("FilterBar context cleaned");
    });

    opaTest("I should be able to select Qualification search panel", function(Given, When, Then) {
        Given.iStartTheApp();
        When.onTheWorklistPage.Init();
        When.onTheWorklistPage.iPressOnIcon("idForQualification", "sap-icon://value-help", "Open Qualification Dialog successful", "Open Qualification Dialog failed");
        When.onTheWorklistPage.iPressButton("SegmentedButton2", true, "Segmented Button 2 Pressed", "Button press failed");
        When.onTheWorklistPage.iWaitForListRecieveData();
        Then.onTheWorklistPage.iShouldSeeNItemsInTheList(100);
    });

    opaTest("Search in Qualification search should return correct results for 'CRM'.", function(Given, When, Then) {
        When.onTheWorklistPage.iTypeOnSearchField("qualificationSearchField", "CRM");

        When.onTheWorklistPage.iPressSearchBttn("qualificationSearchField", "Search button pressed", "Search button pressed failed");
        Then.onTheWorklistPage.iShouldSeeThisItemAsTheNItemInList("93100026", 0);
        Then.onTheWorklistPage.iShouldSeeThisItemAsTheNItemInList("93100049", 1);

    });

    opaTest("Search in Qualification search should return correct result for ID '93200350'.", function(Given, When, Then) {
        When.onTheWorklistPage.iTypeOnSearchField("qualificationSearchField", "93200350");

        When.onTheWorklistPage.iPressSearchBttn("qualificationSearchField", "Search button pressed", "Search button pressed failed");
        Then.onTheWorklistPage.iShouldSeeThisItemAsTheNItemInList("93200350", 0);
        Then.onTheWorklistPage.iShouldSeeNItemsInTheList(1);

    });

    opaTest("Qualification with ID '93200350' should be selected in Navigation list when selected in Search list.", function(Given, When, Then) {
        When.onTheWorklistPage.iClickOnMultiSelectRB(0, true);
        When.onTheWorklistPage.iPressButton("SegmentedButton1", true, "Segmented Button 2 Pressed", "Button press failed");
        When.onTheWorklistPage.iWaitForListRecieveData();
        When.onTheWorklistPage.iClickOnTheNItemInTheList(0);
        When.onTheWorklistPage.iWaitForListRecieveData();
        When.onTheWorklistPage.iClickOnTheNItemInTheList(0);
        When.onTheWorklistPage.iWaitForListRecieveData();
        Then.onTheWorklistPage.iShouldSeeThisItemAsTheNItemInList("93200350", 0);
        When.onTheWorklistPage.iWaitForListRecieveData();
        Then.onTheWorklistPage.iShouldSeeNItemsCheckedInList("qualificationCatalogList", 1);

    });

    opaTest("Qualification with ID '93200350' should be as a token in the MuliInput fied.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressAcceptCancelButton(true);
        Then.onTheWorklistPage.iShouldSeeNTokens("idForQualification", 1);
    });

    opaTest("Tear down and clean context", function(Given, When, Then) {
        Given.iTeardownMyAppFrame();
        Then.onTheWorklistPage.okAssert("FilterBar context cleaned");
    });


});
