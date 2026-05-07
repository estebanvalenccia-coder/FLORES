import { Flower2 } from "lucide-react";
import { Routes, Route, Link } from "react-router-dom";
import { AdminInventory } from "./AdminInventory";
import { ClientBouquetAI } from "./ClientBouquetAI";

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
        <Route path="/admin" element={<AdminInventory />} />
        <Route path="/clientes" element={<ClientBouquetAI />} />
        <Route path="*" element={<ClientBouquetAI />} />
      </Routes>
    </>
  );
}
