"use strict";

class UI {
  constructor(certs) {
    this._certs = certs;
    this._certificateRowTemplate = Handlebars.compile(document.getElementById("certificate-row-template").innerHTML);

    document.querySelector("#filter").addEventListener("submit", (e) => {
      this.populateTable();
      e.preventDefault();
    });

    document.querySelector("#only-trusted").addEventListener("change", this.populateTable.bind(this));
  }

  populateTable() {
    let table = document.querySelector("tbody");
    table.innerHTML = "";
    this._certs.getCerts(document.querySelector("#only-trusted").checked).forEach((cert) => {
      table.appendChild(this.getCertificateRowDOMObject(cert));
    });
  }

  getCertificateRowDOMObject(cert) {
    let row = document.createElement("tr");
    row.innerHTML = this._certificateRowTemplate(cert);
    row.dataset.nickname = cert.nickname;

    for(let toggler of row.querySelectorAll(".toggleButton")) {
      toggler.addEventListener("click", (e) => {
        let certNickname = e.target.parentNode.parentNode.dataset.nickname,
            cert = this._certs.getEnrichedCertObject(this._certs.getCertByNickname(certNickname)),
            bit = e.target.dataset.bit;
        e.preventDefault();
        console.dir({cert, bit, trustValue: cert.trustValue});
      });
    }

    return row;
  }
}
