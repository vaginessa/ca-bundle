"use strict";

const {classes: Cc, interfaces: Ci} = Components;

class CACertificates {
  constructor() {
    this._certDB = Cc["@mozilla.org/security/x509certdb;1"].getService(Ci.nsIX509CertDB);
    this._certDB.QueryInterface(Ci.nsIX509CertDB);
  }

  getCerts() {
    let enumerator = this._certDB.getCerts().getEnumerator(), certs = [];
    while(enumerator.hasMoreElements()) {
      let cert = enumerator.getNext();
      cert.QueryInterface(Ci.nsIX509Cert);
      cert = Object.create(cert);

      cert.tableTitle = [
        cert.issuerCommonName || cert.issuerOrganizationUnit || cert.organization,
        cert.commonName
      ].filter(function(value) { return value; })
       .join(" - ");

       certs.push(cert);
    }
    certs.sort(function(a, b) {
      if (a.tableTitle.toLowerCase() > b.tableTitle.toLowerCase()) { return 1; }
      if (a.tableTitle.toLowerCase() < b.tableTitle.toLowerCase()) { return -1; }
      return 0;
    });
    return certs;
  }

  getCertByNickname(nickname) {
    return this._certDB.findCertByNickname(null, nickname);
  }
}

class UI {
  constructor(certs) {
    this._certs = certs;
  }

  populateTable() {
    let template = Handlebars.compile(document.getElementById("certificate-template").innerHTML),
        tableHtml = "";

    this._certs.getCerts().forEach(function(cert) {
      tableHtml += template(cert);
    });
    document.querySelector("tbody").innerHTML = tableHtml;

    // TODO replace me with something useful.
    for(let toggler of document.querySelectorAll("tr")) {
      toggler.addEventListener("click", (e) => {
        let certNickname = e.target.parentNode.parentNode.dataset.nickname,
            cert = this._certs.getCertByNickname(certNickname),
            bit = e.target.dataset.bit;
        console.dir({certNickname, cert, bit});
      });
    }
  }
}

window.certs = new CACertificates();
window.ui = new UI(certs);

document.addEventListener("DOMContentLoaded", function() {
  ui.populateTable();
});
