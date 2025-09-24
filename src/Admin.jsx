import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Admin() {
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('accounts');
      setAccounts(raw ? JSON.parse(raw) : []);
    } catch (e) { setAccounts([]); }
  }, []);

  const removeAccount = (email) => {
    const filtered = accounts.filter(a => a.email !== email);
    localStorage.setItem('accounts', JSON.stringify(filtered));
    setAccounts(filtered);
  };

  const toggleAdmin = (email) => {
    const updated = accounts.map(a => {
      if (a.email === email) return { ...a, isAdmin: !a.isAdmin };
      return a;
    });
    localStorage.setItem('accounts', JSON.stringify(updated));
    setAccounts(updated);
  };

  const clearAll = () => {
    if (!confirm('Supprimer tous les comptes ?')) return;
    localStorage.removeItem('accounts');
    setAccounts([]);
  };

  return (
    <div style={{padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>Admin — comptes enregistrés</h2>
        <div>
          <Link to="/" style={{marginRight:10}}>Accueil</Link>
          <button onClick={()=>navigate('/login')}>Login</button>
        </div>
      </div>

      <div style={{marginTop:20}}>
        <button onClick={clearAll} style={{marginBottom:12}}>Supprimer tous les comptes</button>
        <table border={1} cellPadding={8} style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr><th>Email</th><th>Prénom</th><th>Nom</th><th>Admin</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {accounts.map(a=> (
              <tr key={a.email}>
                <td>{a.email}</td>
                <td>{a.first}</td>
                <td>{a.last}</td>
                <td style={{textAlign:'center'}}>{a.isAdmin ? '✅' : ''}</td>
                <td style={{display:'flex',gap:8}}>
                  <button onClick={()=>toggleAdmin(a.email)}>{a.isAdmin ? 'Démouvoir' : 'Promouvoir'}</button>
                  <button onClick={()=>removeAccount(a.email)}>Supprimer</button>
                </td>
              </tr>
            ))}
            {accounts.length===0 && (
              <tr><td colSpan={5} style={{textAlign:'center'}}>Aucun compte</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
