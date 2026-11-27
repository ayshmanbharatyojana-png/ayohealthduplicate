import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Building2,
  Download,
  FileText,
  Filter,
  HeartPulse,
  Home,
  MapPin,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

type CsvRecord = {
  unit: string;
  subCentre: string;
  village: string;
  ashaArea: string;
  ashaName: string;
  ashaId: string;
  population: number;
  abhaCreated: number;
};

type ReportRow = {
  key: string;
  name: string;
  secondary: string;
  population: number;
  abhaCreated: number;
  remaining: number;
  coverage: number;
  records: number;
};

type ModuleKey = "overview" | "unit" | "subcentre" | "village" | "asha" | "reports";

const CSV_PATH = `${import.meta.env.BASE_URL}data/eKavachABHA.csv`;

const numberFormat = new Intl.NumberFormat("en-IN");
const formatNumber = (value: number) => numberFormat.format(Math.round(value));
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number(value.replace(/,/g, "").replace(/%/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function recordsFromCsv(text: string): CsvRecord[] {
  const rows = parseCsv(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const index = (name: string) => headers.indexOf(name.toLowerCase());
  const required = [
    "UNIT/UPHC",
    "SC/Ward",
    "Village/Mohalla",
    "Asha Area",
    "ASHA Name",
    "ASHA ID",
    "Population",
    "ABHA Created",
  ];

  const missing = required.filter((name) => index(name) < 0);
  if (missing.length) {
    throw new Error(`CSV is missing required column(s): ${missing.join(", ")}`);
  }

  return rows.slice(1).map((cells) => ({
    unit: cells[index("UNIT/UPHC")] || "Unassigned",
    subCentre: cells[index("SC/Ward")] || "Unassigned",
    village: cells[index("Village/Mohalla")] || "Unassigned",
    ashaArea: cells[index("Asha Area")] || "",
    ashaName: cells[index("ASHA Name")] || "Name not available",
    ashaId: cells[index("ASHA ID")] || "ID not available",
    population: toNumber(cells[index("Population")]),
    abhaCreated: toNumber(cells[index("ABHA Created")]),
  }));
}

function summarize(records: CsvRecord[], keyOf: (record: CsvRecord) => string, secondaryOf?: (record: CsvRecord) => string): ReportRow[] {
  const grouped = new Map<string, ReportRow>();

  records.forEach((record) => {
    const name = keyOf(record).trim() || "Unassigned";
    const secondary = secondaryOf?.(record) || "";
    const key = `${name}|||${secondary}`;
