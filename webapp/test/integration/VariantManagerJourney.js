sap.ui.define([
    "sap/ui/test/opaQunit"
], function(opaTest) {
    "use strict";

    QUnit.module("Variant Manager");

    var sVariantName = "NewVariant";
    var sRenamedVariant = "Renamed Variant";

    //Variant load: name and fields
    opaTest("Should load the default variant from the server", function(Given, When, Then) {
        Given.iStartTheApp();
        When.onTheWorklistPage.Init();

        Then.onTheWorklistPage.iShouldSeeLableWithValue("Default2");
        Then.onTheWorklistPage.iShouldSeeNTokens("idForStaffingLevel", 1);
        Then.onTheWorklistPage.iShouldSeeValueInMultiComboBox("idForStaffingLevel", "Not Staffed");
    });

    // edit variant:
    opaTest("Should be able to add a new token to Service Team", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("idForServiceTeam", "sap-icon://value-help");
        When.onTheWorklistPage.iSelectListItem(0);
        When.onTheWorklistPage.iPressButton("acceptForEmpId", true);

        Then.onTheWorklistPage.iShouldSeeNTokens("idForServiceTeam", 1);
    });

    opaTest("Should be able to save the variant.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("", "sap-icon://arrow-down");
        When.onTheWorklistPage.iPressButton("mainsave", true);

        Then.onTheWorklistPage.okAssert();
    });

    // create new variant:
    opaTest("Should be able to add a new token to Service Team", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("idForServiceTeam", "sap-icon://value-help");
        When.onTheWorklistPage.iSelectListItem(2);
        When.onTheWorklistPage.iPressButton("acceptForEmpId", true);

        Then.onTheWorklistPage.iShouldSeeNTokens("idForServiceTeam", 2);
    });

    opaTest("Should be able to open the save variant dialog.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("", "sap-icon://arrow-down");
        When.onTheWorklistPage.iPressButton("saveas", true);

        Then.onTheWorklistPage.iShouldSeeADialog();
    });

    opaTest("Should be able to save as a new variant.", function(Given, When, Then) {
        When.onTheWorklistPage.iChangeInputValue("name", sVariantName);
        When.onTheWorklistPage.iPressButton("variantsave", true);

        Then.onTheWorklistPage.iShouldSeeLableWithValue("NewVariant");
    });

    //rename variant
    opaTest("Should be able to rename the variant.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("", "sap-icon://arrow-down");
        When.onTheWorklistPage.iPressButton("manage", true);
        When.onTheWorklistPage.iChangeInputValue("manage-input", sRenamedVariant);
        When.onTheWorklistPage.iPressButton("managementsave", true);

        Then.onTheWorklistPage.iShouldSeeLableWithValue(sRenamedVariant);
    });

    // switch variants:
    opaTest("Should see a different selection of tokens after switching to the default variant.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("", "sap-icon://arrow-down");
        When.onTheWorklistPage.iPressListItem(1);
        When.onTheWorklistPage.iSeeAmountOfTokensUpdated("idForServiceTeam");
        //For some strange reason, the amount of tokens is not correctly updated after switching the variant.
        //It is needed to do it manually in the test (switch between the two variants) and then the test will pass
        When.onTheWorklistPage.iSeeLableInVariant("Default2");
        Then.onTheWorklistPage.iShouldSeeNTokens("idForServiceTeam", 1);
    });

    opaTest("Should see a different selection of tokens after switching to the newly created variant.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("", "sap-icon://arrow-down");
        When.onTheWorklistPage.iPressListItem(0);
        When.onTheWorklistPage.iSeeLableInVariant(sRenamedVariant);
        Then.onTheWorklistPage.iShouldSeeNTokens("idForServiceTeam", 2);
    });

    // delete variant again:
    opaTest("Should be able to open the manage variant dialog.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("", "sap-icon://arrow-down");
        When.onTheWorklistPage.iPressButton("manage", true);

        Then.onTheWorklistPage.iShouldSeeADialog();
    });

    opaTest("Should be able to delete the variant.", function(Given, When, Then) {
        When.onTheWorklistPage.iPressOnIcon("manage-del", "sap-icon://sys-cancel");
        When.onTheWorklistPage.iPressButton("managementsave", true);

        Then.onTheWorklistPage.iShouldSeeLableWithValue("Default2");
    });

    opaTest("Tear down and clean context", function(Given, When, Then) {
        Given.iTeardownMyAppFrame();

        Then.onTheWorklistPage.okAssert("FilterBar context cleaned");
    });
});
