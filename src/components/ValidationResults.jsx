// src/components/ValidationResults.jsx
import { useState, useMemo } from "react";

// Only used in Data Preview issues column
function getErrorChips(errors) {
  const chips = [];
  const added = new Set();

  const rules = [
    { keywords: ["phone", "digits"], label: "Phone", color: "#6366f1", bg: "#ede9fe" },
    { keywords: ["date", "calendar", "format"], label: "Date", color: "#0891b2", bg: "#e0f2fe" },
    { keywords: ["time"], label: "Time", color: "#7c3aed", bg: "#f5f3ff" },
    { keywords: ["payment", "mode"], label: "Payment", color: "#d97706", bg: "#fef3c7" },
    { keywords: ["amount"], label: "Amount", color: "#dc2626", bg: "#fee2e2" },
    { keywords: ["email"], label: "Email", color: "#059669", bg: "#d1fae5" },
    { keywords: ["country"], label: "Country", color: "#db2777", bg: "#fce7f3" },
    { keywords: ["duplicate"], label: "Duplicate", color: "#ea580c", bg: "#ffedd5" },
    { keywords: ["missing", "required"], label: "Missing", color: "#64748b", bg: "#f1f5f9" },
    { keywords: ["customer_name", "too short", "numbers"], label: "Name", color: "#16a34a", bg: "#dcfce7" },
  ];

  errors.forEach(e => {
    const lower = e.toLowerCase();
    for (const rule of rules) {
      if (rule.keywords.some(k => lower.includes(k)) && !added.has(rule.label)) {
        chips.push(rule);
        added.add(rule.label);
        break;
      }
    }
  });

  return chips;
}

