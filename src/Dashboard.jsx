import React, { useMemo, useState } from "react";
import { exportPDF as defaultExportPDF, toAr as defaultToAr } from "./utils";
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import EtatComptabilite from "./EtatComptabilite";

export default function Dashboard({ rows = [], totalMasse = 0, exportPDF = defaultExportPDF, toAr = defaultToAr }) {
  const navigate = useNavigate();
  
  // Récupérer rows depuis localStorage si vide
  let localRows = rows;
  if ((!rows || rows.length === 0) && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('rows');
      localRows = raw ? JSON.parse(raw) : [];
    } catch (e) {
      localRows = [];
    }
  }
  const displayRows = localRows || [];
  const displayTotal = totalMasse || displayRows.reduce((s, r) => s + (r.net || 0), 0);

  // Recherche et filtres
  const [query, setQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const months = useMemo(() => {
    return Array.from(new Set(displayRows.map(r => r.mois).filter(Boolean)));
  }, [displayRows]);
  const years = useMemo(() => {
    return Array.from(new Set(displayRows.map(r => r.annee).filter(Boolean)));
  }, [displayRows]);

  const filteredRows = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return displayRows.filter(r => {
      if (q) {
        const inName = (`${r.nom || ""} ${r.prenom || ""}`).toLowerCase().includes(q);
        const inPoste = (r.poste || "").toLowerCase().includes(q);
        const inPeriod = `${r.mois || ""}/${r.annee || ""}`.toLowerCase().includes(q);
        if (!inName && !inPoste && !inPeriod) return false;
      }
      if (filterMonth && r.mois !== filterMonth) return false;
      if (filterYear && r.annee !== filterYear) return false;
      return true;
    });
  }, [displayRows, query, filterMonth, filterYear]);

  const totalCount = displayRows.length;
  const filteredCount = filteredRows.length;
  const totalNet = displayRows.reduce((s, r) => s + (r.net || 0), 0);
  const filteredNet = filteredRows.reduce((s, r) => s + (r.net || 0), 0);

  // 📌 Fonction Export Excel (état comptable)
  const exportExcel = () => {
    if (filteredRows.length === 0) {
      alert("Aucune fiche à exporter !");
      return;
    }

    // Transformer les données pour Excel
    const exportData = filteredRows.map(r => ({
      Employé: `${r.nom} ${r.prenom}`,
      Poste: r.poste,
      Mois: r.mois,
      Année: r.annee,
      Brut: r.brut,
      CNAPS: r.cnaps,
      OSTIE: r.ostie,
      IRSA: r.irsa,
      Net: r.net,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "État de paie");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `etat_paie_${filterMonth || "tous"}_${filterYear || "annees"}.xlsx`);
  };

  return (
    <div className="section page-with-bg">
      <div className="flex items-center justify-between mb-3">
        <div className="space-x-2">
          <Link to="/" className="btn btn-primary">Accueil</Link>
          <Link to="/fiche" className="btn btn-primary">Aller au formulaire</Link>
          <Link to="/EtatComptabilite" className="btn btn-primary">Etat du comptable</Link>
          <button className="btn" onClick={() => { localStorage.removeItem('isLoggedIn'); localStorage.removeItem('currentUser'); navigate('/login'); }}>Déconnexion</button>
        </div>
        {/* 📌 Bouton Export Excel ajouté ici */}
        <button className="btn btn-success" onClick={exportExcel}>Exporter état Excel</button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="h2">Dashboard des fiches</div>
      </div>

      {/* Summary board */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="section"><div className="font-medium">Total fiches</div><div className="text-lg font-semibold">{totalCount}</div></div>
        <div className="section"><div className="font-medium">Fiches affichées</div><div className="text-lg font-semibold">{filteredCount}</div></div>
        <div className="section"><div className="font-medium">Net total affiché</div><div className="text-lg font-semibold">{toAr(filteredNet)} Ar</div></div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-3">
        <input
          placeholder="Rechercher par nom, poste, période..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="input"
        />
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="input">
          <option value="">Tous les mois</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="input">
          <option value="">Toutes les années</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="btn" onClick={() => { setQuery(""); setFilterMonth(""); setFilterYear(""); }}>Réinitialiser</button>
      </div>
      
      {/* Table */}
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
            {filteredRows.map((r, i) => (
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
                  <button className="btn btn-success" onClick={() => exportPDF(r)}>Export</button>
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center text-gray-500 py-6">
                  Aucune fiche pour l’instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Barèmes et taux simplifiés à adapter selon votre convention/actualités (CNAPS, OSTIE, IRSA).
      </p>
    </div>
  );
}
