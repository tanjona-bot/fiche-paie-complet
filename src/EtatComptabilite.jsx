import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function EtatComptabilite() {
  // 🔹 Charger directement depuis localStorage
  let rows = [];
  try {
    const raw = localStorage.getItem("rows");
    rows = raw ? JSON.parse(raw) : [];
  } catch (e) {
    rows = [];
  }

  const totalBrut = rows.reduce((sum, r) => sum + (r.brut || 0), 0);
  const totalCnaps = rows.reduce((sum, r) => sum + (r.cnaps || 0), 0);
  const totalOstie = rows.reduce((sum, r) => sum + (r.ostie || 0), 0);
  const totalIrsa = rows.reduce((sum, r) => sum + (r.irsa || 0), 0);
  const totalNet = rows.reduce((sum, r) => sum + (r.net || 0), 0);

  // --- EXPORT PDF ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("État de paie - Comptabilité", 14, 15);

    const tableColumn = ["Employé", "Brut", "CNAPS", "OSTIE", "IRSA", "Net payé"];
    const tableRows = [];

    rows.forEach(r => {
      tableRows.push([
        `${r.nom} ${r.prenom}`,
        r.brut.toLocaleString("fr-FR").replace(/\u202F/g, " "),
        r.cnaps.toLocaleString("fr-FR").replace(/\u202F/g, " "),
        r.ostie.toLocaleString("fr-FR").replace(/\u202F/g, " "),
        r.irsa.toLocaleString("fr-FR").replace(/\u202F/g, " "),
        r.net.toLocaleString("fr-FR").replace(/\u202F/g, " "),
      ]);
    });

    tableRows.push([
      "TOTAL",
      totalBrut.toLocaleString("fr-FR").replace(/\u202F/g, " "),
      totalCnaps.toLocaleString("fr-FR").replace(/\u202F/g, " "),
      totalOstie.toLocaleString("fr-FR").replace(/\u202F/g, " "),
      totalIrsa.toLocaleString("fr-FR").replace(/\u202F/g, " "),
      totalNet.toLocaleString("fr-FR").replace(/\u202F/g, " "),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    doc.save("etat_comptabilite.pdf");
  };

  // --- EXPORT EXCEL ---
  const exportExcel = () => {
    const worksheetData = [
      ["Employé", "Brut", "CNAPS", "OSTIE", "IRSA", "Net payé"],
      ...rows.map(r => [
        `${r.nom} ${r.prenom}`,
        r.brut,
        r.cnaps,
        r.ostie,
        r.irsa,
        r.net,
      ]),
      ["TOTAL", totalBrut, totalCnaps, totalOstie, totalIrsa, totalNet],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "État de paie");

    XLSX.writeFile(workbook, "etat_comptabilite.xlsx");
  };

  return (
    <div className="section">
      <h2 className="h2 mb-3">État de paie (Comptabilité)</h2>

      <div className="overflow-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Employé</th>
              <th>Brut</th>
              <th>CNAPS</th>
              <th>OSTIE</th>
              <th>IRSA</th>
              <th>Net payé</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.nom} {r.prenom}</td>
                <td>{r.brut.toLocaleString("fr-FR")} Ar</td>
                <td>{r.cnaps.toLocaleString("fr-FR")} Ar</td>
                <td>{r.ostie.toLocaleString("fr-FR")} Ar</td>
                <td>{r.irsa.toLocaleString("fr-FR")} Ar</td>
                <td className="font-semibold">{r.net.toLocaleString("fr-FR")} Ar</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-6">
                  Aucune fiche enregistrée.
                </td>
              </tr>
            )}
            {rows.length > 0 && (
              <tr className="font-bold bg-gray-100">
                <td>Total</td>
                <td>{totalBrut.toLocaleString("fr-FR")} Ar</td>
                <td>{totalCnaps.toLocaleString("fr-FR")} Ar</td>
                <td>{totalOstie.toLocaleString("fr-FR")} Ar</td>
                <td>{totalIrsa.toLocaleString("fr-FR")} Ar</td>
                <td>{totalNet.toLocaleString("fr-FR")} Ar</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="flex gap-3 mt-3">
          <button onClick={exportPDF} className="btn btn-success">
            Exporter en PDF
          </button>
          <button onClick={exportExcel} className="btn btn-primary">
            Exporter en Excel
          </button>
        </div>
      )}
    </div>
  );
}
