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
      certs.push(cert);
    }
    return certs;
  }
}

document.addEventListener("DOMContentLoaded", function() {
  let certs = new CACertificates(),
      template = Handlebars.compile(document.getElementById("certificate-template").innerHTML),
      tableHtml = "";

  certs.getCerts().forEach(function(cert) {
    tableHtml += template({nickname: cert.nickname, name: cert.commonName});
  });

  document.querySelector("tbody").innerHTML = tableHtml;
});
