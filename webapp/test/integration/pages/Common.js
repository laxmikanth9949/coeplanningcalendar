sap.ui.define([
    "sap/ui/test/Opa5"
  ], function(Opa5) {
    "use strict";


    function getFrameUrl (sHash, sUrlParameters) {
        var sUrl = "../flpSandboxMockServer.html";
        sUrlParameters = sUrlParameters ? "?" + sUrlParameters : "";

        if (sHash) {
            sHash = "#PlanningCalendar-manage&/" + (sHash.indexOf("/") === 0 ? sHash.substring(1) : sHash);
        } else {
            sHash = "#PlanningCalendar-manage";
        }

        return sUrl + sUrlParameters + sHash;
    }

    return Opa5.extend("sap.coe.planning.calendar.test.integration.pages.Common", {

      iStartTheApp: function (sUrl) {
        this.iStartMyAppInAFrame(getFrameUrl(sUrl, "serverDelay=1000"));
      }

    });
  }
);