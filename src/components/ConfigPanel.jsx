// src/components/ConfigPanel.jsx
import { useEffect, useState } from "react";
import { PHONE_RULES } from "../utils/phoneRules";

const ALL_DATE_FORMATS = [
  { pattern: "YYYY-MM-DD", example: "2025-04-16" },
  { pattern: "DD/MM/YYYY", example: "16/04/2025" },
  { pattern: "MM/DD/YYYY", example: "04/16/2025" },
  { pattern: "DD-MM-YYYY", example: "16-04-2025" },
  { pattern: "YYYY/MM/DD", example: "2025/04/16" },
];

const INITIAL_COUNTRY_RULES = Object.entries(PHONE_RULES).map(([code, rule]) => ({
  code,
  digits: rule.digits,
}));

export default function ConfigPanel({ config, onChange, columns, hasCountryColumn, hasTimeColumn }) {
  const [phoneColumns, setPhoneColumns] = useState(["phone"].filter(c => columns.includes(c)));
  const [dateColumns, setDateColumns] = useState(["order_date", "order_time"].filter(c => columns.includes(c)));
  const [countryRules, setCountryRules] = useState(INITIAL_COUNTRY_RULES);
  const [addingRule, setAddingRule] = useState(false);
  const [newRule, setNewRule] = useState({ code: "", digits: "" });
  // Active date formats — checkboxes
  const [activeDateFmts, setActiveDateFmts] = useState(["YYYY-MM-DD"]);
  const [requiredFields, setRequiredFields] = useState(
    columns.filter(c => ["order_id", "customer_name", "email", "product_name", "order_date"].includes(c))
  );
  const [generalSettings, setGeneralSettings] = useState({
    flagDuplicates: true,
    flagNegativeAmounts: true,
    validateEmail: true,
    trimWhitespace: true,
    chunkSize: config.chunkSize || 1000,
  });

  // Sync to parent
  useEffect(() => {
    onChange({
      ...config,
      phoneColumns,
      dateColumns,
      countryRules,
      dateFormats: activeDateFmts,
      requiredFields,
      ...generalSettings,
    });
  }, [phoneColumns, dateColumns, countryRules, activeDateFmts, requiredFields, generalSettings]);

  // Default chunk size = actual row count
  useEffect(() => {
    if (config.totalRows && generalSettings.chunkSize === 1000) {
      setGeneralSettings(prev => ({ ...prev, chunkSize: config.totalRows }));
    }
  }, [config.totalRows]);

  function toggleList(list, setList, item) {
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  }

  function updateGeneral(key, value) {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  }

  function updateCountryDigits(code, digits) {
    setCountryRules(prev => prev.map(r => r.code === code ? { ...r, digits: parseInt(digits) || r.digits } : r));
  }

  function removeCountryRule(code) {
    setCountryRules(prev => prev.filter(r => r.code !== code));
  }

  function confirmAddRule() {
    const code = newRule.code.trim().toUpperCase();
    const digits = parseInt(newRule.digits);
    if (!code || isNaN(digits) || digits < 1) return;
    setCountryRules(prev => {
      const filtered = prev.filter(r => r.code !== code);
      return [...filtered, { code, digits }];
    });
    setNewRule({ code: "", digits: "" });
    setAddingRule(false);
  }

  // ── Styles ─────────────────────────────────────────────

  const card = {
    background: "#fff", border: "1px solid rgba(54,76,132,0.12)",
    borderRadius: 12, padding: "20px 22px",
  };
  const sectionTitle = {
    fontSize: 14, fontWeight: 700, color: "#000000",
    marginBottom: 4, display: "flex", alignItems: "center", gap: 7,
  };
  const sectionSub = { fontSize: 12, color: "#8a9ab5", marginBottom: 14 };
  const colLabel = {
    display: "flex", alignItems: "center", gap: 9,
    padding: "5px 0", fontSize: 13, color: "#374151",
    cursor: "pointer", userSelect: "none",
  };
  const divider = { borderTop: "1px solid rgba(54,76,132,0.08)", margin: "16px 0" };
  const subHeading = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
    textTransform: "uppercase", color: "#8a9ab5", marginBottom: 10,
  };

  // ── Sub-components ─────────────────────────────────────

  function Checkbox({ checked, onChange: onCh, label, sublabel }) {
    return (
      <label style={colLabel}>
        <span style={{
          width: 16, height: 16, borderRadius: 4, flexShrink: 0,
          border: checked ? "none" : "1.5px solid rgba(54,76,132,0.25)",
          background: checked ? "#364C84" : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}>
          {checked && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <input type="checkbox" checked={checked} onChange={onCh}
            style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
        </span>
        <span>
          {label}
          {sublabel && <span style={{ fontSize: 11, color: "#8a9ab5", marginLeft: 6 }}>{sublabel}</span>}
        </span>
      </label>
    );
  }

  function Toggle({ checked, onChange: onCh, label }) {
    return (
      <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", cursor: "pointer" }}>
        <span style={{
          width: 36, height: 20, borderRadius: 10, flexShrink: 0,
          background: checked ? "#364C84" : "rgba(54,76,132,0.2)",
          position: "relative", transition: "background 0.2s", display: "inline-block",
        }}>
          <span style={{
            position: "absolute", top: 2, left: checked ? 18 : 2,
            width: 16, height: 16, borderRadius: "50%", background: "#fff",
            transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }} />
          <input type="checkbox" checked={checked} onChange={onCh}
            style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
        </span>
        <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
      </label>
    );
  }

  function CountryRuleRow({ code, digits }) {
    return (
      <div style={{
        display: "grid", gridTemplateColumns: "72px 1fr 44px 28px",
        alignItems: "center", gap: 8, marginBottom: 8,
      }}>
        <div style={{
          padding: "7px 10px", border: "1px solid rgba(54,76,132,0.15)", borderRadius: 8,
          fontSize: 13, fontWeight: 600, color: "#364C84", background: "rgba(149,177,238,0.08)",
          textAlign: "center",
        }}>{code}</div>
        <input
          type="number" value={digits} min={1} max={15}
          onChange={e => updateCountryDigits(code, e.target.value)}
          style={{
            padding: "7px 10px", border: "1px solid rgba(54,76,132,0.15)", borderRadius: 8,
            fontSize: 13, color: "#374151", background: "#fff", width: "100%",
          }}
        />
        <span style={{ fontSize: 12, color: "#8a9ab5", textAlign: "center" }}>digits</span>
        <button
          onClick={() => removeCountryRule(code)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#8a9ab5", fontSize: 16, padding: 0, lineHeight: 1,
          }}
        >✕</button>
      </div>
    );
  }

  // ── SVG icons ──────────────────────────────────────────

  const PhoneIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#364C84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
  const CalIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#364C84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
  const KeyIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#364C84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
  const GearIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#364C84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
  const FileIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#364C84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );

  // ── Render ─────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Row 1: Phone + Date */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Phone Number Columns */}
        <div style={card}>
          <div style={sectionTitle}><PhoneIcon /> Phone Number Columns</div>
          <p style={sectionSub}>Select which columns contain phone numbers</p>
          {columns.map(col => (
            <Checkbox key={col} label={col}
              checked={phoneColumns.includes(col)}
              onChange={() => toggleList(phoneColumns, setPhoneColumns, col)}
            />
          ))}

          <div style={divider} />
          <p style={subHeading}>Country Rules (Configurable)</p>

          {countryRules.map(r => (
            <CountryRuleRow key={r.code} code={r.code} digits={r.digits} />
          ))}

          {addingRule ? (
            <div style={{
              display: "grid", gridTemplateColumns: "72px 1fr 44px 60px",
              alignItems: "center", gap: 8, marginBottom: 8,
            }}>
              <input
                autoFocus
                placeholder="Code"
                maxLength={3}
                value={newRule.code}
                onChange={e => setNewRule(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                style={{
                  padding: "7px 10px", border: "1.5px solid #364C84",
                  borderRadius: 8, fontSize: 13, width: "100%",
                }}
              />
              <input
                type="number" placeholder="Digits" min={1} max={15}
                value={newRule.digits}
                onChange={e => setNewRule(p => ({ ...p, digits: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && confirmAddRule()}
                style={{
                  padding: "7px 10px", border: "1.5px solid #364C84",
                  borderRadius: 8, fontSize: 13, width: "100%",
                }}
              />
              <span style={{ fontSize: 12, color: "#8a9ab5", textAlign: "center" }}>digits</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={confirmAddRule} style={{
                  padding: "6px 10px", background: "#364C84", color: "#FFFDF5",
                  border: "none", borderRadius: 6, fontSize: 12,
                  cursor: "pointer", fontWeight: 600,
                }}>✓</button>
                <button onClick={() => { setAddingRule(false); setNewRule({ code: "", digits: "" }); }}
                  style={{
                    padding: "6px 8px", background: "rgba(149,177,238,0.1)", color: "#364C84",
                    border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer",
                  }}>✕</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingRule(true)} style={{
              padding: "7px 14px", background: "#fff",
              border: "1.5px dashed rgba(149,177,238,0.6)", borderRadius: 8,
              color: "#364C84", fontSize: 13, fontWeight: 600,
              cursor: "pointer", marginTop: 4, width: "100%",
            }}>+ Add Country Rule</button>
          )}
        </div>

        {/* Date / DateTime Columns */}
        <div style={card}>
          <div style={sectionTitle}><CalIcon /> Date / DateTime Columns</div>
          <p style={sectionSub}>Select which columns contain dates or times</p>
          {columns.map(col => (
            <Checkbox key={col} label={col}
              checked={dateColumns.includes(col)}
              onChange={() => toggleList(dateColumns, setDateColumns, col)}
            />
          ))}

          <div style={divider} />
          <p style={subHeading}>Accepted Date Formats</p>
          <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10 }}>
            Check the formats your date columns may contain
          </p>
          {ALL_DATE_FORMATS.map(fmt => (
            <Checkbox
              key={fmt.pattern}
              label={fmt.pattern}
              sublabel={`→ ${fmt.example}`}
              checked={activeDateFmts.includes(fmt.pattern)}
              onChange={() => toggleList(activeDateFmts, setActiveDateFmts, fmt.pattern)}
            />
          ))}

          <div style={divider} />
          <p style={{ fontSize: 11, color: "#9ca3af" }}>
            Time columns auto-validated as <strong>HH:mm:ss</strong> or <strong>HH:mm</strong>
          </p>
        </div>
      </div>

      {/* Row 2: Required Fields + General Settings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Required Fields */}
        <div style={card}>
          <div style={sectionTitle}><KeyIcon /> Required Fields</div>
          <p style={sectionSub}>Rows missing these fields will be flagged as invalid</p>
          {columns.map(col => (
            <Checkbox key={col} label={col}
              checked={requiredFields.includes(col)}
              onChange={() => toggleList(requiredFields, setRequiredFields, col)}
            />
          ))}
        </div>

        {/* General Settings */}
        <div style={card}>
          <div style={sectionTitle}><GearIcon /> General Settings</div>
          <p style={sectionSub}>Data integrity and processing options</p>

          <Toggle
            checked={generalSettings.flagDuplicates}
            onChange={e => updateGeneral("flagDuplicates", e.target.checked)}
            label="Detect duplicate Order IDs"
          />
          <Toggle
            checked={generalSettings.flagNegativeAmounts}
            onChange={e => updateGeneral("flagNegativeAmounts", e.target.checked)}
            label="Reject negative or zero amounts"
          />
          <Toggle
            checked={generalSettings.validateEmail}
            onChange={e => updateGeneral("validateEmail", e.target.checked)}
            label="Validate email format"
          />
          <Toggle
            checked={generalSettings.trimWhitespace}
            onChange={e => updateGeneral("trimWhitespace", e.target.checked)}
            label="Trim whitespace automatically"
          />

          <div style={divider} />

          <label style={{
            fontSize: 13, color: "#374151",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <FileIcon />
            Chunk size
            <input
              type="number" min={1}
              value={generalSettings.chunkSize}
              onChange={e => updateGeneral("chunkSize", parseInt(e.target.value) || 1)}
              style={{
                width: 80, padding: "6px 10px",
                border: "1px solid rgba(54,76,132,0.15)", borderRadius: 8,
                fontSize: 13, textAlign: "center",
              }}
            />
            <span style={{ fontSize: 12, color: "#8a9ab5" }}>rows per file</span>
          </label>
        </div>
      </div>
    </div>
  );
}