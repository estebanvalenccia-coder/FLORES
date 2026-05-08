import { useMemo, useState, type ReactNode } from "react";
import { CalendarDays, ChevronRight, Flower2, Gift, Heart, ImageIcon, Loader2, Palette, Rotate3D, Send, Sparkles, Wand2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Proposal = {
  title?: string;
  description?: string;
  imagePrompt?: string;
  recommendedFlowers?: string[];
  sellingTips?: string;
};

type Result = {
  proposal?: Proposal;
  image?: {
    imageUrl?: string;
  };
  error?: string;
  imageError?: string;
};

const occasions = ["Cumpleaños", "Romántico", "Aniversario", "Boda", "Sorpresa", "Gracias", "Decoración"];
const styles = ["Alegre y romántico", "Luxury pastel", "Silvestre chic", "Minimalista", "Pinterest bouquet", "Primavera coral"];
const colorOptions = ["Rosa", "Coral", "Melocotón", "Crema", "Verde salvia", "Lavanda", "Amarillo suave", "Blanco"];
const flowerOptions = ["Peonía", "Rosa Pink Mondial", "Lisianthus", "Eucalipto", "Lavanda", "Margaritas", "Hortensia", "Tulipán"];

const aiCards = [
  { name: "Alegría Floral", price: "85,00 €", tag: "Mejor opción", image: "🌸" },
  { name: "Encanto Natural", price: "80,00 €", tag: "Romántico", image: "🌷" },
  { name: "Sonrisa Perfecta", price: "75,00 €", tag: "Pastel", image: "💐" },
  { name: "Dulzura Total", price: "90,00 €", tag: "Premium", image: "🌺" },
];

async function readJsonSafely(response: Response): Promise<Result> {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 300) || `Respuesta no válida del servidor (${response.status})` };
  }
}

