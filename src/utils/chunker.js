// src/utils/chunker.js
import JSZip from "jszip";

export function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function rowsToCSV(rows) {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    const line = headers.map((h) => {
      const val = row[h] === undefined || row[h] === null ? "" : String(row[h]);
      return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    });
    lines.push(line.join(","));
  });
  return lines.join("\n");
}

export async function buildZipWithChunks(validRows, chunkSize = 1000) {
  const zip = new JSZip();
  const chunks = chunkArray(validRows, chunkSize);
  chunks.forEach((chunk, i) => {
    const csv = rowsToCSV(chunk);
    zip.file(`cleaned_chunk_${i + 1}.csv`, csv);
  });
  const blob = await zip.generateAsync({ type: "blob" });
  return { blob, count: chunks.length };
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}