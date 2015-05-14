"use strict";

class CACertificates {
  constructor() {
    this._certDB = Cc["@mozilla.org/security/x509certdb;1"].getService(Ci.nsIX509CertDB);
    this._certDB.QueryInterface(Ci.nsIX509CertDB);
  }

  getCerts(onlyTrusted = false) {
    let enumerator = this._certDB.getCerts().getEnumerator(), certs = [];
    while(enumerator.hasMoreElements()) {
      if(onlyTrusted) {
        let cert = this.getEnrichedCertObject(enumerator.getNext());
        if(!!cert.trustValue) {
          certs.push(cert);
        }
      } else {
        certs.push(this.getEnrichedCertObject(enumerator.getNext()));
      }
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

    cert.trustValue = (cert.trustBits.ssl ? this._certDB.TRUSTED_SSL : 0)
                      | (cert.trustBits.email ? this._certDB.TRUSTED_EMAIL : 0)
                      | (cert.trustBits.objsign ? this._certDB.TRUSTED_OBJSIGN : 0);

    cert.tableTitle = [
      cert.issuerCommonName || cert.issuerOrganizationUnit || cert.organization,
      cert.commonName
    ].filter(function(value) { return value; })
     .join(" - ");

    return cert;
  }
}