export function ClientExperience() {
  const [occasion, setOccasion] = useState("Cumpleaños");
  const [style, setStyle] = useState("Alegre y romántico");
  const [budget, setBudget] = useState(85);
  const [colors, setColors] = useState<string[]>(["Rosa", "Coral", "Crema"]);
  const [flowers, setFlowers] = useState<string[]>(["Peonía", "Rosa Pink Mondial", "Lisianthus"]);
  const [idea, setIdea] = useState("Quiero un ramo alegre y romántico con peonías, rosas y flores silvestres en tonos rosa y coral");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedSummary = useMemo(() => {
    return `${occasion} · ${style} · ${budget}€ · ${colors.join(", ")} · ${flowers.join(", ")}`;
  }, [budget, colors, flowers, occasion, style]);

  const toggle = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const generateBouquet = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/bouquet/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, style, budget, colors, flowers, description: idea, aspectRatio: "1:1" }),
      });

      const data = await readJsonSafely(response);
      setResult(data);
    } catch {
      setResult({ error: "No se pudo conectar con el servidor interno. Revisa que el backend esté encendido." });
    } finally {
      setLoading(false);
    }
  };

  const sendToAdmin = () => {
    const wsUrl = API_BASE.replace("http", "ws");
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "client:bouquet-request", payload: { selectedSummary, occasion, style, budget, colors, flowers, result, createdAt: new Date().toISOString() } }));
      socket.close();
    };
  };

  return (
    <main className="floral-stage client-stage">
      <Petals />

      <section className="tablet-shell client-tablet">
        <aside className="side-menu">
          <div className="brand-mark"><span>✿</span><strong>LA FLORISTERÍA</strong><small>Crea ramos únicos que cuentan historias</small></div>
          <NavItem active icon={<Sparkles size={18} />} label="Crear ramo" />
          <NavItem icon={<Heart size={18} />} label="Inspiración" />
          <NavItem icon={<Gift size={18} />} label="Ocasiones" />
          <NavItem icon={<Flower2 size={18} />} label="Flores" />
          <NavItem icon={<Palette size={18} />} label="Colores" />
          <div className="help-card"><span>¿Necesitas ayuda?</span><strong>Estoy aquí para ayudarte 💌</strong></div>
        </aside>

        <section className="creator-panel">
          <div className="creator-copy">
            <div className="creator-headline">
              <span className="pill-soft"><Sparkles size={14} /> IA floral premium</span>
              <button className="round-action"><Rotate3D size={16} /> ver en 360º</button>
            </div>
            <h1>Cuéntanos tu idea ✨</h1>
            <label className="idea-box">
              <textarea value={idea} onChange={(event) => setIdea(event.target.value)} maxLength={180} />
              <small>{idea.length}/180</small>
            </label>

            <div className="option-grid three">
              <MiniSelect title="Ocasión" value={occasion} icon="🎁">
                {occasions.map((item) => <button key={item} onClick={() => setOccasion(item)}>{item}</button>)}
              </MiniSelect>
              <MiniSelect title="Estilo" value={style} icon="♡">
                {styles.map((item) => <button key={item} onClick={() => setStyle(item)}>{item}</button>)}
              </MiniSelect>
              <MiniSelect title="Presupuesto" value={`${budget - 15} - ${budget + 15} €`} icon="💶">
                <input className="range" type="range" min="35" max="180" step="5" value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
              </MiniSelect>
            </div>

            <button className="gradient-cta" onClick={generateBouquet} disabled={loading}>
              {loading ? <Loader2 className="spin" /> : <Wand2 size={18} />}
              {loading ? "Generando magia floral..." : "Generar propuesta con IA"}
            </button>
          </div>

          <div className="hero-bouquet-card">
            {result?.image?.imageUrl ? <img src={result.image.imageUrl} alt={result.proposal?.title || "Ramo generado"} /> : <div className="bouquet-illustration"><span>🌸</span><span>🌺</span><span>🌼</span><span>🌿</span></div>}
            <div className="floating-heart">♡</div>
          </div>
        </section>

        <section className="proposals-row">
          <div className="section-title"><strong>Propuestas generadas para ti</strong><small>Elige, personaliza o envía al florista</small></div>
          <div className="proposal-cards">
            {aiCards.map((card) => <article className="proposal-card" key={card.name}><span className="proposal-tag">{card.tag}</span><div className="mini-bouquet">{card.image}</div><strong>{card.name}</strong><small>{card.price}</small><button>Ver detalles</button></article>)}
          </div>
        </section>

        <section className="details-grid">
          <InfoCard title="Detalles del ramo">
            {flowers.map((flower, index) => <span className="flower-line" key={flower}>{flower} <small>{index + 3} tallos</small></span>)}
            <button className="link-button">+ Ver más flores</button>
          </InfoCard>

          <InfoCard title="Precio estimado">
            <div className="big-price">{budget.toFixed(2).replace(".", ",")} €</div>
            <button className="hot-button" onClick={sendToAdmin}><Send size={16} /> Añadir al pedido</button>
            <small className="muted">Incluye tarjeta personalizada</small>
          </InfoCard>

          <InfoCard title="Vista 360º del ramo">
            <div className="round-preview"><Rotate3D /> 360º</div>
          </InfoCard>
        </section>
      </section>

      <section className="floating-customizer">
        <PanelTitle title="Personaliza tu ramo" subtitle="Flores, verdes, extras y tamaño" />
        <ChipGrid items={colorOptions} selected={colors} onToggle={(item) => toggle(item, colors, setColors)} />
        <div className="flower-picker">
          {flowerOptions.map((item) => <button className={flowers.includes(item) ? "flower-choice active" : "flower-choice"} key={item} onClick={() => toggle(item, flowers, setFlowers)}><span>🌸</span>{item}</button>)}
        </div>
        <div className="message-card"><CalendarDays size={18} /><span>Entrega 22/05/2025 · Mañana</span><ChevronRight size={16} /></div>
        {result?.error && <div className="error-box">{result.error}</div>}
        {result?.imageError && <div className="error-box">Imagen: {result.imageError}</div>}
      </section>
    </main>
  );
}

function NavItem({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return <div className={active ? "nav-item active" : "nav-item"}>{icon}<span>{label}</span></div>;
}

function MiniSelect({ title, value, icon, children }: { title: string; value: string; icon: string; children: ReactNode }) {
  return <div className="mini-select"><small>{title}</small><strong><span>{icon}</span>{value}</strong><div className="mini-menu">{children}</div></div>;
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return <article className="glass-card"><h3>{title}</h3>{children}</article>;
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="panel-title"><h2>{title}</h2><p>{subtitle}</p></div>;
}

function ChipGrid({ items, selected, onToggle }: { items: string[]; selected: string[]; onToggle: (item: string) => void }) {
  return <div className="chip-grid">{items.map((item) => <button key={item} className={selected.includes(item) ? "chip active" : "chip"} onClick={() => onToggle(item)}>{item}</button>)}</div>;
}

function Petals() {
  return <div className="petals" aria-hidden="true"><span>✿</span><span>♡</span><span>✦</span><span>❀</span><span>✧</span></div>;
}
