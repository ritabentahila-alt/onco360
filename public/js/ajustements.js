// Ajustements propres à la version Firebase (chargés APRÈS l'application)
(function () {
  var PROPRIETAIRE = "ritabentahila@gmail.com";
  function deconnexion() {
    if (!confirm("Se déconnecter de Chimio HGC sur cet appareil ?")) return;
    import("./config.js").then(function (m) { return import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js").then(function (a) { return a.signOut(m.auth); }); })
      .then(function () { location.replace("index.html"); });
  }
  window.fbDeconnexion = deconnexion;
  // Fonctions de l'ancien serveur Google qui n'ont plus lieu d'être
  function nettoyer() {
    var z = document.getElementById("admBar"); if (!z) return;
    [].slice.call(z.querySelectorAll("button,span")).forEach(function (x) {
      var t = x.textContent || "";
      if (/Import SUIVI_PATIENTS|Mettre à jour l’application|Ancienne adresse|Serveur à jour|Verrouiller/.test(t)) x.remove();
    });
  }
  nettoyer(); setTimeout(nettoyer, 500);
  if (window.AG) window.AG.off = true;
  window.syncAgendaManuel = function () { alert("Google Agenda est mis à jour automatiquement toutes les 10 minutes à partir des dossiers. Rien à faire."); };
  // Plus de code 1994 : les droits viennent du compte connecté
  window.admBasculer = function () { alert("Les droits dépendent du compte connecté. Contactez l’administrateur pour modifier les accès."); };

  // Appelé par le pont dès que l'on sait quel compte est connecté
  window.__FB_SURAUTH = function (email) {
    var admin = email === PROPRIETAIRE;
    window.estAdmin = function () { return admin; };
    var b = document.getElementById("btnAdm"); if (b) b.style.display = "none";
    var z = document.getElementById("admBar");
    if (z && admin && !document.getElementById("btnHist")) {
      z.insertAdjacentHTML("beforeend",
        '<button id="btnHist" class="s l" style="white-space:nowrap" onclick="location.href=\'historique.html\'">🕘 Historique des modifications</button>' +
        '<button class="s l" style="white-space:nowrap" onclick="fbDeconnexion()">⎋ Déconnexion</button>');
    }
    nettoyer();
    if (window.admAppliquer) window.admAppliquer();
    // Pied de page : compte connecté + déconnexion (visible pour tous les comptes)
    if (!document.getElementById("fbPied")) {
      var p = document.createElement("div"); p.id = "fbPied";
      p.style.cssText = "text-align:center;font-size:12px;color:#888;padding:14px 10px 24px";
      p.innerHTML = "Connecté : " + email.replace(/[<>&"]/g, "") + ' · <a href="#" onclick="fbDeconnexion();return false" style="color:#2B2D5C">Se déconnecter</a>';
      document.body.appendChild(p);
    }
  };
})();
