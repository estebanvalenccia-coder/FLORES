import { useMemo, useState, type ReactNode } from "react";
import { Flower2, ImageIcon, Loader2, Send, Sparkles } from "lucide-react";

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

const occasions = ["Romántico", "Cumpleaños", "Aniversario", "Boda", "Sorpresa", "Decoración", "Funeral"];
const styles = ["Premium", "Elegante", "Moderno", "Silvestre", "Minimalista", "Clásico"];
const colorOptions = ["Rojo", "Blanco", "Rosa", "Crema", "Verde", "Lila", "Pastel", "Naranja"];
const flowerOptions = ["Rosas", "Tulipanes", "Eucalipto", "Paniculata", "Peonías", "Lirios", "Margaritas", "Hortensias"];

async function readJsonSafely(response: Response): Promise<Result> {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 300) || `Respuesta no válida del servidor (${response.status})` };
  }
}

export function ClientBouquetAI() {
  const [occasion, setOccasion] = useState("Romántico");
  const [style, setStyle] = useState("Premium");
  const [budget, setBudget] = useState(45);
  const [colors, setColors] = useState<string[]>(["Rojo", "Blanco"]);
  const [flowers, setFlowers] = useState<string[]>(["Rosas", "Eucalipto"]);
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
        body: JSON.stringify({ occasion, style, budget, colors, flowers, aspectRatio: "1:1" }),
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
      socket.send(JSON.stringify({
        type: "client:bouquet-request",
        payload: {
          selectedSummary,
          occasion,
          style,
          budget,
          colors,
          flowers,
          result,
          createdAt: new Date().toISOString(),
        },
      }));
      socket.close();
    };
  };

  return (
    <div className="client-ai-page">
      <section className="client-hero">
        <div>
          <p className="eyebrow">Experiencia cliente</p>
          <h1>Crea tu ramo con IA</h1>
          <p>Elige ocasión, colores, flores y presupuesto. La IA genera una propuesta visual al momento.</p>
        </div>
        <div className="client-badge"><Sparkles /> IA + imagen</div>
      </section>

      <section className="client-grid">
        <div className="client-panel">
          <Field title="Ocasión">
            <div className="pill-grid">
              {occasions.map((item) => (
                <button key={item} className={occasion === item ? "pill active" : "pill"} onClick={() => setOccasion(item)}>
                  {item}
                </button>
              ))}
            </div>
          </Field>

          <Field title="Estilo">
            <div className="pill-grid">
              {styles.map((item) => (
                <button key={item} className={style === item ? "pill active" : "pill"} onClick={() => setStyle(item)}>
                  {item}
                </button>
              ))}
            </div>
          </Field>

          <Field title={`Presupuesto aproximado: ${budget}€`}>
            <input className="range" type="range" min="20" max="180" step="5" value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
          </Field>

          <Field title="Colores">
            <div className="pill-grid">
              {colorOptions.map((item) => (
                <button key={item} className={colors.includes(item) ? "pill active" : "pill"} onClick={() => toggle(item, colors, setColors)}>
                  {item}
                </button>
              ))}
            </div>
          </Field>

          <Field title="Flores favoritas">
            <div className="pill-grid">
              {flowerOptions.map((item) => (
                <button key={item} className={flowers.includes(item) ? "pill active" : "pill"} onClick={() => toggle(item, flowers, setFlowers)}>
                  {item}
                </button>
              ))}
            </div>
          </Field>

          <button className="generate-btn" onClick={generateBouquet} disabled={loading}>
            {loading ? <Loader2 className="spin" /> : <Sparkles />}
            {loading ? "Generando ramo..." : "Generar imagen del ramo"}
          </button>
        </div>

        <div className="result-panel">
          <div className="result-image">
            {result?.image?.imageUrl ? (
              <img src={result.image.imageUrl} alt={result.proposal?.title || "Ramo generado por IA"} />
            ) : (
              <div className="empty-image"><ImageIcon /><span>La imagen del ramo aparecerá aquí</span></div>
            )}
          </div>

          <div className="result-copy">
            <p className="eyebrow">Tu selección</p>
            <h2>{result?.proposal?.title || "Ramo personalizado"}</h2>
            <p>{result?.proposal?.description || selectedSummary}</p>

            {result?.proposal?.recommendedFlowers?.length ? (
              <div className="flower-tags">
                {result.proposal.recommendedFlowers.map((item) => <span key={item}><Flower2 size={14} /> {item}</span>)}
              </div>
            ) : null}

            {result?.proposal?.sellingTips && <div className="ai-tip">{result.proposal.sellingTips}</div>}
            {result?.error && <div className="error-box">{result.error}</div>}
            {result?.imageError && <div className="error-box">Imagen: {result.imageError}</div>}

            <button className="send-admin-btn" onClick={sendToAdmin} disabled={!result}>
              <Send /> Enviar al florista
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="client-field">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
