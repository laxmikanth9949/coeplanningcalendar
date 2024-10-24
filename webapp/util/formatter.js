sap.ui.define([
    "sap/coe/capacity/reuselib/utils/baseclasses/Formatter",
    "sap/ui/core/format/DateFormat",
    "sap/coe/planning/calendar/util/i18n"
], function(FormatterBaseClass, DateFormat, i18n) {

    var FormatterReuseClass = FormatterBaseClass.extend("sap.coe.planning.calendar.util.formatter", {

        /**
         * Format the date as output string
         *
         * @public
         * @param {object} oDate the date to be formatted
         * @returns {string} sValue the formatted date
         */
        date: function(oDate) {
            if (!oDate || !(oDate instanceof Date)) return;
            var oDateFormat = DateFormat.getDateInstance({
                pattern: "MMM d,YYYY"
            }, new sap.ui.core.Locale("en-US"));
            return oDateFormat.format(oDate);
        },

        /**
         * Format the date as output string with the hour and the time zone
         *
         * @public
         * @param {object} oDate the date to be formatted
         * @returns {string} sValue the formatted date
         */
        dateTime: function(oDate) {
            if (!oDate) return;
            var oDateFormat = DateFormat.getDateInstance({
                pattern: "dd/MM/YYYY hh:mm a ZZZZ"
            }, new sap.ui.core.Locale("en-US"));
            return oDateFormat.format(oDate);
        },

        time: function(oDate) {
            if (!oDate) return;
            var oDateFormat = DateFormat.getDateInstance({
                pattern: "hh:mm a"
            }, new sap.ui.core.Locale("en-US"));
            return oDateFormat.format(oDate);
        },
        
        /**
         * Gets the text value to a specific key value out of the UtilsModel.
         * @public
         * @param {string} Key value.
         * @returns {string} Text value
         */
        staffingLevel: function(sStaffingLevelKey) {
            if (!sStaffingLevelKey) return;
            var aStaffingLevelEntries = this.getModel ? this.getModel("UtilsModel").getProperty("/StaffingLevel") : this.getView().getModel("UtilsModel").getProperty("/StaffingLevel");

            for (var i = 0; i < aStaffingLevelEntries.length; i++) {
                if (aStaffingLevelEntries[i].key === sStaffingLevelKey) return aStaffingLevelEntries[i].text;
            }

            return "";
        },

        /**
         * Concats the employee's name and staffing level
         * @public
         * @param {string} sStaffingLevelKey.
         * @param {string} sFirstName.
         * @param {string} sLastName.
         * @param {string} sEmpID.
         * @returns {string} formatted string
         */
        staffingLevelWithName: function(sStaffingLevelKey, sFirstName, sLastName, sEmpID) {
            if (!sStaffingLevelKey) return;
            if (sStaffingLevelKey !== "A") {
                var sStaff = sFirstName + " " + sLastName;
                if (sEmpID) {
                    sStaff += " (" + sEmpID + ")";
                }
                return sStaff;
            }
            else{
                return i18n.getText("FORMATTER_TEXT_NOT_STAFFED");
            }
        },

        /**
         * Gets the number of days between two dates
         * @public
         * @param {Date} dBegDate
         * @param {Date} dEndDate
         * @returns {Integer} Amount of days
         */
        daysDifference: function(dBegDate, dEndDate) {
            return Math.ceil((dEndDate - dBegDate) / (1000 * 3600 * 24));
        },

        /**
         * Formats numbers given as string with spacer.
         * Useful to trim left zeros of numbers or for numbers mixed with strings
         * Inserts a hyphen between the 2 values given and returns the result
         *
         * @param {String} sNumber1 to be converted to string
         * @param {String} sNumber2 to be converted to string
         * @return {String} The numbers formmatted with hyphen
         * @public
         */
        toStringWithSpacer: function(sNumber1, sNumber2) {
            var iInt1 = parseInt(sNumber1, 10),
                iInt2 = parseInt(sNumber2, 10);
            return iInt1 + " - " + iInt2;
        },

         /**
         * Concatenates strings with a space
         * @name concatenateStrings
         * @function
         * @memberOf Formatter
         * @param {String} arguments[] - string to be concatenated, function accepts any number of strings
         * @return {String} - the newly concatenated strings
         */
         concatenateStrings: function() {
            return Array.prototype.join.call(arguments, " ");
         },

         /**
         * Formats the rating text
         * @name formatRating
         * @function
         * @memberOf Formatter
         * @param {String} sRating - the rating as a code
         * @return {String} - sIcon - the rating long value
         */
         formatRating: function(sRating) {
            var sText = "";
            switch (sRating) {
                case "A":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_RATING_GREEN");
                    break;
                case "B":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_RATING_YELLOW");
                    break;
                case "C":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_RATING_RED");
                    break;
                case "D":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_RATING_LATE");
                    break;
                default:
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_RATING_STAFFED");
                    break;
            }
            return sText;
         },

         /**
         * Formats the rating text to determine the value state
         * @name formatRatingStatus
         * @function
         * @memberOf Formatter
         * @param {String} sRating - the rating as a code
         * @return {String} - sValueState - the value state
         */
         formatRatingStatus: function(sRating) {
            var sValueState = "";

            if (sRating === "B") {
                sValueState = "Warning";
            }
            else if (sRating === "C" || sRating === "D") {
                sValueState = "Error";
            }
            else {
                sValueState = "Success";
            }
            return sValueState;
         },

         /**
         * Concatenates two values, puts a forward slash between them
         *
         * @public
         * @param {String} sValue1 - first value
         * @param {String} sValue2 - second value
         * @returns {String} formatted string.
         */
         seperateWithSlash: function(sValue1, sValue2) {
            var iValue1 = parseInt(sValue1, 10),
                iValue2 = parseInt(sValue2, 10);

            if (sValue1 === null || sValue1 === undefined || sValue1 === "") {
                return i18n.getText("PLANNING_CALENDAR_HEADER_NO_SERVICE_SELECTED");
            }
            else {
                return (isNaN(iValue1) || isNaN(iValue2)) ? sValue1 + " / " + sValue2 : iValue1 + " / " + iValue2;
            }
         },

         /**
         * Retrieves the corresponding column header text from i18n based on column id
         * Used for table personalisation dialog
         * @public
         * @param {String} sId - column id
         * @returns {String} Column header text
         */
        retrieveColumnHeader: function(sId) {
            var sText = "";
            switch (sId) {
                case "scopeDate":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_SCOPE_DATE");
                    break;
                case "cwCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_CALENDAR_WEEK");
                    break;
                case "startDateCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_START_DATE");
                    break;
                case "startTimeCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_START_TIME");
                    break;
                case "endDateCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_END_DATE");
                    break;
                case "endTimeCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_END_TIME");
                    break;
                case "callOffCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_CALL_OFF");
                    break;
                case "customerCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_CUSTOMER");
                    break;
                case "demandIdCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_DEMAND_ID");
                    break;
                case "itemNoCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_ITEM_NUMBER");
                    break;
                case "headerDescCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_HEADER_DESCRIPTION");
                    break;
                case "itemDescriptionCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_PRODUCT_DESCRIPTION");
                    break;
                case "qualifiationDescriptionCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_QUALIFICATION_DESCRIPTION");
                    break;
                case "firstNameCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_FIRST_NAME");
                    break;
                case "lastNameCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_LAST_NAME");
                    break;
                case "ratingCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_RATING");
                    break;
                case "headerStatusCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_HEADER_STATUS");
                    break;
                case "dataProtectionCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_DATA_PROTECTION");
                    break;
                case "customerERPCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_CUSTOMER_ERP");
                    break;
                case "premiumEngagementCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_PREMIUM_ENGAGEMENT");
                    break;
                case "userNameCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_EMPLOYEEID");
                    break;
                case "assignStartDateCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_ASSIGNMENT_START_DATE");
                    break;
                case "assignStartTimeCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_ASSIGNMENT_START_TIME");
                    break;
                case "assignEndDateCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_ASSIGNMENT_END_DATE");
                    break;
                case "assignEndTimeCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_ASSIGNMENT_END_TIME");
                    break;
                case "serviceTeamCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_SERVICE_TEAM");
                    break;
                case "userStatusCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_USER_STATUS");
                    break;
                case "effortCol":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_EFFORT");
                    break;
                case "assignCountry":
                    sText = i18n.getText("VIEW_WORKLIST_TABLE_COLUMN_COUNTRY");
                    break;
                default:
                    break;
            }
            return sText;
        }
    });

    sap.coe.planning.calendar.util.formatter = new FormatterReuseClass();

    return sap.coe.planning.calendar.util.formatter;
});
