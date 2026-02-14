{/*-----IMPORTANT  yon can see this page on https://nkcx6c.csb.app/   ----------*/}

import { useState } from "react";

const correlationData = {
  variables: ["Temperatura", "Sensación Térmica", "Humedad", "Velocidad Viento", "Demanda (Target)"],
  matrix: [
    [1.00,  0.93, -0.07,  0.13,  0.63],
    [0.93,  1.00, -0.04,  0.16,  0.61],
    [-0.07, -0.04, 1.00, -0.32, -0.55],
    [0.13,  0.16, -0.32,  1.00,  0.10],
    [0.63,  0.61, -0.55,  0.10,  1.00],
  ],
};

function getColor(value) {
  if (value >= 0.8) return "#1a1a6e";
  if (value >= 0.6) return "#2d3dbf";
  if (value >= 0.4) return "#4a7fdf";
  if (value >= 0.2) return "#7fb8ef";
  if (value >= 0.0) return "#c8e0f7";
  if (value >= -0.2) return "#f7d4c8";
  if (value >= -0.4) return "#ef9a7f";
  if (value >= -0.6) return "#df5a4a";
  if (value >= -0.8) return "#bf2d2d";
  return "#6e1a1a";
}

function getTextColor(value) {
  return Math.abs(value) >= 0.6 ? "#fff" : "#1a1a2e";
}

const shortLabels = ["Temp", "S.Térmica", "Humedad", "Viento", "Demanda"];

