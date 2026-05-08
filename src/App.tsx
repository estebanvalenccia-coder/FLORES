import { Flower2 } from "lucide-react";
import { Routes, Route, Link } from "react-router-dom";
import { AdminPanel } from "./AdminPanel";
import { ClientExperience } from "./ClientExperience";

export function App() {
  return (
    <>
      <header className="topbar dark-topbar">
        <div className="logo">
          <Flower2 />
          <span>FLORES</span>
        </div>

        <nav>
          <Link to="/admin">Admin</Link>
          <Link to="/clientes">Clientes IA</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/clientes" element={<ClientExperience />} />
        <Route path="*" element={<ClientExperience />} />
      </Routes>
    </>
  );
}

export default App;
