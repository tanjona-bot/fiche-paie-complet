import { useRows } from "../RowsContext";

export default function Dashboard() {
  const { rows } = useRows(); // <-- récupère la liste

  return (
    <div>
      <h2>Dashboard des fiches</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Salaire Brut</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.nom}</td>
              <td>{r.prenom}</td>
              <td>{r.brut}</td>
              <td>{r.net}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan="4">Aucune fiche enregistrée</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
