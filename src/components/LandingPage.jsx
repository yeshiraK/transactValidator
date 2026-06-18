// src/components/LandingPage.jsx
import { useRef } from "react";
import "../LandingPage.css";

const FEATURE_CHIPS = [
  "Phone Validation",
  "Date & Time Validation",
  "Duplicate Detection",
  "AI Validation Summary",
  "Error Reports",
  "Auto Chunking",
];

const EXPECTED_COLUMNS = [
  "order_id",
  "customer_name",
  "phone",
  "country_code",
  "order_date",
  "order_time",
  "payment_mode",
  "product_name",
  "amount",
];

const SAMPLE_CSV_DATA = [
  "order_id,customer_name,phone,country_code,order_date,order_time,payment_mode,product_name,amount",
  "ORD001,Alice Johnson,+14155552671,US,2024-01-15,14:30:00,Credit Card,Widget Pro,129.99",
  "ORD002,Bob Smith,+442071838750,GB,2024-01-16,09:15:00,PayPal,Gadget Basic,49.50",
  "ORD003,Carlos Rivera,+525512345678,MX,2024-01-17,18:45:00,Debit Card,Widget Lite,79.00",
  "ORD004,Diana Chen,+861012345678,CN,2024-01-18,11:00:00,Credit Card,Premium Pack,299.99",
  "ORD005,Eve Müller,+4930123456,DE,2024-01-19,16:20:00,Bank Transfer,Widget Pro,129.99",
].join("\n");

function downloadSampleCSV() {
  const blob = new Blob([SAMPLE_CSV_DATA], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sample_transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function LandingPage({ onGetStarted }) {
  const uploadSectionRef = useRef(null);

  function scrollToUpload() {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="lp-root">
      {/* ── HERO SECTION ──────────────────────────────────── */}
      <section className="lp-hero">
        {/* Subtle grid background */}
        <div className="lp-grid-bg" aria-hidden="true" />

        {/* Decorative shapes */}
        <div className="lp-deco" aria-hidden="true">
          <div className="lp-deco-blob lp-deco-blob-1" />
          <div className="lp-deco-dots">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="lp-dot" />
            ))}
          </div>
          <div className="lp-deco-blob lp-deco-blob-2" />
          <div className="lp-deco-ring lp-deco-ring-1" />
          <div className="lp-deco-ring lp-deco-ring-2" />
        </div>

        <div className="lp-hero-inner">
          {/* Badge */}
          <div className="lp-badge">
            <span className="lp-badge-icon">✦</span>
            Intelligent Transaction Data Validation Platform
          </div>

          {/* Heading */}
          <h1 className="lp-hero-heading">
            Validate, Clean and Process
            <br />
            <span className="lp-hero-highlight">Transaction Data</span>
            <br />
            with Confidence
          </h1>

          {/* Subheading */}
          <p className="lp-hero-sub">
            Upload CSV files, detect data quality issues, generate clean outputs,
            and download chunked datasets — all in seconds, entirely in your browser.
          </p>

          {/* Feature chips */}
          <div className="lp-chips">
            {FEATURE_CHIPS.map((chip) => (
              <span key={chip} className="lp-chip">
                <span className="lp-chip-dot" />
                {chip}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="lp-cta-row">
            <button
              id="lp-upload-btn"
              className="lp-btn-primary"
              onClick={onGetStarted}
            >
              Upload CSV
              <span className="lp-btn-arrow">→</span>
            </button>
            <button
              id="lp-learn-more-btn"
              className="lp-btn-secondary"
              onClick={scrollToUpload}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── UPLOAD CSV SECTION ────────────────────────────── */}
      <section className="lp-upload-section" ref={uploadSectionRef} id="upload-section">
        <div className="lp-upload-inner">
          {/* Section label */}
          <p className="lp-section-label">Get Started</p>

          <h2 className="lp-upload-title">Upload Your CSV</h2>
          <p className="lp-upload-sub">
            Supported fields:{" "}
            <span className="lp-upload-fields">
              order_id, customer_name, phone, country_code, order_date,
              order_time, payment_mode, product_name, amount
            </span>
          </p>

          {/* Large upload card */}
          <div
            className="lp-upload-card"
            id="lp-drop-card"
            role="button"
            tabIndex={0}
            aria-label="Upload CSV file — click or drag and drop"
            onClick={onGetStarted}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onGetStarted();
            }}
          >
            <div className="lp-upload-card-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="14" fill="#EFF4FD" />
                <path
                  d="M24 14v14m0-14l-5 5m5-5l5 5"
                  stroke="#364C84"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 32h20"
                  stroke="#95B1EE"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="lp-upload-drag-text">Drag &amp; drop your CSV</p>
            <p className="lp-upload-browse">
              or <span className="lp-upload-browse-link">browse files</span>
            </p>

            {/* Constraint pills */}
            <div className="lp-upload-pills">
              <span className="lp-pill">CSV only</span>
              <span className="lp-pill">Up to 50 MB</span>
              <span className="lp-pill">Client-side processing</span>
            </div>
          </div>

          {/* Expected columns */}
          <div className="lp-expected-cols">
            <p className="lp-expected-label">Expected columns:</p>
            <div className="lp-col-chips">
              {EXPECTED_COLUMNS.map((col) => (
                <span key={col} className="lp-col-chip">
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Sample CSV link */}
          <p className="lp-sample-link-row">
            <button
              id="lp-sample-csv-btn"
              className="lp-sample-link"
              onClick={downloadSampleCSV}
            >
              ↓ Download sample CSV for testing
            </button>
          </p>
        </div>
      </section>

      {/* ── LANDING FOOTER ────────────────────────────────── */}
      <footer className="lp-footer">
        <p>
          <span className="lp-footer-logo">✦ TransactValidator</span> · Built
          with React + Groq AI · Xeno Internship Assignment
        </p>
      </footer>
    </div>
  );
}
