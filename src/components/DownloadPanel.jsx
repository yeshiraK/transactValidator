// src/components/DownloadPanel.jsx
import { rowsToCSV, buildZipWithChunks, downloadBlob } from "../utils/chunker";

export default function DownloadPanel({ results, config }) {
  if (!results) return null;

  const validRows = results.filter((r) => r.valid).map((r) => r.data);
  const errorRows = results
    .filter((r) => !r.valid)
    .map((r) => ({ ...r.data, _errors: r.errors.join(" | "), _row: r.rowNumber }));

  function downloadCleaned() {
    const csv = rowsToCSV(validRows);
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, "cleaned_validated.csv");
  }

  function downloadErrors() {
    const csv = rowsToCSV(errorRows);
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, "error_report.csv");
  }

  async function downloadChunks() {
    const { blob, count } = await buildZipWithChunks(validRows, config.chunkSize);
    downloadBlob(blob, `cleaned_${count}_chunks.zip`);
  }

  return (
    <div className="download-panel">
      <h3>Download Outputs</h3>
      <div className="download-buttons">
        <button className="btn-download green" onClick={downloadCleaned} disabled={validRows.length === 0}>
          ⬇ Cleaned CSV
          <span className="btn-sub">{validRows.length} valid rows</span>
        </button>
        <button className="btn-download red" onClick={downloadErrors} disabled={errorRows.length === 0}>
          ⬇ Error Report
          <span className="btn-sub">{errorRows.length} failed rows</span>
        </button>
        <button className="btn-download blue" onClick={downloadChunks} disabled={validRows.length === 0}>
          ⬇ Split Chunks (.zip)
          <span className="btn-sub">
            {Math.ceil(validRows.length / config.chunkSize)} chunks of {config.chunkSize}
          </span>
        </button>
      </div>
    </div>
  );
}