export default function CorrelationHeatmap() {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [step, setStep] = useState(0);

  const { variables, matrix } = correlationData;

  const eliminatedPairs = [
    {
      pair: [0, 1],
      r: 0.93,
      eliminate: 1,
      keep: 0,
      reason: "Sensación Térmica y Temperatura tienen r = 0.93 (> 0.80). Se elimina Sensación Térmica porque Temperatura tiene mayor correlación con el Target (0.63 vs 0.61) y es más directa de medir.",
    },
  ];

  const analysisSteps = [
    {
      title: "Paso 1 — Observar la matriz completa",
      desc: "Revisa todas las correlaciones entre variables independientes. Busca valores con |r| ≥ 0.80.",
      highlights: [],
      eliminated: [],
    },
    {
      title: "Paso 2 — Detectar multicolinealidad",
      desc: "Temperatura ↔ Sensación Térmica tienen r = 0.93, muy por encima del umbral 0.80. Esto indica redundancia.",
      highlights: [[0, 1], [1, 0]],
      eliminated: [],
    },
    {
      title: "Paso 3 — Decidir cuál eliminar",
      desc: "Temperatura tiene mayor correlación con Demanda (0.63 vs 0.61). Se elimina Sensación Térmica.",
      highlights: [[0, 1], [1, 0]],
      eliminated: [1],
    },
    {
      title: "Paso 4 — Verificar variables restantes",
      desc: "Humedad (r = -0.55 con Target) y Viento (r = 0.10) no superan el umbral entre sí (|r| = 0.32). Se conservan ambas. La Humedad aporta buena información predictiva.",
      highlights: [[2, 3], [3, 2]],
      eliminated: [1],
    },
  ];

  const currentStep = analysisSteps[step];

  const isHighlighted = (i, j) =>
    currentStep.highlights.some(([a, b]) => a === i && b === j);

  const isEliminated = (idx) => currentStep.eliminated.includes(idx);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #0d1117 0%, #161b22 50%, #0d1117 100%)",
      color: "#e6edf3",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
      padding: "32px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 32, maxWidth: 700 }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#58a6ff",
          margin: 0,
          letterSpacing: "-0.5px",
        }}>
          Mapa de Calor de Correlación
        </h1>
        <p style={{
          color: "#8b949e",
          fontSize: 14,
          marginTop: 8,
          lineHeight: 1.5,
        }}>
          Ejemplo con datos de demanda de bicicletas — Regla: eliminar 1 variable cuando |r| ≥ 0.80
        </p>
      </div>

      {/* Heatmap */}
      <div style={{
        background: "#161b22",
        borderRadius: 16,
        border: "1px solid #30363d",
        padding: "28px 28px 20px 28px",
        marginBottom: 24,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        overflowX: "auto",
      }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 4 }}>
          <thead>
            <tr>
              <th style={{ width: 90 }}></th>
              {shortLabels.map((label, j) => (
                <th key={j} style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isEliminated(j) ? "#f8514966" : j === 4 ? "#3fb950" : "#c9d1d9",
                  textAlign: "center",
                  padding: "4px 6px 10px",
                  textDecoration: isEliminated(j) ? "line-through" : "none",
                  transition: "all 0.3s ease",
                  minWidth: 72,
                }}>
                  {label}
                  {j === 4 && <span style={{ display: "block", fontSize: 9, color: "#3fb950", opacity: 0.7 }}>⬆ target</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isEliminated(i) ? "#f8514966" : i === 4 ? "#3fb950" : "#c9d1d9",
                  textAlign: "right",
                  paddingRight: 12,
                  textDecoration: isEliminated(i) ? "line-through" : "none",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                }}>
                  {shortLabels[i]}
                </td>
                {row.map((val, j) => {
                  const highlighted = isHighlighted(i, j);
                  const dimmed = isEliminated(i) || isEliminated(j);
                  return (
                    <td
                      key={j}
                      onMouseEnter={() => setHoveredCell({ i, j, val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        width: 72,
                        height: 56,
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        color: dimmed ? "#ffffff22" : getTextColor(val),
                        background: dimmed ? "#21262d33" : getColor(val),
                        borderRadius: 8,
                        cursor: "default",
                        position: "relative",
                        transition: "all 0.35s ease",
                        outline: highlighted ? "2.5px solid #f0e68c" : "none",
                        outlineOffset: highlighted ? -2 : 0,
                        boxShadow: highlighted
                          ? "0 0 12px rgba(240,230,140,0.4)"
                          : hoveredCell?.i === i && hoveredCell?.j === j
                          ? "0 0 10px rgba(88,166,255,0.3)"
                          : "none",
                        opacity: dimmed ? 0.3 : 1,
                      }}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Color scale */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          marginTop: 16,
        }}>
          <span style={{ fontSize: 10, color: "#8b949e", marginRight: 4 }}>-1.0</span>
          {[
            "#6e1a1a", "#bf2d2d", "#df5a4a", "#ef9a7f", "#f7d4c8",
            "#c8e0f7", "#7fb8ef", "#4a7fdf", "#2d3dbf", "#1a1a6e",
          ].map((c, i) => (
            <div key={i} style={{
              width: 28,
              height: 12,
              background: c,
              borderRadius: 3,
            }} />
          ))}
          <span style={{ fontSize: 10, color: "#8b949e", marginLeft: 4 }}>+1.0</span>
        </div>
      </div>

      {/* Step navigator */}
      <div style={{
        background: "#161b22",
        borderRadius: 16,
        border: "1px solid #30363d",
        padding: "24px 28px",
        maxWidth: 620,
        width: "100%",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {analysisSteps.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setStep(idx)}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: idx <= step ? "#58a6ff" : "#30363d",
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
            />
          ))}
        </div>

        <h3 style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#58a6ff",
          margin: "0 0 10px 0",
        }}>
          {currentStep.title}
        </h3>
        <p style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "#c9d1d9",
          margin: 0,
        }}>
          {currentStep.desc}
        </p>

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            style={{
              background: step === 0 ? "#21262d" : "#30363d",
              color: step === 0 ? "#484f58" : "#c9d1d9",
              border: "1px solid #30363d",
              borderRadius: 8,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: step === 0 ? "default" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            ← Anterior
          </button>
          <button
            onClick={() => setStep(Math.min(analysisSteps.length - 1, step + 1))}
            disabled={step === analysisSteps.length - 1}
            style={{
              background: step === analysisSteps.length - 1 ? "#21262d" : "#238636",
              color: step === analysisSteps.length - 1 ? "#484f58" : "#fff",
              border: "1px solid transparent",
              borderRadius: 8,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: step === analysisSteps.length - 1 ? "default" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div style={{
        background: "linear-gradient(135deg, #1a2332, #161b22)",
        borderRadius: 16,
        border: "1px solid #238636",
        padding: "24px 28px",
        maxWidth: 620,
        width: "100%",
        marginTop: 20,
        boxShadow: "0 4px 20px rgba(35,134,54,0.15)",
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#3fb950", margin: "0 0 14px 0" }}>
          📋 Resumen Final
        </h3>
        <div style={{ fontSize: 13, lineHeight: 1.8, color: "#c9d1d9" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ color: "#f85149", fontSize: 16 }}>✗</span>
            <span><strong style={{ color: "#f85149" }}>Eliminada:</strong> Sensación Térmica — redundante con Temperatura (r = 0.93)</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ color: "#3fb950", fontSize: 16 }}>✓</span>
            <span><strong style={{ color: "#3fb950" }}>Conservadas:</strong> Temperatura (r = 0.63 con Target), Humedad (r = -0.55), Viento (r = 0.10)</span>
          </div>
          <div style={{
            background: "#30363d44",
            borderRadius: 8,
            padding: "12px 14px",
            marginTop: 12,
            borderLeft: "3px solid #58a6ff",
            fontSize: 12,
            color: "#8b949e",
            lineHeight: 1.6,
          }}>
            💡 <strong style={{ color: "#c9d1d9" }}>Nota:</strong> Viento tiene baja correlación con el Target (0.10), pero no se elimina por multicolinealidad ya que no está altamente correlacionada con otras variables. Su eliminación sería por <em>baja relevancia predictiva</em>, que es un criterio diferente.
          </div>
        </div>
      </div>
    </div>
  );
}
