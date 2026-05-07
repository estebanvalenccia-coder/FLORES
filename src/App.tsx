import { Flower2, TabletSmartphone } from "lucide-react";
import { Routes, Route, Link } from "react-router-dom";
import { AdminInventory } from "./AdminInventory";

function ClientPage() {
  return (
    <div className="tablet-page">
      <div className="tablet-box">
        <TabletSmartphone size={54} />
        <h1>Zona clientes</h1>
        <p>
          Aquí los clientes podrán elegir flores, presupuesto y estilos de ramo.
        </p>

        <div className="tablet-actions">
          <button>Ramo romántico</button>
          <button>Ramo premium</button>
          <button>Elegir flores</button>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <>
      <header className="topbar">
        <div className="logo">
          <Flower2 />
          <span>FLORES</span>
        </div>

        <nav>
          <Link to="/admin">Admin</Link>
          <Link to="/clientes">Clientes</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/admin" element={<AdminInventory />} />
        <Route path="/clientes" element={<ClientPage />} />
        <Route path="*" element={<AdminInventory />} />
      </Routes>
    </>
  );
}
