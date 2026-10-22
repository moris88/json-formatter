export const formatCell = (v: unknown) => {
  if (v === undefined) return "";
  if (v === null) return "null";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

export const isTabularRows = (rows: unknown[]) =>
  rows.every((r) => r !== null && typeof r === "object" && !Array.isArray(r));

export const columnsOf = (rows: unknown[]) =>
  isTabularRows(rows)
    ? [...new Set(rows.flatMap((r) => Object.keys(r as object)))]
    : ["valore"];

export const toCsv = (rows: unknown[]) => {
  const isTabular = isTabularRows(rows);
  const columns = columnsOf(rows);
  const csvCell = (v: unknown) => {
    const s = formatCell(v);
    return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) =>
    columns
      .map((c) => csvCell(isTabular ? (r as Record<string, unknown>)[c] : r))
      .join(","),
  );
  return [columns.map(csvCell).join(","), ...lines].join("\r\n");
};

export const downloadCsv = (rows: unknown[]) => {
  // BOM per far riconoscere UTF-8 a Excel
  const blob = new Blob(["﻿", toCsv(rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "risultati.csv";
  a.click();
  URL.revokeObjectURL(url);
};
