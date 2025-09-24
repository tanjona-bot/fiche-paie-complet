import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Verify() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    const pending = localStorage.getItem('pendingVerification');
    if (pending) setEmail(pending);
  },[]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const res = await fetch(API_BASE + '/api/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code })
      });
      const body = await res.json();
      if (body.ok) {
        // mark account verified locally
        const raw = localStorage.getItem('accounts');
        const accounts = raw ? JSON.parse(raw) : [];
        const idx = accounts.findIndex(a => a.email === email);
        if (idx !== -1) {
          accounts[idx].isVerified = true;
          localStorage.setItem('accounts', JSON.stringify(accounts));
        }
        localStorage.removeItem('pendingVerification');
        alert('Email vérifié — vous pouvez maintenant vous connecter');
        navigate('/login');
        return;
      }
      alert(body.error || 'Code invalide');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la vérification');
    }
  };

  const resendCode = async () => {
    if (!email) return alert('Entrez votre email pour renvoyer le code');
    try {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const res = await fetch(API_BASE + '/api/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      });
      const body = await res.json();
      if (body.code) {
        alert('Code renvoyé (dev): ' + body.code);
      } else {
        alert('Code renvoyé à votre email');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur en renvoyant le code');
    }
  };

  return (
    <div style={{padding:20, display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}>
      <form onSubmit={handleVerify} style={{width:320}}>
        <h3>Vérification d'email</h3>
        <label style={{display:'block',marginBottom:8}}>Email
          <input value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%'}} />
        </label>
        <label style={{display:'block',marginBottom:8}}>Code de vérification (6 chiffres)
          <input value={code} onChange={e=>setCode(e.target.value)} required style={{width:'100%'}} />
        </label>
        <div style={{display:'flex',gap:8}}>
          <button type="submit">Vérifier</button>
          <button type="button" onClick={resendCode}>Renvoyer le code</button>
        </div>
      </form>
    </div>
  );
}
