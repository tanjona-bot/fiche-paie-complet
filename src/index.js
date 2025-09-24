
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Accueil from "./Accueil";
import Dashboard from "./Dashboard";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Admin from "./Admin";
import "./styles/index.css";
import EtatComptabilite from './EtatComptabilite';

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Accueil />} />
  <Route path="/login" element={<Login />} />
  <Route path="/fiche" element={<ProtectedRoute><App /></ProtectedRoute>} />
  <Route path="/Dashboard" element={<Dashboard />} />
  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
  <Route path="/etatcomptabilite" element={<EtatComptabilite rows={[]} />} />
    </Routes>
  </BrowserRouter>
);
