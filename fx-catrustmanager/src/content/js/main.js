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
      certs.push(this.getEnrichedCertObject(enumerator.getNext()));
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

  getEnrichedCertObject(certWrapper) {
    let cert = Object.create(certWrapper);
    certWrapper.QueryInterface(Ci.nsIX509Cert);

    cert.trustBits = {
      ssl: this._certDB.isCertTrusted(certWrapper, certWrapper.certType, Ci.nsIX509CertDB.TRUSTED_SSL),
      email: this._certDB.isCertTrusted(certWrapper, certWrapper.certType, Ci.nsIX509CertDB.TRUSTED_EMAIL),
      objsign: this._certDB.isCertTrusted(certWrapper, certWrapper.certType, Ci.nsIX509CertDB.TRUSTED_OBJSIGN)
    };

    cert.tableTitle = [
      cert.issuerCommonName || cert.issuerOrganizationUnit || cert.organization,
      cert.commonName
    ].filter(function(value) { return value; })
     .join(" - ");

    return cert;
  }
}

class UI {
  constructor(certs) {
    this._certs = certs;
    this._certificateRowTemplate = Handlebars.compile(document.getElementById("certificate-row-template").innerHTML);
  }

  populateTable() {
    let table = document.querySelector("tbody");
    this._certs.getCerts().forEach((cert) => {
      table.appendChild(this.getCertificateRowDOMObject(cert));
    });
  }

  getCertificateRowDOMObject(cert) {
    let row = document.createElement("tr");
    row.innerHTML = this._certificateRowTemplate(cert);
    row.dataset["nickname"] = cert.nickname;

    for(let toggler of row.querySelectorAll(".toggleButton")) {
      toggler.addEventListener("click", (e) => {
        let certNickname = e.target.parentNode.parentNode.dataset.nickname,
            cert = this._certs.getCertByNickname(certNickname),
            bit = e.target.dataset.bit;
        e.preventDefault();
        console.dir({certNickname, cert, bit});
      });
    }

    return row;
  }
}

document.addEventListener("DOMContentLoaded", function() {
  window.certs = new CACertificates();
  window.ui = new UI(certs);

  ui.populateTable();
});
