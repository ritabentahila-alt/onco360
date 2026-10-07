// Onco360 – documents générés dans le navigateur : compte rendu de fin de radiothérapie et pli confidentiel (Word .docx),
// récapitulatif des rendez-vous de radiothérapie (Excel .xlsx). Logo de l'établissement en haut à gauche de chaque document.
// Aucune donnée n'est envoyée à l'extérieur.
import { addJ, ouvre } from "../moteur/outils.js";
import { finRT } from "../moteur/rt.js";

const xml = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const dfrA = (d) => (d ? d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4) : "");
let zipPromesse = null;
function chargerZip() {
  if (window.JSZip) return Promise.resolve(window.JSZip);
  if (!zipPromesse) zipPromesse = new Promise((ok, ko) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; s.onload = () => ok(window.JSZip); s.onerror = () => ko(new Error("Impossible de charger l'outil de création de fichiers (connexion ?)")); document.head.appendChild(s); });
  return zipPromesse;
}
function telecharger(blob, nom) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nom; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}
// ───── Images (logo de l'établissement, signature) : data URL → octets + dimensions ─────
export async function lireImage(url) {
  if (!url || !/^data:image\/(png|jpe?g)/i.test(url)) return null;
  const ext = /^data:image\/png/i.test(url) ? "png" : "jpeg", b = atob(url.split(",")[1]), o = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) o[i] = b.charCodeAt(i);
  const dim = await new Promise((ok) => { const im = new Image(); im.onload = () => ok({ w: im.naturalWidth || 1, h: im.naturalHeight || 1 }); im.onerror = () => ok({ w: 4, h: 1 }); im.src = url; });
  return { ext, octets: o, w: dim.w, h: dim.h };
}
// Taille en EMU (1 cm = 360 000) dans une boîte maximale
const taille = (im, maxL, maxH) => { const k = Math.min(maxL / im.w, maxH / im.h); return { cx: Math.round(im.w * k), cy: Math.round(im.h * k) }; };
const CM = 360000;
const dessinW = (rid, t, id, nom) => '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + t.cx + '" cy="' + t.cy + '"/><wp:docPr id="' + id + '" name="' + nom + '"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="' + id + '" name="' + nom + '"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + t.cx + '" cy="' + t.cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
const NS_W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';
// Document Word complet : corps (paragraphes), logo dans l'en-tête de chaque page, signature (r:embed="rIdSig") dans le corps
async function docx(corps, nom, o) {
  const JSZip = await chargerZip(), z = new JSZip(), logo = o && o.logo, sig = o && o.sig;
  const rels = ['<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'];
  let sect = '<w:sectPr>';
  if (logo) {
    rels.push('<Relationship Id="rIdH" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>');
    sect += '<w:headerReference w:type="default" r:id="rIdH"/>';
    z.file("word/header1.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ' + NS_W + '><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>' + dessinW("rIdL", taille(logo, 6 * CM, 1.7 * CM), 100, "Logo") + "</w:p></w:hdr>");
    z.file("word/_rels/header1.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdL" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.' + logo.ext + '"/></Relationships>');
    z.file("word/media/logo." + logo.ext, logo.octets);
  }
  if (sig) { rels.push('<Relationship Id="rIdSig" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/signature.' + sig.ext + '"/>'); z.file("word/media/signature." + sig.ext, sig.octets); }
  sect += '<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="' + (logo ? 1900 : 1134) + '" w:right="1134" w:bottom="1134" w:left="1134" w:header="500" w:footer="567" w:gutter="0"/></w:sectPr>';
  z.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' + (logo ? '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>' : "") + "</Types>");
  z.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  z.file("word/_rels/document.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + rels.join("") + "</Relationships>");
  z.file("word/styles.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:lang w:val="fr-FR"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>');
  z.file("word/document.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS_W + "><w:body>" + corps + sect + "</w:body></w:document>");
  const blob = await z.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  telecharger(blob, nom);
}
const nomFichier = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");

// Dates des séances : exactement autant de dates que de fractions.
// Traitement terminé (date de fin réelle) : jours de traitement entre la 1re séance et la fin réelle ; s'il y en a trop
// (interruptions), on retire des jours au milieu, répartis régulièrement, en gardant la 1re et la dernière séance.
export function datesSeancesRT(r, ctx) {
  const nb = parseInt(r.nb, 10), pas = r.ryt === "2" ? 2 : 1, F = ctx.feries || [];
  if (!r.deb || !nb) return { dates: [], ajuste: false };
  const fin = r.fin || null, l = []; let d = r.deb, w = 0;
  for (let g = 0; g < 1000; g++) {
    if (fin ? d > fin : l.length >= nb) break;
    if (ouvre(d, F)) { if (w % pas === 0) l.push(d); w++; }
    d = addJ(d, 1);
  }
  if (fin && l[l.length - 1] !== fin && ouvre(fin, F)) l.push(fin);
  let ajuste = false;
  if (l.length > nb && nb >= 2) {
    const milieu = l.slice(1, -1), garder = nb - 2, pris = [];
    for (let i = 0; i < garder; i++) pris.push(milieu[Math.round((i * (milieu.length - 1)) / Math.max(garder - 1, 1))]);
    const uniques = [...new Set(pris)];
    let k = 0; while (uniques.length < garder && k < milieu.length) { if (uniques.indexOf(milieu[k]) < 0) uniques.push(milieu[k]); k++; }
    uniques.sort(); l.splice(0, l.length, l[0], ...uniques, l[l.length - 1] || fin); ajuste = true;
  }
  return { dates: l, ajuste, manquantes: Math.max(0, nb - l.length) };
}

// ───────── Excel : « Rendez-vous du patient » ─────────
export async function excelRdvRT(P, r, ctx, medecin, o) {
  const JSZip = await chargerZip(), { dates } = datesSeancesRT(r, ctx), t = ctx.aujourdhui, logo = await lireImage(o && o.logo);
  if (!dates.length) throw new Error("Indiquez la date de la 1re séance et le nombre de fractions.");
  const nomPat = (P.nomF || "").toUpperCase() + (P.prenom ? ", " + P.prenom : "");
  const cell = (ref, v, s, num) => num ? '<c r="' + ref + '" s="' + s + '"><v>' + v + "</v></c>" : '<c r="' + ref + '" s="' + s + '" t="inlineStr"><is><t xml:space="preserve">' + xml(v) + "</t></is></c>";
  const rows = [];
  rows.push('<row r="3" ht="30" customHeight="1">' + cell("B3", "Rendez-vous du patient", 1) + "</row>");
  rows.push('<row r="9" ht="24" customHeight="1">' + cell("B9", "Date de début : " + dfrA(dates[0]) + "    -    Date de fin : " + dfrA(dates[dates.length - 1]), 2) + ["C", "D", "E", "F"].map((c) => cell(c + "9", "", 2)).join("") + "</row>");
  rows.push('<row r="10" ht="20" customHeight="1">' + cell("B10", "Patient : " + nomPat, 3) + cell("C10", "", 3) + cell("D10", "", 3) + cell("E10", "Médecin : " + medecin, 3) + cell("F10", "", 3) + "</row>");
  rows.push('<row r="11" ht="44" customHeight="1">' + ["Date du rendez-vous", "Durée de l'activité (min)", "Activité", "Ressource", "État du rendez-vous"].map((h, i) => cell("BCDEF"[i] + "11", h, 4)).join("") + "</row>");
  const ressource = medecin.replace(/^Dr\.?\s*/i, "");
  dates.forEach((d, i) => {
    const n = 12 + i, act = i === 0 ? "Mise en place RA" : i === dates.length - 1 ? "Fin de Traitement RA" : "Traitement Journalier RA";
    rows.push('<row r="' + n + '">' + cell("B" + n, dfrA(d), 5) + cell("C" + n, i === 0 ? 15 : 20, 6, true) + cell("D" + n, act, 5) + cell("E" + n, ressource, 5) + cell("F" + n, d <= t || r.fin ? "Terminé" : "Planifié", 5) + "</row>");
  });
  const sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews><cols><col min="1" max="1" width="2" customWidth="1"/><col min="2" max="2" width="20" customWidth="1"/><col min="3" max="3" width="14" customWidth="1"/><col min="4" max="4" width="28" customWidth="1"/><col min="5" max="5" width="24" customWidth="1"/><col min="6" max="6" width="18" customWidth="1"/></cols><sheetData>' + rows.join("") + '</sheetData><mergeCells count="4"><mergeCell ref="B3:F3"/><mergeCell ref="B9:F9"/><mergeCell ref="B10:D10"/><mergeCell ref="E10:F10"/></mergeCells><pageSetup orientation="portrait" fitToWidth="1"/>' + (logo ? '<drawing r:id="rId1"/>' : "") + "</worksheet>";
  const bord = '<border><left style="thin"><color rgb="FF8C8C8C"/></left><right style="thin"><color rgb="FF8C8C8C"/></right><top style="thin"><color rgb="FF8C8C8C"/></top><bottom style="thin"><color rgb="FF8C8C8C"/></bottom><diagonal/></border>';
  const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="5"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="15"/><color rgb="FF44546A"/><name val="Arial"/></font><font><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font><font><sz val="10"/><name val="Arial"/></font></fonts><fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF4D4D4D"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9D9D9"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2F4A7C"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>' + bord + '</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="7"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="bottom"/></xf><xf numFmtId="0" fontId="4" fillId="3" borderId="0" xfId="0" applyFill="1" applyAlignment="1"><alignment vertical="bottom"/></xf><xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="right"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  const z = new JSZip();
  z.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
  z.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  z.file("xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Rendez-vous du patient" sheetId="1" r:id="rId1"/></sheets></workbook>');
  z.file("xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  z.file("xl/worksheets/sheet1.xml", sheet); z.file("xl/styles.xml", styles);
  if (logo) {
    // Logo en haut à gauche (cellule A1), au-dessus du titre
    const tl = taille(logo, 5.2 * CM, 1.5 * CM);
    z.file("xl/worksheets/_rels/sheet1.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>');
    z.file("xl/drawings/_rels/drawing1.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/logo.' + logo.ext + '"/></Relationships>');
    z.file("xl/drawings/drawing1.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><xdr:oneCellAnchor><xdr:from><xdr:col>1</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>40000</xdr:rowOff></xdr:from><xdr:ext cx="' + tl.cx + '" cy="' + tl.cy + '"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="2" name="Logo"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + tl.cx + '" cy="' + tl.cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor></xdr:wsDr>');
    z.file("xl/media/logo." + logo.ext, logo.octets);
    z.file("[Content_Types].xml", z.file("[Content_Types].xml") ? (await z.file("[Content_Types].xml").async("string")).replace("</Types>", '<Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>') : "");
  }
  const blob = await z.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  telecharger(blob, "Rendez-vous_RT_" + nomFichier(P.nom) + ".xlsx");
  return dates.length;
}


// ───────── Modèles Word du médecin (public/modeles/*.docx) : étiquettes {{…}} remplacées par les informations du dossier ─────────
// Étiquettes reconnues sans tenir compte des accents ni des majuscules ({{Spécialité}} = {{SPECIALITE}}).
// Valeur vide : « À REMPLIR » surligné en jaune (vide: "AR") ou « à compléter par le médecin » en gris (vide: "AF").
// {{LOGO}} et {{SIGNATURE}} : images. Une étiquette inconnue reste telle quelle (visible dans le document).
const cle = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
// Word coupe parfois une étiquette en plusieurs morceaux : on la recolle dans le premier morceau
function recoller(p) {
  const re = /(<w:t(?: [^>]*)?>)([^<]*)(<\/w:t>)/g, seg = []; let m;
  while ((m = re.exec(p))) seg.push({ i: m.index, l: m[0].length, o: m[1], t: m[2], f: m[3] });
  const tout = seg.map((z) => z.t).join(""); if (tout.indexOf("{{") < 0) return p;
  const debut = []; let n = 0; seg.forEach((z) => { debut.push(n); n += z.t.length; });
  const ou = (pos) => { for (let k = seg.length - 1; k >= 0; k--) if (pos >= debut[k]) return k; return 0; };
  const reT = /\{\{[^{}]*\}\}/g; let t, change = false;
  while ((t = reT.exec(tout))) {
    const a = ou(t.index), b = ou(t.index + t[0].length - 1); if (a === b) continue;
    change = true; const finB = t.index + t[0].length - debut[b];
    seg[a].t = seg[a].t.slice(0, t.index - debut[a]) + t[0] + seg[b].t.slice(finB);
    for (let k = a + 1; k <= b; k++) seg[k].t = ""; // le reste du dernier morceau est passé dans le premier
  }
  if (!change) return p;
  let out = "", pos = 0; seg.forEach((z) => { out += p.slice(pos, z.i) + z.o.replace(/^<w:t(?: [^>]*)?>/, '<w:t xml:space="preserve">') + z.t + z.f; pos = z.i + z.l; });
  return out + p.slice(pos);
}
async function remplirModele(url, V, o) {
  const JSZip = await chargerZip(), rep = await fetch(url, { cache: "no-cache" });
  if (!rep.ok) throw new Error("Modèle introuvable (" + url + ")");
  const z = await JSZip.loadAsync(await rep.arrayBuffer()), VAL = {};
  Object.keys(V).forEach((k) => { VAL[cle(k)] = V[k]; });
  const images = { LOGO: o.logo ? { im: o.logo, max: [6 * CM, 1.7 * CM] } : null, SIGNATURE: o.sig ? { im: o.sig, max: [5 * CM, 2.2 * CM] } : null };
  let nImg = 300; const ajoutes = new Set();
  const parties = Object.keys(z.files).filter((n) => /^word\/(document|header\d*|footer\d*)\.xml$/.test(n));
  for (const part of parties) {
    let x = await z.file(part).async("string"); if (x.indexOf("{{") < 0) continue;
    x = x.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, recoller);
    const relsNom = part.replace(/^word\//, "word/_rels/") + ".rels", liens = [];
    // Chaque morceau de texte contenant des étiquettes est découpé : texte, valeur, image…
    x = x.replace(/<w:r(?: [^>]*)?>((?:(?!<\/w:r>)[\s\S])*?)<w:t(?: [^>]*)?>([^<]*\{\{[^<]*)<\/w:t>((?:(?!<\/w:r>)[\s\S])*?)<\/w:r>/g, (tout, avant, texte, apres) => {
      const rPr = (avant.match(/<w:rPr>[\s\S]*?<\/w:rPr>/) || [""])[0], autre = avant.replace(rPr, "");
      const runT = (t, ajout) => "<w:r>" + (ajout ? (rPr ? rPr.replace("</w:rPr>", ajout + "</w:rPr>") : "<w:rPr>" + ajout + "</w:rPr>") : rPr) + '<w:t xml:space="preserve">' + t + "</w:t></w:r>";
      let out = autre ? "<w:r>" + rPr + autre + "</w:r>" : "";
      String(texte).split(/(\{\{[^{}]*\}\})/).forEach((morceau) => {
        if (!morceau) return;
        const m = morceau.match(/^\{\{([^{}]*)\}\}$/); if (!m) { out += runT(morceau); return; }
        const k = cle(m[1]);
        if (k === "LOGO" || k === "SIGNATURE") { const I = images[k]; if (!I) return; const rid = "rIdOnco" + k; liens.push([rid, k, I.im]); out += dessinW(rid, taille(I.im, I.max[0], I.max[1]), ++nImg, k); return; }
        if (!(k in VAL)) { out += runT(xml(morceau)); return; }
        const v = VAL[k] == null ? "" : String(VAL[k]).trim();
        if (!v) { out += o.vide === "AR" ? runT("À REMPLIR", '<w:b/><w:highlight w:val="yellow"/>') : runT(xml("à compléter par le médecin"), '<w:i/><w:color w:val="8A8A8A"/>'); return; }
        out += runT(v.split(/\r?\n/).map(xml).join('</w:t><w:br/><w:t xml:space="preserve">'));
      });
      return out + (apres.replace(/<w:rPr>[\s\S]*?<\/w:rPr>/, "").trim() ? "<w:r>" + rPr + apres + "</w:r>" : "");
    });
    z.file(part, x);
    if (liens.length) {
      const f = z.file(relsNom); let rels = f ? await f.async("string") : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
      const vus = new Set();
      liens.forEach(([rid, k, im]) => { if (vus.has(rid)) return; vus.add(rid); const nomF = (k === "LOGO" ? "logo" : "signature") + "." + im.ext;
        rels = rels.replace("</Relationships>", '<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + nomF + '"/></Relationships>');
        if (!ajoutes.has(nomF)) { z.file("word/media/" + nomF, im.octets); ajoutes.add(nomF); } });
      z.file(relsNom, rels);
    }
  }
  if (ajoutes.size) {
    let ct = await z.file("[Content_Types].xml").async("string");
    if (!/Extension="png"/i.test(ct)) ct = ct.replace("<Default ", '<Default Extension="png" ContentType="image/png"/><Default ');
    if (!/Extension="jpeg"/i.test(ct)) ct = ct.replace("<Default ", '<Default Extension="jpeg" ContentType="image/jpeg"/><Default ');
    z.file("[Content_Types].xml", ct);
  }
  telecharger(await z.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), o.nom);
}
const vGy = (n) => (n || n === 0 ? String(Math.round(n * 100) / 100).replace(".", ",") : "");

// ───────── Word : compte rendu de fin de traitement ─────────
const TECH = { stereo: "Stéréotaxie", vmat: "VMAT", imrt: "IMRT", "3d": "3D conformationnelle" };
export async function wordCrFinRT(P, r, ctx, medecin, o) {
  const { dates } = datesSeancesRT(r, ctx), logo = await lireImage(o && o.logo);
  const deb = dates[0] || r.deb || "", fin = r.fin || dates[dates.length - 1] || finRT(r, ctx.feries) || "";
  const nb = parseInt(r.nb, 10) || "", dose = parseFloat(String(r.dose || "").replace(",", ".")), dpf = dose && nb ? Math.round((dose / nb) * 100) / 100 : "";
  if (o && o.modele !== false) {
    const sig = await lireImage(o.signature);
    try {
      return await remplirModele("modeles/cr-fin-rt.docx", { NOM: (P.nomF || "").toUpperCase(), PRENOM: P.prenom || "", DATE_NAISSANCE: dfrA(P.ddn), SEXE: P.sexe === "F" ? "Féminin" : P.sexe === "H" ? "Masculin" : "",
        MEDECIN_REFERENT: P.cor || "", ETABLISSEMENT: o.etabNom || r.hop || P.hop || "", DATE_DEBUT: dfrA(deb), DATE_FIN: dfrA(fin), DATE: dateLongue(ctx.aujourdhui),
        RESUME_CLINIQUE: r.note || P.notes || "", VISEE: r.intent === "curative" ? "Curative" : r.intent === "palliative" ? "Palliative" : "", TECHNIQUE: TECH[r.tech] || "", LOCALISATION: r.loc || "",
        DOSE: vGy(dose), DOSE_PAR_FRACTION: vGy(dpf), FRACTIONS: nb ? String(nb) : "", ACTE: r.acte || "", DIAGNOSTIC: [P.diag, P.diagP].filter(Boolean).join(" – "),
        MEDECIN: o.medecinModele || medecin, SPECIALITE: o.specialite || "" }, { logo, sig, vide: "AF", nom: "CR_fin_RT_" + nomFichier(P.nom) + ".docx" });
    } catch (e) { console.warn("Modèle du compte rendu indisponible, ancienne mise en page :", e); }
  }
  const AF = "à compléter par le médecin", sexe = P.sexe === "F" ? "Féminin" : P.sexe === "H" ? "Masculin" : "";
  const run = (t, o) => "<w:r><w:rPr>" + (o && o.b ? "<w:b/>" : "") + (o && o.i ? "<w:i/>" : "") + (o && o.c ? '<w:color w:val="' + o.c + '"/>' : "") + '<w:sz w:val="' + ((o && o.sz) || 22) + '"/></w:rPr><w:t xml:space="preserve">' + xml(t) + "</w:t></w:r>";
  const par = (runs, o) => "<w:p><w:pPr>" + (o && o.center ? '<w:jc w:val="center"/>' : "") + '<w:spacing w:before="' + ((o && o.av) || 0) + '" w:after="' + ((o && o.ap) != null ? o.ap : 80) + '"/>' + (o && o.puce ? '<w:ind w:left="360" w:hanging="220"/>' : "") + "</w:pPr>" + runs + "</w:p>";
  const titre = (t) => par(run(t, { b: true, sz: 24, c: "1B2F6E" }), { av: 220, ap: 100 });
  const ligne = (lib, v, af) => par(run("•  ", {}) + run(lib + " : ", { b: true }) + (v ? run(v) : run(af || AF, { i: true, c: "8A8A8A" })), { puce: true });
  const cellule = (contenu, w) => '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/></w:tcPr>' + contenu + "</w:tc>";
  const lt = (lib, v) => par(run(lib + " : ", { b: true }) + run(v || ""), { ap: 40 });
  const tableau = '<w:tbl><w:tblPr><w:tblW w:w="9300" w:type="dxa"/><w:tblBorders>' + ["top", "left", "bottom", "right", "insideH", "insideV"].map((b) => "<w:" + b + ' w:val="single" w:sz="6" w:color="8C8C8C"/>').join("") + '</w:tblBorders><w:tblCellMar><w:left w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="4650"/><w:gridCol w:w="4650"/></w:tblGrid>' +
    '<w:tr><w:trPr><w:shd w:fill="DCE6F2"/></w:trPr>' + cellule(par(run("Informations patient", { b: true })), 4650) + cellule(par(run("Informations séjour", { b: true })), 4650) + "</w:tr>" +
    "<w:tr>" + cellule(lt("Nom et prénom", (P.nomF || "").toUpperCase() + " " + (P.prenom || "")) + lt("Date de naissance", dfrA(P.ddn)) + lt("Sexe", sexe) + lt("Médecin référent", P.cor || ""), 4650) +
    cellule(lt("Établissement", r.hop || P.hop || "") + lt("Date d'entrée (1re séance)", dfrA(deb)) + lt("Date de sortie (dernière séance)", dfrA(fin)), 4650) + "</w:tr></w:tbl>";
  const corps =
    par(run("COMPTE-RENDU DE FIN DE TRAITEMENT DE RADIOTHÉRAPIE", { b: true, sz: 30, c: "1B2F6E" }), { center: true, ap: 240 }) +
    titre("1. Identification du patient") + tableau +
    titre("2. Indication clinique et objectifs") +
    ligne("Résumé clinique", r.note || P.notes || "") +
    ligne("Visée du traitement", r.intent === "curative" ? "Curative" : r.intent === "palliative" ? "Palliative" : "") +
    titre("3. Modalités et technique de radiothérapie") +
    ligne("Technique utilisée", TECH[r.tech] || "") +
    ligne("Localisation", r.loc || "") +
    ligne("Dose prescrite", dose ? String(dose).replace(".", ",") + " Gy sur le volume ……………" : "") +
    ligne("Dose par fraction", dpf ? String(dpf).replace(".", ",") + " Gy" : "") +
    ligne("Nombre de fractions", nb ? String(nb) : "") +
    titre("4. Calendrier du traitement") +
    ligne("Date de début", dfrA(deb)) + ligne("Date de fin", dfrA(fin)) +
    titre("5. Tolérance et toxicités") + ligne("Toxicités observées", "") +
    titre("6. Conduite à tenir et suivi") + ligne("Prescriptions de sortie", "") + ligne("Prochain rendez-vous de consultation", "") + ligne("Bilan d'imagerie de contrôle prévu", "") +
    par(run("Médecin responsable :", { b: true }), { av: 360 }) + par(run(medecin)) + par(run("Radiothérapie oncologique")) + par(run("Signature et tampon :", { b: true }), { av: 200, ap: 900 });
  await docx(corps, "CR_fin_RT_" + nomFichier(P.nom) + ".docx", { logo });
}

// ───────── Word : pli confidentiel au médecin conseil (3 pages : lettre, compte rendu médical, ordonnance) ─────────
// Toute information absente du dossier est remplacée par « À REMPLIR » (surligné en jaune).
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const dateLongue = (d) => { const x = new Date(d + "T12:00:00"); return x.getDate() + (x.getDate() === 1 ? "er" : "") + " " + MOIS[x.getMonth()] + " " + x.getFullYear(); };
// Durée : nombre de jours ouvrés nécessaires (1 jour sur 2 en stéréotaxie) ramené en semaines de 5 jours
export function dureeSemainesRT(r) {
  const nb = parseInt(r.nb, 10); if (!(nb > 0)) return "";
  const jours = r.ryt === "2" ? nb * 2 - 1 : nb, sem = Math.ceil(jours / 5);
  return sem + " semaine" + (sem > 1 ? "s" : "") + " (" + nb + " séance" + (nb > 1 ? "s" : "") + (r.ryt === "2" ? ", 1 jour sur 2" : "") + ")";
}
export async function wordPliRT(P, r, ctx, o) {
  const [logo, sig] = await Promise.all([lireImage(o.logo), lireImage(o.signature)]);
  if (o.modele !== false) {
    const acteM = (r.acte || "") + (r.acte && r.vmat && !/vmat/i.test(r.acte) ? " + VMAT" : ""), resumeM = (P.notes || r.note || "").trim().replace(/\s*[.;]\s*$/, "");
    try {
      return await remplirModele("modeles/pli-confidentiel.docx", { CIVILITE: P.sexe === "F" ? "Madame" : P.sexe === "H" ? "Monsieur" : "", NOM: (P.nomF || "").toUpperCase(), PRENOM: P.prenom || "",
        DATE: dateLongue(ctx.aujourdhui), MEDECIN: o.medecinModele || o.medecin || "", SPECIALITE: o.specialite || "", ETABLISSEMENT: o.etabNom || "", DIAGNOSTIC: [P.diag, P.diagP].filter(Boolean).join(" – "),
        ACTE: acteM, DUREE: dureeSemainesRT(r), RESUME_CLINIQUE: resumeM, DATE_NAISSANCE: dfrA(P.ddn), MEDECIN_REFERENT: P.cor || "" }, { logo, sig, vide: "AR", nom: "Pli_confidentiel_RT_" + nomFichier(P.nom) + ".docx" });
    } catch (e) { console.warn("Modèle du pli confidentiel indisponible, ancienne mise en page :", e); }
  }
  const AR = "À REMPLIR", jour = dateLongue(ctx.aujourdhui);
  const run = (t, f) => "<w:r><w:rPr>" + (f && f.b ? "<w:b/>" : "") + (f && f.i ? "<w:i/>" : "") + (f && f.u ? '<w:u w:val="single"/>' : "") + (f && f.c ? '<w:color w:val="' + f.c + '"/>' : "") + (f && f.hl ? '<w:highlight w:val="yellow"/>' : "") + '<w:sz w:val="' + ((f && f.sz) || 22) + '"/></w:rPr><w:t xml:space="preserve">' + xml(t) + "</w:t></w:r>";
  const v = (x, f) => (x ? run(x, f) : run(AR, Object.assign({}, f, { b: true, hl: true }))); // valeur du dossier ou « À REMPLIR »
  const par = (runs, f) => "<w:p><w:pPr>" + (f && f.jc ? '<w:jc w:val="' + f.jc + '"/>' : "") + '<w:spacing w:before="' + ((f && f.av) || 0) + '" w:after="' + ((f && f.ap) != null ? f.ap : 120) + '" w:line="' + ((f && f.ligne) || 276) + '" w:lineRule="auto"/>' + (f && f.pb ? '<w:pageBreakBefore/>' : "") + (f && f.bord ? '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="9AA3B5"/></w:pBdr>' : "") + "</w:pPr>" + runs + "</w:p>";
  const vide = (n) => par("", { ap: n || 120 });
  const civ = P.sexe === "F" ? "Madame" : P.sexe === "H" ? "Monsieur" : "", nom = (P.nomF || "").toUpperCase(), pre = P.prenom || "";
  const patient = (f) => v(civ, f) + run(" ", f) + v(nom, f) + run(" ", f) + v(pre, f);
  const acte = (r.acte || "") + (r.acte && r.vmat && !/vmat/i.test(r.acte) ? " + VMAT" : "");
  const diag = [P.diag, P.diagP].filter(Boolean).join(" – "), med = o.medecin || "", lieu = o.etabNom || "";
  const titre = (t) => par(run(t, { b: true, sz: 30, c: "1B2F6E" }), { jc: "center", av: 360, ap: 360 });
  const rubrique = (t) => par(run(t, { b: true, sz: 22, c: "1B2F6E" }), { av: 200, ap: 80, bord: true });
  const date = (maj) => par(run((maj ? "CASABLANCA" : "Casablanca") + ", le " + jour), { jc: "right", ap: 240 });
  const signature = () => par(run("Cachet et signature du médecin", { b: true }), { jc: "right", av: 480, ap: 60 }) + par(v(med, { b: true }), { jc: "right", ap: 60 }) +
    (sig ? par(dessinW("rIdSig", taille(sig, 5 * CM, 2.2 * CM), ++nSig, "Signature"), { jc: "right" }) : vide(900));
  const resume = (P.notes || "").trim(); let nSig = 200;
  // Page 1 – lettre au médecin conseil
  let c = titre("PLI CONFIDENTIEL") + date(false) +
    par(run("Monsieur le Médecin Conseil,")) + par(run("Cher(e) Confrère,"), { ap: 240 }) +
    par(run("Je vous prie de bien vouloir trouver ci-joint les renseignements cliniques concernant :")) +
    par(patient({ b: true, sz: 24 }), { jc: "center", av: 120, ap: 120 }) +
    par(run("ayant droit à la couverture médicale par l’organisme dont vous assurez le conseil.")) +
    par(run("Je vous écris pour information et en vue des démarches administratives nécessaires à une prise en charge ou à un accord de principe.")) +
    par(run("Avec mes remerciements, veuillez croire, Cher(e) Confrère, à l’expression de mes salutations distinguées."), { ap: 200 }) +
    rubrique("RENSEIGNEMENTS CLINIQUES") + par((resume ? run(resume.replace(/\s*[.;]?\s*$/, "") + ", ") : v("", {}) + run(" ")) + run("nécessitant une radiothérapie ") + v(acte, { b: !!acte }) + run(".")) +
    rubrique("TRAITEMENT PROPOSÉ") + par((acte ? run("Radiothérapie ", { b: true }) : "") + v(acte, { b: true })) +
    rubrique("DURÉE PRÉVISIBLE DU TRAITEMENT") + par(v(dureeSemainesRT(r))) +
    par(run("Observations : ", { b: true }) + run("Des modifications du traitement pourraient survenir en fonction des évaluations cliniques et de l’évolution de la maladie.", { i: true }), { av: 240 }) +
    signature();
  // Page 2 – compte rendu médical
  c += par("", { pb: true, ap: 0 }) + date(true) + titre("COMPTE RENDU MÉDICAL") +
    par(run("Je soussigné, ") + v(med) + run(", certifie que ") + patient({ b: true }) + run(" est actuellement suivi(e) au sein de ") + v(lieu) + run(" pour la prise en charge d’un ") + v(diag) + run(", nécessitant un traitement par ") + (acte ? run("Radiothérapie ", { b: true }) : "") + v(acte, { b: !!acte }) + run(".")) +
    par(run("Vous trouverez ci-dessous le résumé médical relatif à la prise en charge du patient :")) +
    rubrique("RÉSUMÉ CLINIQUE ET DÉROULEMENT DU TRAITEMENT") + (resume ? resume.split(/\n+/).map((l) => par(run(l))).join("") : par(v(""))) +
    par(run("Je reste à votre disposition pour toute information complémentaire."), { av: 200 }) +
    par(run("Veuillez agréer, Monsieur le Médecin Conseil, l’expression de mes salutations distinguées.")) + signature();
  // Page 3 – ordonnance
  c += par("", { pb: true, ap: 0 }) + date(true) + titre("ORDONNANCE MÉDICALE") +
    par(run("Patient(e) : ", { b: true }) + patient({ b: true }), { ap: 360 }) +
    par((acte ? run("Radiothérapie ", { b: true, sz: 26 }) : "") + v(acte, { b: true, sz: 26 }), { jc: "center", av: 240, ap: 240 }) +
    par(run("Date de début : ", { b: true }) + run("Dès que possible"), { ap: 240 }) + signature();
  await docx(c, "Pli_confidentiel_RT_" + nomFichier(P.nom) + ".docx", { logo, sig });
}
