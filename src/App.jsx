import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import './styles/style.css';
import './styles/global.css';


const toAr = n => (Math.round(Number(n) || 0)).toLocaleString("fr-FR").replace(/\u202F/g, " ");

export default function App() {
  const navigate = useNavigate();
  const [logoDataUrl, setLogoDataUrl] = useState(() => {
    try {
      return localStorage.getItem('logoDataUrl') || null;
    } catch (e) {
      return null;
    }
  });
  const [logoColor, setLogoColor] = useState('#1976d2'); // Couleur par défaut

  const [rows, setRows] = useState(() => {
    try {
      const raw = localStorage.getItem('rows');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [f, setF] = useState({
    employeur_nom: "", employeur_adresse: "", employeur_nif: "",
    employeur_stat: "", employeur_cnaps: "",
    nom: "", prenom: "", cin: "", matricule: "", poste: "", date_embauche: "",
    mois: "", annee: "",
    salaire_base: "",
    heures_sup: "",
    prime: "",           // <-- séparé
    indemnite: "",       // <-- séparé
    avantages: "",
    retenues: "",
    nb_enfants: ""
  });

  const hints = {
    salaire_base: "Montant mensuel de base (Ar). Ex: 400000",
    heures_sup: "Montant total des heures sup (Ar). Ex: 25000",
    prime: "Primes (transport, rendement, assiduité...)",        // séparé
    indemnite: "Indemnités (logement, panier, déplacement...)",  // séparé
    avantages: "Avantages en nature (logement, voiture, téléphone...)",
    retenues: "Retenues (avances, prêts, pénalités...)",
    nb_enfants: "Nombre d'enfants à charge (max 4 pour abattement IRSA)"
  };

  const calc = useMemo(() => {
    const salaire_base = +f.salaire_base || 0;
    const heures_sup = +f.heures_sup || 0;
    const prime = +f.prime || 0;
    const indemnite = +f.indemnite || 0;
    const avantages = +f.avantages || 0;
    const retenues = +f.retenues || 0;
    const nb_enfants = Math.min(+f.nb_enfants || 0, 4);

    const brut = salaire_base + heures_sup + prime + indemnite + avantages;

    const cnaps = brut * 0.01;
    const ostie = brut * 0.01;

    const abattement = nb_enfants * 2000;
    let baseIrsa = Math.max(brut - abattement, 0);
    let irsa = 0;
    if (baseIrsa > 600000) { irsa += (baseIrsa - 600000) * 0.20; baseIrsa = 600000; }
    if (baseIrsa > 500000) { irsa += (baseIrsa - 500000) * 0.15; baseIrsa = 500000; }
    if (baseIrsa > 400000) { irsa += (baseIrsa - 400000) * 0.10; baseIrsa = 400000; }
    if (baseIrsa > 350000) { irsa += (baseIrsa - 350000) * 0.05; }
    irsa = Math.max(irsa, 3000);

    const net = brut - cnaps - ostie - irsa - retenues;
    return { brut, cnaps, ostie, irsa, net, abattement };
  }, [f]);

  const reset = () =>
    setF({
      employeur_nom: "", employeur_adresse: "", employeur_nif: "",
      employeur_stat: "", employeur_cnaps: "",
      nom: "", prenom: "", cin: "", matricule: "", poste: "", date_embauche: "",
      mois: "", annee: "",
      salaire_base: "", heures_sup: "", prime: "", indemnite: "", avantages: "", retenues: "", nb_enfants: ""
    });

  const addRow = () => {
    const r = { ...f, ...calc };
    setRows(prev => [r, ...prev]);
    reset();
  };

  // Persister rows et logoDataUrl dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rows', JSON.stringify(rows));
    } catch (e) {
      // ignore
    }
  }, [rows]);

  useEffect(() => {
    try {
      if (logoDataUrl) localStorage.setItem('logoDataUrl', logoDataUrl);
      else localStorage.removeItem('logoDataUrl');
    } catch (e) {}
  }, [logoDataUrl]);

  const totalMasse = rows.reduce((s, r) => s + (r.net || 0), 0);

  const exportPDF = (r) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  const marginY = 36;

  // ======= LOGO =======
  if (logoDataUrl) {
    // Affiche le logo en haut à gauche
    doc.addImage(logoDataUrl, "PNG", marginX, marginY - 20, 50, 50);
    // Cercle autour du logo avec couleur dominante
    const mainColor = logoColor || '#1976d2';
    doc.setLineWidth(2);
    if (mainColor.startsWith('rgb')) {
      const rgb = mainColor.match(/\d+/g);
      doc.setDrawColor(Number(rgb[0]), Number(rgb[1]), Number(rgb[2]));
    } else {
      doc.setDrawColor(mainColor);
    }
    doc.circle(marginX + 25, marginY + 5, 25);
  }

  // ======= ENTÊTE =======
  const headerOffset = 50; // Décalage supplémentaire pour laisser la place au logo
  doc.setFontSize(14);
  doc.text("FICHE DE PAIE", 297, marginY + headerOffset, { align: "center" });

  doc.setFontSize(9);
  doc.text(`Période du : 01 ${r.mois || "--"} au 31 ${r.mois || "--"} ${r.annee || "--"}`, marginX, marginY + 20 + headerOffset);
  doc.text(`N° CNAPS : ${r.employeur_cnaps || "-"}`, marginX, marginY + 40 + headerOffset);

  // Infos employé
  doc.text(`Nom & Prénom : ${r.nom} ${r.prenom}`, marginX, marginY + 60 + headerOffset);
  doc.text(`N° Matricule : ${r.matricule || "-"}`, marginX, marginY + 80 + headerOffset);
  doc.text(`Poste : ${r.poste || "-"}`, marginX, marginY + 100 + headerOffset);
  doc.text(`Date embauche : ${r.date_embauche || "-"}`, marginX, marginY + 120 + headerOffset);

  // Infos employeur
  doc.text(r.employeur_nom || "Société", 350, marginY + 20 + headerOffset);
  doc.text(`Adresse : ${r.employeur_adresse || "-"}`, 350, marginY + 40 + headerOffset);
  doc.text(`RCS : ${r.employeur_stat || "-"}`, 350, marginY + 60 + headerOffset);
  doc.text(`NIF : ${r.employeur_nif || "-"}`, 350, marginY + 80 + headerOffset);

  // ======= TABLEAU =======
  autoTable(doc, {
    startY: marginY + 150 + headerOffset,
    theme: "grid",
    styles: { fontSize: 8, halign: "right" },
    headStyles: {
      fillColor: (logoColor.startsWith('rgb') ? logoColor.match(/\d+/g).map(Number) : logoColor)
    },
    head: [[
      "Code", "Libellé de la rubrique",
      "Base", "Taux", "Montant (Salarié)",
      "Base", "Taux", "Montant (Employeur)"
    ]],
    body: [
      ["1001", "Salaire de base", toAr(r.salaire_base), "", toAr(r.salaire_base), "", "", ""],
      ["2001", "Heures sup.", toAr(r.heures_sup), "", toAr(r.heures_sup), "", "", ""],
      ["2002", "Primes", toAr(r.prime), "", toAr(r.prime), "", "", ""],
      ["2003", "Indemnités", toAr(r.indemnite), "", toAr(r.indemnite), "", "", ""],
      ["2004", "Avantages", toAr(r.avantages), "", toAr(r.avantages), "", "", ""],
      ["BRUT", "SALAIRE BRUT", "", "", toAr(r.brut), "", "", ""],

      ["ST01", "OSTIE", toAr(r.brut), "1%", `-${toAr(r.ostie)}`, toAr(r.brut), "1%", toAr(r.ostie)],
      ["RT01", "CNAPS", toAr(r.brut), "1%", `-${toAr(r.cnaps)}`, toAr(r.brut), "1%", toAr(r.cnaps)],

      ["IRSA", "Impôt sur salaire", "", "", `-${toAr(r.irsa)}`, "", "", ""],
      ["RET", "Retenues diverses", "", "", `-${toAr(r.retenues)}`, "", "", ""],

      ["NET", "NET A PAYER", "", "", toAr(r.net), "", "", ""],
    ]
  });

  // ======= BAS DE PAGE =======
  const y = doc.lastAutoTable.finalY + 40;
  doc.setFontSize(10);
  doc.text(`NET À PAYER : ${toAr(r.net)} Ar`, marginX, y);

  doc.text("Domiciliation : ..................", marginX, y + 20);
  doc.text("IBAN : ..................", marginX, y + 40);
  doc.text("Bénéficiaire : ..................", marginX, y + 60);

  doc.text("L’Employeur", marginX, y + 100);
  doc.text("L’Employé", 500, y + 100);

  doc.save(`fiche_paie_${(r.nom||'')}_${(r.prenom||'')}.pdf`);
};


  const onLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoDataUrl(null);
      setLogoColor('#1976d2');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result);
      // Extraire la couleur dominante
      const img = new window.Image();
      img.src = reader.result;
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        setLogoColor(`rgb(${r},${g},${b})`);
      };
    };
    reader.readAsDataURL(file);
  };

  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 page-with-bg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bulletin de paie — Madagascar</h1>
        <div className="space-x-2">
          <Link to="/Dashboard" className="btn btn-secondary">Voir Dashboard</Link>
          <Link to="/" className="text-sm text-gray-600">Accueil</Link>
          <button className="btn" onClick={() => { localStorage.removeItem('isLoggedIn'); localStorage.removeItem('currentUser'); navigate('/login'); }}>Déconnexion</button>
        </div>
      </div>

      {/* UPLOAD LOGO */}
      <div className="section">
        <div className="flex items-center gap-4">
          <div className="h2">Logo de l’entreprise</div>
          <input type="file" accept="image/*" onChange={onLogoChange} />
          {logoDataUrl && (
            <img
              src={logoDataUrl}
              alt="Logo preview"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd' }}
            />
          )}
        </div>
      </div>

      {/* FORMULAIRE */}
      

      <div className="grid md:grid-cols-2 gap-4">
        <div className="section space-y-3">
          <div className="h2">Informations Employeur</div>
          <div><label>Raison sociale</label><input value={f.employeur_nom} onChange={set('employeur_nom')} /></div>
          <div><label>Adresse</label><input value={f.employeur_adresse} onChange={set('employeur_adresse')} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label>NIF</label><input value={f.employeur_nif} onChange={set('employeur_nif')} /></div>
            <div><label>STAT</label><input value={f.employeur_stat} onChange={set('employeur_stat')} /></div>
            <div><label>CNAPS</label><input value={f.employeur_cnaps} onChange={set('employeur_cnaps')} /></div>
          </div>
        </div>

        <div className="section space-y-3">
          <div className="h2">Informations Employé</div>
          <div className="grid grid-cols-2 gap-3">
            <div class="input-box"><label>Nom</label><input value={f.nom} onChange={set('nom')} /></div>
            <div class="input-box"><label>Prénom</label><input value={f.prenom} onChange={set('prenom')} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label>CIN</label><input value={f.cin} onChange={set('cin')} /></div>
            <div><label>Matricule</label><input value={f.matricule} onChange={set('matricule')} /></div>
            <div><label>Poste</label><input value={f.poste} onChange={set('poste')} /></div>
          </div>
          <div><label>Date d’embauche</label><input type="date" value={f.date_embauche} onChange={set('date_embauche')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label>Mois</label><input placeholder="Ex: 08" value={f.mois} onChange={set('mois')} /></div>
            <div><label>Année</label><input placeholder="Ex: 2025" value={f.annee} onChange={set('annee')} /></div>
          </div>
        </div>

        <div className="section space-y-3 md:col-span-2">
          <div className="h2">Salaire & Composants</div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label>Salaire de base (Ar)</label>
              <input type="number" value={f.salaire_base} onChange={set('salaire_base')} placeholder={hints.salaire_base} />
            </div>
            <div>
              <label>Heures supplémentaires (montant, Ar)</label>
              <input type="number" value={f.heures_sup} onChange={set('heures_sup')} placeholder={hints.heures_sup} />
            </div>
            <div>
              <label>Primes (Ar)</label>
              <input type="number" value={f.prime} onChange={set('prime')} placeholder={hints.prime} />
            </div>
            <div>
              <label>Indemnités (Ar)</label>
              <input type="number" value={f.indemnite} onChange={set('indemnite')} placeholder={hints.indemnite} />
            </div>
            <div>
              <label>Avantages en nature (Ar)</label>
              <input type="number" value={f.avantages} onChange={set('avantages')} placeholder={hints.avantages} />
            </div>
            <div>
              <label>Retenues (Ar)</label>
              <input type="number" value={f.retenues} onChange={set('retenues')} placeholder={hints.retenues} />
            </div>
            <div>
              <label>Nombre d’enfants</label>
              <input type="number" value={f.nb_enfants} onChange={set('nb_enfants')} placeholder={hints.nb_enfants} />
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-3 mt-3 text-sm">
            <div className="section"><div className="font-medium">Brut</div><div>{toAr(calc.brut)} Ar</div></div>
            <div className="section"><div className="font-medium">CNAPS (1%)</div><div>- {toAr(calc.cnaps)} Ar</div></div>
            <div className="section"><div className="font-medium">OSTIE (1%)</div><div>- {toAr(calc.ostie)} Ar</div></div>
            <div className="section"><div className="font-medium">IRSA</div><div>- {toAr(calc.irsa)} Ar</div></div>
            <div className="section"><div className="font-medium">Net à payer</div><div className="font-semibold">{toAr(calc.net)} Ar</div></div>
          </div>

          <div className="flex gap-3 mt-4">
            <button className="btn btn-primary" onClick={addRow}>Ajouter la fiche</button>
          </div>
        </div>
      </div>

      {/* DASHBOARD */}
      <div className="section">
        <div className="flex items-center justify-between mb-3">
          <div className="h2">Dashboard des fiches</div>
          <div className="text-sm font-semibold">Masse salariale nette : {toAr(totalMasse)} Ar</div>
        </div>
        <div className="overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Poste</th>
                <th>Période</th>
                <th>Brut</th>
                <th>CNAPS</th>
                <th>OSTIE</th>
                <th>IRSA</th>
                <th>Net</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.nom} {r.prenom}</td>
                  <td>{r.poste}</td>
                  <td>{r.mois}/{r.annee}</td>
                  <td>{toAr(r.brut)} Ar</td>
                  <td>{toAr(r.cnaps)} Ar</td>
                  <td>{toAr(r.ostie)} Ar</td>
                  <td>{toAr(r.irsa)} Ar</td>
                  <td className="font-semibold">{toAr(r.net)} Ar</td>
                  <td>
                    <button className="btn btn-success" onClick={() => exportPDF(r)}>
                      Export
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan="9" className="text-center text-gray-500 py-6">Aucune fiche pour l’instant.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Barèmes et taux simplifiés à adapter selon votre convention/actualités (CNAPS, OSTIE, IRSA).
      </p>
    </div>
  );
}

