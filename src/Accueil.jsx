import { Link, useNavigate } from "react-router-dom";
import './styles/bouton.css';
import './styles/Accueil.css';
import accueilImg from './Accueil2.jpg';

export default function Accueil() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${accueilImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <header style={{ position: 'relative', height: 420 }}>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* LOGO + NAV */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <span style={{ fontWeight: 700, color: '#333' }}>O</span>
            </div>
            <nav className="main-nav">
              <ul>
                <li><a href="/EtatComptabilite">Mes prestations</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="/login">Login</a></li>
              </ul>
            </nav>
          </div> {/* ✅ ici on ferme bien le bloc NAV */}
        </div>

        {/* TITRE */}
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: 20,
            marginTop: 40
          }}
        >
          <h2 style={{ fontSize: 44, color: '#3b333348', marginBottom: 6 }}>Paie Malagasy</h2>
          <p style={{ color: '#3b333348', opacity: 0.9, maxWidth: 700 }}>
            Accompagnement — Soutien et conseil pour les entreprises
          </p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: 1100, margin: '-60px auto 60px', padding: 20 }}>
        <section style={{ display: 'flex', gap: 40 }}>
          <div style={{ flex: 1 }}></div>
          <div style={{ width: 380 }}>
            <div className="section">
              <h3>Mes prestations</h3>
              <p style={{ color: '#666' }}>Contenu à venir.</p>
            </div>
            <div className="section" style={{ marginTop: 12 }}>
              <h3>Contact</h3>
              <p style={{ color: '#666' }}>Contenu à venir.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
