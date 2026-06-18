// src/components/AISummary.jsx
import { useState } from "react";
import { buildValidationStats } from "../utils/validator";

function CategoryHealthBar({ label, passRate }) {
  const pct = parseFloat(passRate);
  const color = pct >= 95 ? "#16a34a" : pct >= 80 ? "#d97706" : "#dc2626";

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: 7, background: "rgba(54,76,132,0.1)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: "width 0.7s ease",
        }} />
      </div>
    </div>
  );
}

function computeCategoryHealth(results, config) {
  const total = results.length;
  if (total === 0) return [];

  const phoneColumns = config.phoneColumns || ["phone"];
  const dateColumns = config.dateColumns || ["order_date"];
  const hasCountry = results[0]?.data && "country_code" in results[0].data;
  const hasAmount = results[0]?.data && "amount" in results[0].data;
  const hasEmail = results[0]?.data && "email" in results[0].data;
  const hasPayment = results[0]?.data && "payment_mode" in results[0].data;

  function pct(filterFn) {
    return ((results.filter(filterFn).length / total) * 100).toFixed(1);
  }

  const cats = [];

  if (phoneColumns.length > 0)
    cats.push({
      label: "Phone Numbers",
      passRate: pct(r => !r.errors.some(e =>
        e.toLowerCase().includes("phone") || e.toLowerCase().includes("digits")
      )),
    });

  if (dateColumns.length > 0)
    cats.push({
      label: "Dates & Times",
      passRate: pct(r => !r.errors.some(e =>
        e.toLowerCase().includes("date") ||
        e.toLowerCase().includes("time") ||
        e.toLowerCase().includes("calendar")
      )),
    });

  if (hasPayment)
    cats.push({
      label: "Payment Modes",
      passRate: pct(r => !r.errors.some(e => e.toLowerCase().includes("payment"))),
    });

  if (hasAmount)
    cats.push({
      label: "Amounts",
      passRate: pct(r => !r.errors.some(e => e.toLowerCase().includes("amount"))),
    });

  if (hasEmail)
    cats.push({
      label: "Emails",
      passRate: pct(r => !r.errors.some(e => e.toLowerCase().includes("email"))),
    });

  if (hasCountry)
    cats.push({
      label: "Country Codes",
      passRate: pct(r => !r.errors.some(e => e.toLowerCase().includes("country"))),
    });

  cats.push({
    label: "Required Fields",
    passRate: pct(r => !r.errors.some(e =>
      e.toLowerCase().includes("missing") || e.toLowerCase().includes("required")
    )),
  });

  if (config.flagDuplicates)
    cats.push({
      label: "Unique Order IDs",
      passRate: pct(r => !r.errors.some(e => e.toLowerCase().includes("duplicate"))),
    });

  return cats;
}

export default function AISummary({ results, config }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const stats = buildValidationStats(results);
  const categories = computeCategoryHealth(results, config);

  async function generateSummary() {
    setLoading(true);
    setError(null);
    setSummary(null);

    const categoryLines = categories
      .map(c => `  • ${c.label}: ${c.passRate}%`)
      .join("\n");

    const worstCat = [...categories].sort((a, b) => parseFloat(a.passRate) - parseFloat(b.passRate))[0];

    const worstCountry = Object.entries(stats.countryFails)
      .sort((a, b) => b[1] - a[1])[0];
    const worstCountryLine = worstCountry
      ? `${worstCountry[0]}: ${worstCountry[1]}/${stats.countryCounts[worstCountry[0]] || "?"} rows failed`
      : "N/A";

    const prompt = `You are a senior data quality analyst. Write a professional validation report using ONLY these exact numbers — do not invent or round differently.

RESULTS:
- Total rows: ${stats.total}
- Passed: ${stats.passed} (${stats.passRate}%)
- Failed: ${stats.failed} (${(100 - parseFloat(stats.passRate)).toFixed(1)}%)

CATEGORY HEALTH:
${categoryLines}

WORST CATEGORY: ${worstCat?.label} at ${worstCat?.passRate}%
WORST COUNTRY/REGION: ${worstCountryLine}

Write exactly 4 sentences:
1. Overall verdict with exact pass/fail numbers and percentage.
2. Name the weakest category from the health data with its exact percentage and what it means operationally.
3. Recommend the one change that would yield the largest improvement in pass rate, and explain why.
4. Risk verdict — is this dataset safe for operations as-is? Be direct and firm.

No bullet points. No subject line. No preamble like "Here is the report". Just 4 plain sentences.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const d = await response.json();
        throw new Error(d.error?.message || "Groq API error");
      }

      const data = await response.json();
      setSummary(data.choices[0].message.content.trim());
    } catch (err) {
      setError("Failed to generate summary: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-summary">

      {/* Header */}
      <div className="ai-header">
        <span className="ai-badge">AI</span>
        <h3>AI Validation Summary</h3>
      </div>

      {/* Generate button */}
      <button
        className="btn-primary"
        onClick={generateSummary}
        disabled={loading || !results}
        style={{ marginBottom: 16 }}
      >
        {loading ? "Analysing..." : "Generate AI Summary"}
      </button>

      {error && <p className="ai-error">{error}</p>}

      {/* Pass / Fail / Rate — always visible after validation */}
      <div className="ai-stats-strip">
        <span className="ai-stat green">✓ {stats.passed} passed</span>
        <span className="ai-stat red">✗ {stats.failed} failed</span>
        <span className="ai-stat blue">{stats.passRate}% pass rate</span>
      </div>

      {/* Validation Health by Category — always visible */}
      <div className="ai-health-section">
        <p className="ai-health-title">Validation Health by Category</p>
        {categories.map(cat => (
          <CategoryHealthBar key={cat.label} label={cat.label} passRate={cat.passRate} />
        ))}
      </div>

      {/* AI text — only shown after Generate is clicked */}
      {summary && (
        <div className="ai-output">
          <p>{summary}</p>
        </div>
      )}

    </div>
  );
}