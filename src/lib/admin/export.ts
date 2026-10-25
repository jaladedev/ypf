import "server-only";
import ExcelJS from "exceljs";

export type ExportColumn<T> = {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
  width?: number;
};

export type ExportFormat = "csv" | "xlsx";

/**
 * Spreadsheet programs run text that starts with = + - @ as a formula, which lets
 * someone who types "=HYPERLINK(...)" into a form attack whoever opens the export.
 * Prefixing a single quote makes it plain text. Plain negative numbers are numbers, not text.
 */
export function safeCell(v: string | number | boolean | null | undefined): string | number {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
}

function csvField(v: string | number) {
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv<T>(columns: ExportColumn<T>[], rows: T[]) {
  const lines = [
    columns.map((c) => csvField(c.header)).join(","),
    ...rows.map((r) => columns.map((c) => csvField(safeCell(c.value(r)))).join(",")),
  ];
  // BOM so Excel opens UTF-8 (names with accents) correctly; CRLF per RFC 4180.
  return "﻿" + lines.join("\r\n") + "\r\n";
}

export async function toXlsx<T>(sheetName: string, columns: ExportColumn<T>[], rows: T[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Young Planners Forum";
  wb.created = new Date();
  const ws = wb.addWorksheet(sheetName.slice(0, 31), {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  ws.columns = columns.map((c) => ({
    header: c.header,
    key: c.header,
    width: c.width ?? Math.max(14, c.header.length + 4),
  }));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF164C34" } };
  for (const r of rows) {
    const cells = columns.map((c) => {
      const v = safeCell(c.value(r));
      // In xlsx, a leading quote would show literally, and strings are never evaluated as
      // formulas, so strip our CSV guard here.
      return typeof v === "string" && v.startsWith("'") && /^'[=+\-@\t\r]/.test(v) ? v.slice(1) : v;
    });
    ws.addRow(cells);
  }
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export const xlsxMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function exportResponse<T>(opts: {
  format: ExportFormat;
  filename: string; // without extension
  sheetName: string;
  columns: ExportColumn<T>[];
  rows: T[];
}) {
  const { format, filename, sheetName, columns, rows } = opts;
  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": `attachment; filename="${filename}.${format}"`,
  };
  if (format === "csv") {
    return new Response(toCsv(columns, rows), {
      headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" },
    });
  }
  const buf = await toXlsx(sheetName, columns, rows);
  return new Response(new Uint8Array(buf), { headers: { ...headers, "Content-Type": xlsxMime } });
}