export default function ValidationResults({ results }) {
  const [activeTab, setActiveTab] = useState("errors");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterField, setFilterField] = useState("all");

  if (!results) return null;

  const passed = results.filter(r => r.valid);
  const failed = results.filter(r => !r.valid);
  const allFields = results.length > 0 ? Object.keys(results[0].data) : [];

  // Unique error types for dropdown — from actual error text
  const errorTypes = useMemo(() => {
    const types = new Set();
    failed.forEach(r => r.errors.forEach(e => {
      const key = e.split(":")[0].replace(/"/g, "").trim();
      types.add(key);
    }));
    return Array.from(types);
  }, [failed]);

  // Filtered errors for Errors tab
  const filteredErrors = useMemo(() => {
    return failed.filter(r => {
      const matchSearch = searchQuery === "" || (
        r.errors.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(r.data.order_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(r.rowNumber).includes(searchQuery)
      );
      const matchType = filterType === "all" ||
        r.errors.some(e => e.split(":")[0].replace(/"/g, "").trim() === filterType);
      const matchField = filterField === "all" ||
        r.errors.some(e => e.toLowerCase().includes(filterField.toLowerCase()));
      return matchSearch && matchType && matchField;
    });
  }, [failed, searchQuery, filterType, filterField]);

  const passRate = results.length > 0
    ? Math.round((passed.length / results.length) * 100)
    : 0;

  // ── Styles ─────────────────────────────────────────────

  const tabStyle = (active) => ({
    padding: "10px 20px", fontSize: 14, fontWeight: 600,
    cursor: "pointer", border: "none",
    borderBottom: active ? "2px solid #364C84" : "2px solid transparent",
    color: active ? "#364C84" : "#8a9ab5",
    background: "none", transition: "all 0.15s",
  });

  const pill = (active) => ({
    marginLeft: 8, fontSize: 11, fontWeight: 700,
    background: active ? "rgba(149,177,238,0.2)" : "rgba(54,76,132,0.06)",
    color: active ? "#364C84" : "#9ca3af",
    padding: "2px 7px", borderRadius: 10,
  });

  const inputBase = {
    padding: "8px 12px", border: "1px solid rgba(54,76,132,0.15)",
    borderRadius: 8, fontSize: 13, color: "#374151",
    background: "#FFFDF5", outline: "none",
  };

  const selectBase = {
    ...inputBase, cursor: "pointer",
    appearance: "none", paddingRight: 32,
  };

  const th = {
    padding: "10px 14px", textAlign: "left",
    fontWeight: 600, fontSize: 11,
    borderBottom: "1px solid rgba(54,76,132,0.1)",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#8a9ab5",
    background: "#f8f9fc",
  };

  const td = { padding: "10px 14px", verticalAlign: "top" };

  // ── Render ─────────────────────────────────────────────

  return (
    <div>

      {/* ── STAT CARDS ─────────────────────────────────── */}
      <div className="stats-row">
        <div className="stat-card green">
          <span className="stat-num">{passed.length}</span>
          <span className="stat-label">Passed Rows</span>
        </div>
        <div className="stat-card red">
          <span className="stat-num">{failed.length}</span>
          <span className="stat-label">Failed Rows</span>
        </div>
        <div className="stat-card blue">
          <span className="stat-num">{results.length}</span>
          <span className="stat-label">Total Rows</span>
        </div>
        <div className="stat-card amber">
          <span className="stat-num">{passRate}%</span>
          <span className="stat-label">Pass Rate</span>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────── */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(54,76,132,0.12)", margin: "24px 0 20px", gap: 4 }}>
        <button style={tabStyle(activeTab === "errors")} onClick={() => setActiveTab("errors")}>
          Errors <span style={pill(activeTab === "errors")}>{failed.length}</span>
        </button>
        <button style={tabStyle(activeTab === "preview")} onClick={() => setActiveTab("preview")}>
          Data Preview <span style={pill(activeTab === "preview")}>{failed.length}</span>
        </button>
      </div>

      {/* ── ERRORS TAB ─────────────────────────────────── */}
      {activeTab === "errors" && (
        <div>
          {/* Search + filters — exactly as before */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                style={{ ...inputBase, width: "100%", paddingLeft: 32 }}
                placeholder="Search issues..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ position: "relative" }}>
              <select style={{ ...selectBase, minWidth: 140 }}
                value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                {errorTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            <div style={{ position: "relative" }}>
              <select style={{ ...selectBase, minWidth: 140 }}
                value={filterField} onChange={e => setFilterField(e.target.value)}>
                <option value="all">All Fields</option>
                {allFields.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Filter result count */}
          {(searchQuery || filterType !== "all" || filterField !== "all") && (
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
              Showing {filteredErrors.length} of {failed.length} failed rows
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}

          {filteredErrors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 14 }}>
              {failed.length === 0
                ? "No errors found — all rows passed!"
                : "No errors match your current filter"}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={th}>Row #</th>
                    <th style={th}>Order ID</th>
                    <th style={th}>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredErrors.map(r => (
                    <tr key={r.rowNumber} style={{ borderBottom: "1px solid rgba(54,76,132,0.07)" }}>
                      <td style={{ ...td, color: "#9ca3af", width: 60 }}>{r.rowNumber}</td>
                      <td style={{ ...td, fontWeight: 500, width: 130 }}>
                        {r.data.order_id || <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={td}>
                        <ul className="error-list">
                          {r.errors.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredErrors.length > 50 && (
                <p className="more-rows">
                  ...and {filteredErrors.length - 50} more (download Error Report CSV for full details)
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── DATA PREVIEW TAB ───────────────────────────── */}
      {activeTab === "preview" && (
        <div>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
            Previewing <strong>{failed.length}</strong> rows with validation issues.{" "}
            <span style={{ color: "#dc2626", fontWeight: 500 }}>Red rows</span> have validation issues.{" "}
            The <strong>Issues</strong> column shows affected categories.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#364C84" }}>
                  <th style={{ ...th, color: "#fff", background: "#111827", borderColor: "#374151" }}>#</th>
                  {allFields.map(f => (
                    <th key={f} style={{
                      ...th, color: "#FFFDF5", background: "#364C84",
                      borderColor: "rgba(255,255,255,0.12)", whiteSpace: "nowrap",
                    }}>{f}</th>
                  ))}
                  <th style={{ ...th, color: "#FFFDF5", background: "#364C84", borderColor: "rgba(255,255,255,0.12)" }}>Issues</th>
                </tr>
              </thead>
              <tbody>
                {failed.map(r => {
                  const chips = getErrorChips(r.errors);
                  return (
                    <tr key={r.rowNumber} style={{ background: "rgba(254,242,242,0.7)", borderBottom: "1px solid rgba(254,202,202,0.5)" }}>
                      <td style={{ ...td, color: "#9ca3af", width: 40, verticalAlign: "middle" }}>{r.rowNumber}</td>
                      {allFields.map(f => (
                        <td key={f} style={{
                          ...td, whiteSpace: "nowrap", verticalAlign: "middle",
                          maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {r.data[f] !== undefined && r.data[f] !== null && r.data[f] !== ""
                            ? r.data[f]
                            : <span style={{ color: "#fca5a5" }}>—</span>}
                        </td>
                      ))}
                      <td style={{ ...td, verticalAlign: "middle" }}>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {chips.map(chip => (
                            <span key={chip.label} style={{
                              background: chip.bg, color: chip.color,
                              padding: "3px 8px", borderRadius: 5,
                              fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                            }}>
                              {chip.label}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}