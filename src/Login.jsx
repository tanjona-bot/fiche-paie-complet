import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './styles/Login.css';
import { hashPwd } from './utils';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const accountsRaw = localStorage.getItem('accounts');
      const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];
      const hashedInput = await hashPwd(password);
      let found = accounts.find(a => a.email === email && a.password === hashedInput);
      if (!found) {
        const plain = accounts.find(a => a.email === email && a.password === password);
        if (plain) {
          plain.password = hashedInput;
          localStorage.setItem('accounts', JSON.stringify(accounts));
          found = plain;
        }
      }
      if (found) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', email);
        navigate('/fiche');
        return;
      }
      alert('Identifiants invalides');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la connexion');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const raw = localStorage.getItem('accounts');
      const accounts = raw ? JSON.parse(raw) : [];
      if (accounts.find(a => a.email === email)) {
        alert('Un compte existe déjà avec cet email');
        return;
      }
      const hashed = await hashPwd(password);
      accounts.push({ email, password: hashed, first, last, isAdmin: false, isVerified: true });
      localStorage.setItem('accounts', JSON.stringify(accounts));
      alert('Compte créé — vous pouvez vous connecter');
      setMode('login');
    } catch (err) {
      console.error(err);
      alert('Impossible de créer le compte');
    }
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh', position: 'relative'}}>
      <div style={{position:'absolute', left:20, top:20}}>
        <Link to="/" style={{display:'inline-block', padding:'8px 16px', background:'#cfefff', borderRadius:6, color:'#000', textDecoration:'none', boxShadow:'0 0 0 2px #9fdfff inset'}}>Accueil</Link>
      </div>

      <div className="form-container">
        <div style={{display:'flex', gap:12, marginBottom:12}}>
          <button className={`form-toggle ${mode==='login'?'active':''}`} onClick={()=>setMode('login')}>Connexion</button>
          <button className={`form-toggle ${mode==='register'?'active':''}`} onClick={()=>setMode('register')}>Inscription</button>
        </div>

        {mode === 'login' ? (
          <>
            <h2 className="title">Se connecter</h2>
            <form className="form" onSubmit={handleLogin}>
              <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
              <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
              <div className="page-link"><label className="page-link-label">Mot de passe oublié?</label></div>
              <button className="form-btn" type="submit">Se connecter</button>
              <p style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span className="sign-up-label">Pas de compte ? <span className="sign-up-link" onClick={()=>setMode('register')}>Créer un compte</span></span>
                <Link to="/" className="page-link-label">Accueil</Link>
              </p>
            </form>
          </>
        ) : (
          <>
            <h2 className="title">Créer un compte</h2>
            <form className="form" onSubmit={handleRegister}>
              <div className="flex">
                <label>
                  <input className="input" type="text" placeholder="" required value={first} onChange={e=>setFirst(e.target.value)} />
                  <span>Firstname</span>
                </label>
                <label>
                  <input className="input" type="text" placeholder="" required value={last} onChange={e=>setLast(e.target.value)} />
                  <span>Lastname</span>
                </label>
              </div>
              <label>
                <input className="input" type="email" placeholder="" required value={email} onChange={e=>setEmail(e.target.value)} />
                <span>Email</span>
              </label>
              <label>
                <input className="input" type="password" placeholder="" required value={password} onChange={e=>setPassword(e.target.value)} />
                <span>Password</span>
              </label>
              <button className="submit" type="submit">Créer un compte</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
