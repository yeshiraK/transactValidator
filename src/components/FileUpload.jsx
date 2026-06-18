// src/components/FileUpload.jsx
import { useRef, useState } from "react";
import Papa from "papaparse";

export default function FileUpload({ onDataLoaded }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  function parseFile(file) {
    if (!file) return;
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onDataLoaded({
          rows: results.data,
          fields: results.meta.fields,
          fileName: file.name,
          totalRows: results.data.length,
        });
      },
      error: (err) => alert("Failed to parse file: " + err.message),
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx"))) {
      parseFile(file);
    } else {
      alert("Please upload a .csv file.");
    }
  }

  return (
    <div
      className={`upload-zone ${dragging ? "dragging" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={(e) => parseFile(e.target.files[0])}
      />
      <div className="upload-icon">📂</div>
      {fileName ? (
        <p className="upload-text"><strong>{fileName}</strong> loaded ✓</p>
      ) : (
        <>
          <p className="upload-text">Drag & drop your CSV here</p>
          <p className="upload-subtext">or click to browse</p>
        </>
      )}
    </div>
  );
}