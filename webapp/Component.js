sap.ui.getCore().loadLibrary("sapit", { url: sap.ui.require.toUrl("sap/coe/planning/calendar") + "/resources/sapit", async:
true });
//sap.ui.getCore().loadLibrary("reuelib", { url: sap.ui.require.toUrl("sap/coe/capacity/reuselib"), async:true });
//sap.ui.getCore().loadLibrary("sap.coe.capacity.reuselib", { url: sap.ui.require.toUrl("sap/coe/planning/calendar") + "/src/sap/coe/capacity/reuselib/",async:true});
//sap.ui.getCore().loadLibrary("sap.coe.capacity.reuselib", jQuery.sap.getModulePath("sap.coe.planning.calendar") + "/reuselib/src/sap/coe/capacity/reuselib/");


sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/coe/planning/calendar/model/models",
	"sap/coe/capacity/reuselib/utils/DataManager",
	"sap/coe/capacity/reuselib/utils/P13nHelper",
	"sap/coe/capacity/reuselib/fragment/NoAuthorizationDialog",
	"sap/coe/planning/calendar/util/helpers",
	"sapit/util/cFLPAdapter" 
], function(UIComponent, Device, models, oDataManager, P13nHelper, NoAuthDialog, Helpers, cFLPAdapter) {
	"use strict";

	return UIComponent.extend("sap.coe.planning.calendar.Component", {

		metadata: {
			manifest: "json",
			"config": {
				fullWidth: true,
				/* eslint-disable sap-no-hardcoded-url */
				"jamResource": "https://jam4.sapjam.com/groups/about_page/iDrRymI7rWhoNrog2NpHea",
				/* eslint-enable sap-no-hardcoded-url */
				"categoryResource": "IMFIT_DBS_CRM_TECH",
				"appName": "sap.coe.planning.calendar",
				//IT Launchpad Mobile reporting parameter
				reportingId: "Planning Calendar",
				reportingHosts: ["sapit-customersupport-prod-kestrel.launchpad.cfapps.eu10.hana.ondemand.com", "sapit-home-prod-004.launchpad.cfapps.eu10.hana.ondemand.com", "myapp.hana.ondemand.com", "fiorilaunchpad.sap.com"]
			}
		},
		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this method, the device models are set and the router is initialized.
		 * TESTING BRANCH
		 * @public
		 * @override
		 */
		init: function() {
			cFLPAdapter.init();
			this.setModel(models.createDeviceModel(), "device");

			var oWorklistSelectedItems = new sap.ui.model.json.JSONModel();

			this.setModel(oWorklistSelectedItems, "worklistSelectedItems");

			// call the base component's init function and create the App view
			UIComponent.prototype.init.apply(this, arguments);
			

			// instantiate client model and populate with personalization data
			this._initP13n();

			this._initMobileUsageReporting();

			// create the views based on the url/hash
			this.getRouter().initialize();

			var oUserContextModel = new sap.ui.model.json.JSONModel();
			this.setModel(oUserContextModel, "praUserContext");
			
			// set model with logged-in user details
			this.setLoggedInUser();

			oDataManager.getUserOrgUnit(this, "", this.setUserModel);
			this.noAuthDialog = new NoAuthDialog();
			Helpers.preventSessionTimeout(this.getModel(), 1200000);
			sap.ui.getCore().getConfiguration().setLanguage("en-gb");
			sap.ui.getCore().getConfiguration().setFormatLocale("en-GB");
		},

		setUserModel: function(oData, aParameters, that) {
			var oUserContext = {
				EmpId: oData.EmpId,
				HigherUnt: oData.HigherUnt,
				/* eslint-disable sap-no-hardcoded-url */
				BaseURLCRM: "https://" + "icp" /*that.getCRMserverFromSystem(jsonResult.system)*/ + ".wdf.sap.corp/"
				/* eslint-enable sap-no-hardcoded-url */
			};
			that.getModel("praUserContext").setProperty("/", oUserContext);
			that.getModel("praUserContext").firePropertyChange();
		},
		
		setLoggedInUser: function(){
		//	var oModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
			var oModel = new sap.ui.model.json.JSONModel(sap.ui.require.toUrl("sap/coe/planning/calendar") + "/user-api/currentUser");
			this.setModel(oModel, "userModel");
		},

		getCRMserverFromSystem: function(sSystem) {
			var sServer;

			switch (sSystem.toLowerCase()) {
				case "pgd":
					sServer = "icd";
					break;
				case "pgt":
					sServer = "ict";
					break;
				case "pgp":
					sServer = "icp";
					break;
				default:
					sServer = "icd";
			}

			return sServer;
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		updateP13n: function(sPersonalizer, oPersData) {
            if (this[sPersonalizer]) {
                P13nHelper.saveData(this[sPersonalizer], oPersData);
            }
        },

		_initP13n: function() {
			this._calViewP13n = P13nHelper.init(this, "calendar.settings", "viewKey");
			this._tableP13n = P13nHelper.init(this, "worklisttable.settings", "columns");
			this._tableSortP13n = P13nHelper.init(this, "tablesort.settings", "tableSortKey");
			this._calSortP13n = P13nHelper.init(this, "calendarsort.settings", "calendarSortKey");
			this._variantSortP13n = P13nHelper.init(this, "variantsort.settings", "variantsortKey");
			this.setModel(new sap.ui.model.json.JSONModel(), "P13nTableModel");

			//is this a good approach? adding it to remove bug,it was forgotten but is in pc component
			var oP13nModel = new sap.ui.model.json.JSONModel();
			this.setModel(oP13nModel, "p13nModel");

			this._calPersP13n = P13nHelper.init(this, "calendarpers.settings", "calendarPersKey");

			// dynamic date range in worlist
			this._oDynamicDateRangeP13n = P13nHelper.init(this, "dynamicdaterange.settings", "dateRange");
		
			//im just putting this here becuase its in rpa component and the code needs it to work
			//all other p13n functionality did not require handling of default values at component level
			// TODO refactor
			P13nHelper.readData(this._calPersP13n, function(oPersData) {
				if (oPersData !== undefined) {
					this.getModel("p13nModel").setProperty("/calPersKey", oPersData);
				}
				else {
					this.getModel("p13nModel").setProperty("/calPersKey", {empId: false, country: false, orgTxt: false, orgId: false});
				}
            }.bind(this), function() {
              	// if p13n request fails set to default view key
                this.getModel("p13nModel").setProperty("/calPersKey", {empId: false, country: false, orgTxt: false, orgId: false});
            }.bind(this));
		},

		//IT Launchpad Mobile reporting
		_initMobileUsageReporting: function() {
			// Use Enterprise Mobility "Mobile Usage Reporting" framework
			try {
				/* eslint-disable sap-no-hardcoded-url */
				jQuery.sap.registerModulePath("sap.git.usage", "https://trackingshallwe.hana.ondemand.com/web-client/");
				/* eslint-enable sap-no-hardcoded-url */
				jQuery.sap.require("sap.git.usage.MobileUsageReporting");
				sap.git.usage.MobileUsageReporting.startReporting(this);
			} catch (err) {
				jQuery.sap.log.error("Could not load/inject MobileUsageReporting");
			}
		}
	});

});