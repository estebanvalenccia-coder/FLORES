import { useMemo, useState } from "react";
import { Euro, Package, Plus, Save, Trash2, TrendingUp } from "lucide-react";
import { type Flower, initialFlowers, money } from "./data";

function loadFlowers(): Flower[] {
  const saved = localStorage.getItem("flores.inventory");
  if (!saved) return initialFlowers;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : initialFlowers;
  } catch {
    return initialFlowers;
  }
}

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AdminPanel() {
  const [flowers, setFlowers] = useState<Flower[]>(loadFlowers);
  const [draft, setDraft] = useState({ name: "", category: "Flor principal", buy: 0, sell: 0, stock: 0, unit: "unidad" });

  const stats = useMemo(() => {
    const cost = flowers.reduce((sum, item) => sum + item.buy * item.stock, 0);
    const retail = flowers.reduce((sum, item) => sum + item.sell * item.stock, 0);
    const lowStock = flowers.filter((item) => item.stock <= 10).length;
    const avgMargin = flowers.length
      ? flowers.reduce((sum, item) => sum + (item.sell > 0 ? ((item.sell - item.buy) / item.sell) * 100 : 0), 0) / flowers.length
      : 0;

    return { cost, retail, lowStock, avgMargin };
  }, [flowers]);

  const save = (next = flowers) => {
    localStorage.setItem("flores.inventory", JSON.stringify(next));
    window.dispatchEvent(new Event("flores-inventory-updated"));
  };

  const updateFlower = (id: string, key: keyof Flower, value: string | number) => {
    setFlowers((current) => current.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const addFlower = () => {
    if (!draft.name.trim()) return;

    const next: Flower[] = [
      ...flowers,
      {
        id: `${slug(draft.name)}-${Date.now()}`,
        name: draft.name,
        category: draft.category,
        buy: Number(draft.buy) || 0,
        sell: Number(draft.sell) || 0,
        stock: Number(draft.stock) || 0,
        unit: draft.unit,
      },
    ];

    setFlowers(next);
    setDraft({ name: "", category: "Flor principal", buy: 0, sell: 0, stock: 0, unit: "unidad" });
    save(next);
  };

  const removeFlower = (id: string) => {
    const next = flowers.filter((item) => item.id !== id);
    setFlowers(next);
    save(next);
  };

  return (
    <div className="page">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Administrador</p>
          <h1>Coste flores</h1>
          <p className="description">Inventario editable, precios de compra, venta, margen y stock para ramos.</p>
        </div>
        <div className="status-box">
          <Package size={42} />
          <span>{flowers.length} referencias</span>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat"><Package /><span>Coste inventario</span><strong>{money(stats.cost)}</strong></div>
        <div className="stat"><Euro /><span>Venta potencial</span><strong>{money(stats.retail)}</strong></div>
        <div className="stat"><TrendingUp /><span>Margen medio</span><strong>{stats.avgMargin.toFixed(1)}%</strong></div>
        <div className="stat"><Package /><span>Stock bajo</span><strong>{stats.lowStock}</strong></div>
      </section>

      <section className="inventory-card">
        <div className="inventory-header">
          <div>
            <h2>Tabla profesional</h2>
            <p>Edita cada flor y guarda los cambios en este ordenador.</p>
          </div>
          <button className="primary-btn" onClick={() => save()}><Save size={18} /> Guardar</button>
        </div>

        <div className="table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Flor</th><th>Categoría</th><th>Compra</th><th>Venta</th><th>Margen</th><th>Stock</th><th>Unidad</th><th></th>
              </tr>
            </thead>
            <tbody>
              {flowers.map((flower) => {
                const margin = flower.sell > 0 ? ((flower.sell - flower.buy) / flower.sell) * 100 : 0;
                return (
                  <tr key={flower.id}>
                    <td><input value={flower.name} onChange={(event) => updateFlower(flower.id, "name", event.target.value)} /></td>
                    <td><input value={flower.category} onChange={(event) => updateFlower(flower.id, "category", event.target.value)} /></td>
                    <td><input type="number" step="0.01" value={flower.buy} onChange={(event) => updateFlower(flower.id, "buy", Number(event.target.value) || 0)} /></td>
                    <td><input type="number" step="0.01" value={flower.sell} onChange={(event) => updateFlower(flower.id, "sell", Number(event.target.value) || 0)} /></td>
                    <td><strong>{margin.toFixed(1)}%</strong></td>
                    <td><input type="number" value={flower.stock} onChange={(event) => updateFlower(flower.id, "stock", Number(event.target.value) || 0)} /></td>
                    <td><input value={flower.unit} onChange={(event) => updateFlower(flower.id, "unit", event.target.value)} /></td>
                    <td><button className="icon-danger" onClick={() => removeFlower(flower.id)}><Trash2 size={18} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="add-row">
          <input placeholder="Nueva flor" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          <input placeholder="Categoría" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} />
          <input type="number" placeholder="Compra" value={draft.buy} onChange={(event) => setDraft({ ...draft, buy: Number(event.target.value) || 0 })} />
          <input type="number" placeholder="Venta" value={draft.sell} onChange={(event) => setDraft({ ...draft, sell: Number(event.target.value) || 0 })} />
          <input type="number" placeholder="Stock" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) || 0 })} />
          <button className="primary-btn" onClick={addFlower}><Plus size={18} /> Añadir</button>
        </div>
      </section>
    </div>
  );
}
