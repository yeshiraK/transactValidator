// src/App.jsx
import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ConfigPanel from "./components/ConfigPanel";
import ValidationResults from "./components/ValidationResults";
import AISummary from "./components/AISummary";
import DownloadPanel from "./components/DownloadPanel";
import { validateRows } from "./utils/validator";
import "./App.css";

const DEFAULT_CONFIG = {
  countryCode: "AUTO",
  dateFormat: "YYYY-MM-DD",
  timeFormat: "HH:MM:SS",
  chunkSize: 1000,
  strictMode: false,
  flagDuplicates: true,
  flagNegativeAmounts: true,
  validateEmail: true,
  trimWhitespace: true,
  allowUnknownCountry: false,
  phoneColumns: ["phone"],
  dateColumns: ["order_date", "order_time"],
  countryRules: [],
  dateFormats: ["YYYY-MM-DD"],
  requiredFields: [],
  totalRows: 0,
};

const FEATURE_CHIPS = [
  "Phone Validation",
  "Date & Time Validation",
  "Duplicate Detection",
  "AI Validation Summary",
  "Error Reports",
  "Auto Chunking",
];

// page: "upload" | "config" | "results"
export default function App() {
  const [page, setPage] = useState("upload");
  const [fileData, setFileData] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [results, setResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Step number for indicator
  const stepIndex = { upload: 0, config: 1, results: 2 };

  function handleDataLoaded(data) {
    setFileData(data);
    setResults(null);
    setConfig(prev => ({
      ...DEFAULT_CONFIG,
      chunkSize: data.totalRows,
      totalRows: data.totalRows,
    }));
    setPage("config");
  }

  function handleValidate() {
    if (!fileData) return;
    setIsValidating(true);
    setTimeout(() => {
      const res = validateRows(fileData.rows, config);
      setResults(res);
      setIsValidating(false);
      setPage("results");
    }, 100);
  }

  function goBack() {
    if (page === "config") { setPage("upload"); }
    if (page === "results") { setPage("config"); }
  }

  function handleReset() {
    setFileData(null);
    setResults(null);
    setConfig(DEFAULT_CONFIG);
    setPage("upload");
  }

  const columns = fileData?.fields ?? [];
  const step = stepIndex[page];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text">TransactValidator</span>
          </div>
          <p className="header-sub">Transaction data validation &amp; processing platform</p>
        </div>
      </header>

      <main className="app-main">

        {/* Step indicators */}
        <div className="steps">
          {["Upload", "Column Mapping & Rules", "Results"].map((label, i) => (
            <div key={i} className={`step ${step > i ? "done" : ""} ${step === i ? "active" : ""}`}>
              <span className="step-num">{step > i ? "✓" : i + 1}</span>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── PAGE 1: Upload (Hero) ────────────────────────── */}
        {page === "upload" && (
          <section className="card page-card upload-hero-card">

            {/* Grid background */}
            <div className="hero-grid-bg" aria-hidden="true" />

            {/* Decorative right-side shapes */}
            <div className="hero-deco" aria-hidden="true">
              <div className="hero-deco-blob hero-deco-blob-1" />
              <div className="hero-deco-blob hero-deco-blob-2" />
              <div className="hero-deco-dots">
                {Array.from({ length: 20 }).map((_, i) => (
                  <span key={i} className="hero-dot" />
                ))}
              </div>
            </div>

            {/* Hero content */}
            <div className="hero-content">
              {/* Badge */}
              <div className="hero-badge">
                <span className="hero-badge-icon">✦</span>
                Intelligent Transaction Data Validation Platform
              </div>

              {/* Heading */}
              <h1 className="hero-heading">
                Validate, Clean and Process{" "}
                <span className="hero-heading-highlight">Transaction Data</span>{" "}
                with Confidence
              </h1>

              {/* Subtitle */}
              <p className="hero-sub">
                Upload CSV files, detect data quality issues, generate clean outputs,
                and download chunked datasets — all in seconds, entirely in your browser.
              </p>

              {/* Feature chips */}
              <div className="hero-chips">
                {FEATURE_CHIPS.map(chip => (
                  <span key={chip} className="hero-chip">
                    <span className="hero-chip-dot" aria-hidden="true" />
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Upload component — untouched, exactly as before */}
            <div className="upload-zone-wrapper">
              <FileUpload onDataLoaded={handleDataLoaded} />
              {fileData && (
                <div className="file-info">
                  <span>✓ <strong>{fileData.fileName}</strong></span>
                  <span>{fileData.totalRows.toLocaleString()} rows</span>
                  <span>{fileData.fields.length} columns</span>
                </div>
              )}
            </div>

          </section>
        )}

        {/* ── PAGE 2: Config ─────────────────────────────── */}
        {page === "config" && (
          <section className="card page-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "#364C84", color: "#FFFDF5",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 15, flexShrink: 0,
              }}>2</span>
              <h2 style={{ margin: 0 }}>Column Mapping &amp; Rules</h2>
            </div>

            {/* File info bar */}
            {fileData && (
              <div className="file-info-bar">
                <span>✓ {fileData.fileName}</span>
                <span>· {fileData.totalRows} rows</span>
                <span>· {fileData.fields.length} columns</span>
              </div>
            )}

            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              Choose which columns to apply the right validation rules.
            </p>

            <ConfigPanel
              config={config}
              onChange={setConfig}
              columns={columns}
              hasCountryColumn={columns.includes("country_code")}
              hasTimeColumn={columns.includes("order_time")}
            />

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button className="btn-secondary" onClick={goBack}>← Back</button>
              <button
                className="btn-primary"
                onClick={handleValidate}
                disabled={isValidating}
                style={{ flex: 1 }}
              >
                {isValidating ? "⏳ Validating..." : "Run Validation →"}
              </button>
            </div>
          </section>
        )}

        {/* ── PAGE 3: Results ────────────────────────────── */}
        {page === "results" && results && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Back button at top */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="btn-secondary" onClick={goBack}>← Back to Rules</button>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>
                {fileData?.fileName} · {results.length} rows processed
              </span>
            </div>

            {/* Validation results (tabs) */}
            <section className="card">
              <h2 style={{ marginBottom: 16 }}>Validation Results</h2>
              <ValidationResults results={results} />
            </section>

            {/* AI Summary */}
            <section className="card">
              <AISummary results={results} config={config} />
            </section>

            {/* Downloads */}
            <section className="card">
              <DownloadPanel results={results} config={config} />
            </section>

            {/* Start over */}
            <div className="reset-row">
              <button className="btn-secondary" onClick={handleReset}>↺ Start over</button>
            </div>
          </div>
        )}

      </main>

      <footer className="app-footer">
        <p>TransactValidator · Built with React + Groq AI · Xeno Internship Assignment</p>
      </footer>
    </div>
  );
}