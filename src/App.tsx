import { Flower2, MonitorCog, TabletSmartphone, Wifi } from "lucide-react";
import { Routes, Route, Link } from "react-router-dom";

function AdminPage() {
  return (
    <div className="page">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Panel interno</p>
          <h1>Administrador floristería</h1>
          <p className="description">
            Control de stock, márgenes, cálculo de ramos, pedidos e IA conectada.
          </p>
        </div>

        <div className="status-box">
          <MonitorCog size={40} />
          <span>Modo ordenador</span>
        </div>
      </div>

      <div className="grid">
        <div className="card big">
          <h2>Coste flores</h2>
          <p>
            Tabla profesional para controlar compra, venta, stock y margen.
          </p>

          <div className="mini-table">
            <div className="row header">
              <span>Flor</span>
              <span>Compra</span>
              <span>Venta</span>
              <span>Stock</span>
            </div>

            <div className="row">
              <span>Rosa roja</span>
              <span>1.20€</span>
              <span>3.50€</span>
              <span>80</span>
            </div>

            <div className="row">
              <span>Tulipán</span>
              <span>1.40€</span>
              <span>3.80€</span>
              <span>45</span>
            </div>
          </div>
        </div>

        <div className="card">
          <Flower2 size={32} />
          <h3>IA de ramos</h3>
          <p>
            Preparado para conectar Grok/xAI y generar recomendaciones.
          </p>
        </div>

        <div className="card">
          <Wifi size={32} />
          <h3>Red interna LAN</h3>
          <p>
            Ordenador y tablet conectados por IP local sin dominio.
          </p>
        </div>
      </div>
    </div>
  );
}

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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/clientes" element={<ClientPage />} />
        <Route path="*" element={<AdminPage />} />
      </Routes>
    </>
  );
}
