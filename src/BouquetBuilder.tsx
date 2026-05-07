import { useMemo, useState } from "react";
import { Bot, Calculator, Plus, Sparkles, Trash2 } from "lucide-react";
import { Flower, initialFlowers, money } from "./data";

function loadFlowers(): Flower[] {
  const saved = localStorage.getItem("flores.inventory");
  if (!saved) return initialFlowers;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : initialFlowers;
  } catch {
    return initialFlowers;
  }
}

type BouquetLine = {
  flowerId: string;
  quantity: number;
};

export function BouquetBuilder() {
  const [flowers, setFlowers] = useState<Flower[]>(loadFlowers);
  const [lines, setLines] = useState<BouquetLine[]>([{ flowerId: initialFlowers[0].id, quantity: 12 }]);
  const [labor, setLabor] = useState(8);
  const [packaging, setPackaging] = useState(4);
  const [delivery, setDelivery] = useState(0);
  const [targetMargin, setTargetMargin] = useState(55);
  const [occasion, setOccasion] = useState("Regalo especial");
  const [aiText, setAiText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const quote = useMemo(() => {
    const selected = lines
      .map((line) => {
        const flower = flowers.find((item) => item.id === line.flowerId);
        if (!flower) return null;
        return {
          ...line,
          flower,
          cost: flower.buy * line.quantity,
          retail: flower.sell * line.quantity,
          hasStock: flower.stock >= line.quantity,
        };
      })
      .filter(Boolean) as Array<BouquetLine & { flower: Flower; cost: number; retail: number; hasStock: boolean }>;

    const flowersCost = selected.reduce((sum, item) => sum + item.cost, 0);
    const flowersRetail = selected.reduce((sum, item) => sum + item.retail, 0);
    const extraCost = labor + packaging + delivery;
    const realCost = flowersCost + extraCost;
    const priceByMargin = targetMargin >= 99 ? realCost : realCost / (1 - targetMargin / 100);
    const suggestedPrice = Math.max(priceByMargin, flowersRetail + extraCost);
    const profit = suggestedPrice - realCost;
    const finalMargin = suggestedPrice > 0 ? (profit / suggestedPrice) * 100 : 0;
    const missingStock = selected.filter((item) => !item.hasStock);

    return { selected, flowersCost, extraCost, realCost, suggestedPrice, profit, finalMargin, missingStock };
  }, [delivery, flowers, labor, lines, packaging, targetMargin]);

  const addLine = () => {
    if (!flowers.length) return;
    setLines((current) => [...current, { flowerId: flowers[0].id, quantity: 1 }]);
  };

  const confirmSale = () => {
    if (quote.missingStock.length) return;

    const nextFlowers = flowers.map((flower) => {
      const used = quote.selected.find((item) => item.flowerId === flower.id);
      return used ? { ...flower, stock: flower.stock - used.quantity } : flower;
    });

    setFlowers(nextFlowers);
    localStorage.setItem("flores.inventory", JSON.stringify(nextFlowers));
    localStorage.setItem("flores.latestQuote", JSON.stringify({ date: new Date().toISOString(), occasion, quote }));
    window.dispatchEvent(new Event("flores-inventory-updated"));
  };

  const askGrok = async () => {
    setLoadingAi(true);
    setAiText("");

    try {
      const response = await fetch("http://localhost:3001/api/grok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Crea una propuesta comercial breve para un ramo de floristería. Ocasión: ${occasion}. Flores: ${quote.selected.map((item) => `${item.quantity} ${item.flower.name}`).join(", ")}. Precio: ${money(quote.suggestedPrice)}. Margen: ${quote.finalMargin.toFixed(1)}%.`,
        }),
      });

      const data = await response.json();
      setAiText(data.text || data.message || data.error || "IA preparada. Configura XAI_API_KEY para respuesta real.");
    } catch {
      setAiText("No se pudo conectar con el backend local. Ejecuta npm run dev:full.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <section className="inventory-card bouquet-card">
      <div className="inventory-header">
        <div>
          <h2><Calculator size={22} /> Calculadora de ramos</h2>
          <p>Calcula coste real, PVP recomendado, margen, beneficio y stock.</p>
        </div>
        <button className="primary-btn" onClick={askGrok}><Bot size={18} /> {loadingAi ? "Pensando..." : "Pedir a Grok"}</button>
      </div>

      <div className="builder-grid">
        <div className="builder-lines">
          <label>Ocasión</label>
          <input value={occasion} onChange={(e) => setOccasion(e.target.value)} />

          {lines.map((line, index) => (
            <div className="builder-line" key={`${line.flowerId}-${index}`}>
              <select value={line.flowerId} onChange={(e) => setLines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, flowerId: e.target.value } : item))}>
                {flowers.map((flower) => <option key={flower.id} value={flower.id}>{flower.name} · stock {flower.stock}</option>)}
              </select>
              <input type="number" min="1" value={line.quantity} onChange={(e) => setLines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Number(e.target.value) || 1 } : item))} />
              <button className="icon-danger" onClick={() => setLines((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={18} /></button>
            </div>
          ))}

          <button className="secondary-btn" onClick={addLine}><Plus size={18} /> Añadir flor</button>
        </div>

        <div className="builder-costs">
          <label>Mano de obra<input type="number" value={labor} onChange={(e) => setLabor(Number(e.target.value) || 0)} /></label>
          <label>Envoltorio<input type="number" value={packaging} onChange={(e) => setPackaging(Number(e.target.value) || 0)} /></label>
          <label>Envío<input type="number" value={delivery} onChange={(e) => setDelivery(Number(e.target.value) || 0)} /></label>
          <label>Margen objetivo %<input type="number" value={targetMargin} onChange={(e) => setTargetMargin(Number(e.target.value) || 0)} /></label>
        </div>
      </div>

      <div className="quote-summary pro-summary">
        <div className="quote-row"><span>Coste flores</span><strong>{money(quote.flowersCost)}</strong></div>
        <div className="quote-row"><span>Costes extra</span><strong>{money(quote.extraCost)}</strong></div>
        <div className="quote-row"><span>Coste real</span><strong>{money(quote.realCost)}</strong></div>
        <div className="quote-row"><span>Beneficio</span><strong>{money(quote.profit)}</strong></div>
        <div className="quote-row"><span>Margen final</span><strong>{quote.finalMargin.toFixed(1)}%</strong></div>
        <div className="quote-row big-price"><span>PVP recomendado</span><span>{money(quote.suggestedPrice)}</span></div>
      </div>

      {quote.missingStock.length > 0 && <div className="warning-box">Falta stock: {quote.missingStock.map((item) => item.flower.name).join(", ")}</div>}

      <div className="ai-box">
        <div className="ai-title"><Sparkles size={18} /><strong>Propuesta IA</strong></div>
        <p>{aiText || `Ramo para ${occasion.toLowerCase()} con ${quote.selected.map((item) => item.flower.name).join(", ") || "flores de temporada"}. Precio sugerido ${money(quote.suggestedPrice)}.`}</p>
      </div>

      <button className="primary-btn full" onClick={confirmSale}>Confirmar venta y descontar stock</button>
    </section>
  );
}
