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
    const existing = grouped.get(key);

    if (existing) {
      existing.population += record.population;
      existing.abhaCreated += record.abhaCreated;
      existing.records += 1;
    } else {
      grouped.set(key, {
        key,
        name,
        secondary,
        population: record.population,
        abhaCreated: record.abhaCreated,
        remaining: 0,
        coverage: 0,
        records: 1,
      });
    }
  });

  return Array.from(grouped.values())
    .map((item) => ({
      ...item,
      remaining: Math.max(0, item.population - item.abhaCreated),
      coverage: item.population > 0 ? (item.abhaCreated / item.population) * 100 : 0,
    }))
    .sort((a, b) => b.coverage - a.coverage || b.abhaCreated - a.abhaCreated);
}

const modules: { id: ModuleKey; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "unit", label: "Unit / UPHC", icon: Building2 },
  { id: "subcentre", label: "Sub-Centre / Ward", icon: MapPin },
  { id: "village", label: "Village / Mohalla", icon: Home },
  { id: "asha", label: "ASHA Performance", icon: Users },
  { id: "reports", label: "Reports", icon: FileText },
];

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Activity;
  tone?: "blue" | "green" | "amber" | "violet";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{note}</p>
        </div>
        <span className={`rounded-xl p-2.5 ring-1 ${tones[tone]}`}>
          <Icon size={19} />
        </span>
      </div>
    </div>
  );
}

function AbhaDonutChart({ created, remaining, coverage }: { created: number; remaining: number; coverage: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const createdShare = Math.max(0, Math.min(100, coverage));
  const createdLength = (createdShare / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
      <div className="relative h-48 w-48 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label={`ABHA created ${createdShare.toFixed(1)} percent; remaining ${(100 - createdShare).toFixed(1)} percent`}>
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#FBBF24" strokeWidth="17" />
          <circle
            cx="70" cy="70" r={radius} fill="none" stroke="#10B981" strokeWidth="17"
            strokeDasharray={`${createdLength} ${circumference - createdLength}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold tracking-tight text-slate-900">{formatPercent(coverage)}</span>
          <span className="mt-0.5 text-xs font-medium text-slate-500">ABHA coverage</span>
        </div>
      </div>
      <div className="w-full max-w-xs space-y-4">
        <div className="flex items-start gap-3">
          <span className="mt-1.5 size-3 shrink-0 rounded-full bg-emerald-500" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-700">ABHA Created</span><span className="text-sm font-bold text-emerald-700">{formatPercent(coverage)}</span></div>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">{formatNumber(created)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-1.5 size-3 shrink-0 rounded-full bg-amber-400" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-700">ABHA Remaining</span><span className="text-sm font-bold text-amber-700">{formatPercent(Math.max(0, 100 - coverage))}</span></div>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">{formatNumber(remaining)}</p>
          </div>
        </div>
        <p className="border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">The chart reflects the current filter selection. Remaining = Population − ABHA Created.</p>
      </div>
    </div>
  );
}

function CoverageBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const color = safeValue >= 65 ? "bg-emerald-500" : safeValue >= 40 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="flex min-w-28 items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${safeValue}%` }} />
      </div>
      <span className="w-12 text-right text-xs font-semibold tabular-nums text-slate-700">
        {formatPercent(value)}
      </span>
    </div>
  );
}

export function DigitalHealthABHA() {
  const [records, setRecords] = useState<CsvRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModule, setActiveModule] = useState<ModuleKey>("overview");
  const [unitFilter, setUnitFilter] = useState("All");
  const [subCentreFilter, setSubCentreFilter] = useState("All");
  const [villageFilter, setVillageFilter] = useState("All");
  const [ashaFilter, setAshaFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"coverage" | "population" | "abhaCreated" | "name">("coverage");

  const loadCsv = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(CSV_PATH, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Could not load ${CSV_PATH} (HTTP ${response.status}). Check that the CSV is in public/data/.`);
      }
      const text = await response.text();
      const parsed = recordsFromCsv(text);
      if (!parsed.length) throw new Error("The CSV file loaded, but it contains no data rows.");
      setRecords(parsed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "An unexpected error occurred while loading the CSV.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCsv();
    // Load the published CSV once when this page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const units = useMemo(() => [...new Set(records.map((r) => r.unit))].sort((a, b) => a.localeCompare(b)), [records]);

  const unitRecords = useMemo(
    () => records.filter((r) => unitFilter === "All" || r.unit === unitFilter),
    [records, unitFilter],
  );
  const subCentres = useMemo(
    () => [...new Set(unitRecords.map((r) => r.subCentre))].sort((a, b) => a.localeCompare(b)),
    [unitRecords],
  );
  const subCentreRecords = useMemo(
    () => unitRecords.filter((r) => subCentreFilter === "All" || r.subCentre === subCentreFilter),
    [unitRecords, subCentreFilter],
  );
  const villages = useMemo(
    () => [...new Set(subCentreRecords.map((r) => r.village))].sort((a, b) => a.localeCompare(b)),
    [subCentreRecords],
  );
  const villageRecords = useMemo(
    () => subCentreRecords.filter((r) => villageFilter === "All" || r.village === villageFilter),
    [subCentreRecords, villageFilter],
  );
  const ashaNames = useMemo(
    () => [...new Set(villageRecords.map((r) => `${r.ashaId}|||${r.ashaName}`))].sort((a, b) => a.localeCompare(b)),
    [villageRecords],
  );
  const filteredRecords = useMemo(
    () => villageRecords.filter((r) => ashaFilter === "All" || `${r.ashaId}|||${r.ashaName}` === ashaFilter),
    [villageRecords, ashaFilter],
  );

  useEffect(() => {
    if (subCentreFilter !== "All" && !subCentres.includes(subCentreFilter)) setSubCentreFilter("All");
  }, [subCentres, subCentreFilter]);
  useEffect(() => {
    if (villageFilter !== "All" && !villages.includes(villageFilter)) setVillageFilter("All");
  }, [villages, villageFilter]);
  useEffect(() => {
    if (ashaFilter !== "All" && !ashaNames.includes(ashaFilter)) setAshaFilter("All");
  }, [ashaNames, ashaFilter]);

  const totals = useMemo(() => {
    const population = filteredRecords.reduce((sum, r) => sum + r.population, 0);
    const abhaCreated = filteredRecords.reduce((sum, r) => sum + r.abhaCreated, 0);
    return {
      population,
      abhaCreated,
      remaining: Math.max(0, population - abhaCreated),
      coverage: population > 0 ? (abhaCreated / population) * 100 : 0,
    };
  }, [filteredRecords]);

  const unitRows = useMemo(() => summarize(filteredRecords, (r) => r.unit), [filteredRecords]);
  const subCentreRows = useMemo(
    () => summarize(filteredRecords, (r) => r.subCentre, (r) => r.unit),
    [filteredRecords],
  );
  const villageRows = useMemo(
    () => summarize(filteredRecords, (r) => r.village, (r) => `${r.unit} · ${r.subCentre}`),
    [filteredRecords],
  );
  const ashaRows = useMemo(
    () => summarize(filteredRecords, (r) => r.ashaId, (r) => r.ashaName),
    [filteredRecords],
  );

  const currentRows = activeModule === "unit" ? unitRows
    : activeModule === "subcentre" ? subCentreRows
      : activeModule === "village" ? villageRows
        : activeModule === "asha" ? ashaRows
          : unitRows;

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = currentRows.filter((row) => {
      const haystack = `${row.name} ${row.secondary}`.toLowerCase();
      return !query || haystack.includes(query);
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b[sortBy] - a[sortBy];
    });
  }, [currentRows, search, sortBy]);

  const uniqueAsaCount = ashaRows.length;
  const moduleTitle = modules.find((item) => item.id === activeModule)?.label ?? "Overview";
  const clearFilters = () => {
    setUnitFilter("All");
    setSubCentreFilter("All");
    setVillageFilter("All");
    setAshaFilter("All");
    setSearch("");
  };

  const printReport = () => {
    document.title = `Ayodhya-eKavach-ABHA-${activeModule}`;
    window.print();
  };

  const renderTable = (rows: ReportRow[], firstColumn: string) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-semibold">{firstColumn}</th>
            <th className="px-4 py-3 text-right font-semibold">Population</th>
            <th className="px-4 py-3 text-right font-semibold">ABHA Created</th>
            <th className="px-4 py-3 text-right font-semibold">Remaining</th>
            <th className="px-4 py-3 font-semibold">Coverage</th>
            <th className="px-4 py-3 text-right font-semibold">Records</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-slate-100 hover:bg-blue-50/40">
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800">{row.name}</p>
                {row.secondary && <p className="mt-0.5 text-xs text-slate-500">{row.secondary}</p>}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatNumber(row.population)}</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-700">{formatNumber(row.abhaCreated)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatNumber(row.remaining)}</td>
              <td className="px-4 py-3"><CoverageBar value={row.coverage} /></td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-500">{formatNumber(row.records)}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No matching records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 -m-4 p-4 sm:-m-6 sm:p-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="no-print overflow-hidden rounded-3xl bg-[#10243b] text-white shadow-lg">
          <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-xl bg-blue-600 p-2.5"><HeartPulse size={25} /></span>
                <div>
                  <p className="text-lg font-bold tracking-tight">Ayodhya Health Portal</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">Digital Health & ABHA</p>
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">eKavach ABHA Performance</h1>
              <p className="mt-1 text-sm text-slate-300">District coverage, facility performance and field-level monitoring</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                <span className="size-2 rounded-full bg-emerald-400" /> CSV data source
              </span>
              <button onClick={() => void loadCsv()} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2.5 text-sm font-semibold hover:bg-white/10">
                <RefreshCw size={16} /> Refresh data
              </button>
              <button onClick={printReport} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-blue-50">
                <Download size={16} /> Export PDF
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <p className="font-bold">Unable to load eKavachABHA.csv</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-xs">Expected location: public/data/eKavachABHA.csv</p>
            <button onClick={() => void loadCsv()} className="mt-3 rounded-lg bg-rose-700 px-3 py-2 font-semibold text-white">Try again</button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Population" value={loading ? "Loading…" : formatNumber(totals.population)} note="Population in selected area" icon={Users} tone="blue" />
          <StatCard label="ABHA Created" value={loading ? "Loading…" : formatNumber(totals.abhaCreated)} note="Total generated ABHA" icon={BadgeCheck} tone="green" />
          <StatCard label="ABHA Remaining" value={loading ? "Loading…" : formatNumber(totals.remaining)} note="Population minus ABHA created" icon={Activity} tone="amber" />
          <StatCard label="Coverage" value={loading ? "Loading…" : formatPercent(totals.coverage)} note="ABHA created ÷ population" icon={HeartPulse} tone="violet" />
        </section>

        <section className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-slate-800"><Filter size={17} className="text-blue-600" /> Report filters</div>
            <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"><X size={14} /> Reset filters</button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="text-xs font-semibold text-slate-600">Unit / UPHC
              <select value={unitFilter} onChange={(e) => { setUnitFilter(e.target.value); setSubCentreFilter("All"); setVillageFilter("All"); setAshaFilter("All"); }} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500">
                <option value="All">All Units</option>{units.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Sub-Centre / Ward
              <select value={subCentreFilter} onChange={(e) => { setSubCentreFilter(e.target.value); setVillageFilter("All"); setAshaFilter("All"); }} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500">
                <option value="All">All Sub-Centres</option>{subCentres.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Village / Mohalla
              <select value={villageFilter} onChange={(e) => { setVillageFilter(e.target.value); setAshaFilter("All"); }} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500">
                <option value="All">All Villages</option>{villages.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">ASHA worker
              <select value={ashaFilter} onChange={(e) => setAshaFilter(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500">
                <option value="All">All ASHA workers</option>{ashaNames.map((value) => <option key={value} value={value}>{value.split("|||")[1]} · {value.split("|||")[0]}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="no-print flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {modules.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveModule(id); setSearch(""); }} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${activeModule === id ? "bg-[#10243b] text-white shadow" : "text-slate-600 hover:bg-slate-100"}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </section>

        {activeModule === "overview" ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div><h2 className="font-bold text-slate-900">Unit / UPHC coverage</h2><p className="text-xs text-slate-500">Ranked by ABHA coverage percentage</p></div>
                <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">{unitRows.length} units</span>
              </div>
              <div className="space-y-4">
                {unitRows.map((row) => (
                  <button key={row.key} onClick={() => { setUnitFilter(row.name); setActiveModule("unit"); }} className="w-full text-left">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-slate-700">{row.name}</span>
                      <span className="text-xs font-bold tabular-nums text-slate-700">{formatPercent(row.coverage)}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${row.coverage >= 65 ? "bg-emerald-500" : row.coverage >= 40 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${Math.min(100, row.coverage)}%` }} /></div>
                    <p className="mt-1 text-[11px] text-slate-500">{formatNumber(row.abhaCreated)} created of {formatNumber(row.population)}</p>
                  </button>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-900">ABHA Created vs Remaining</h2>
              <p className="mb-4 text-xs text-slate-500">Donut chart · updates with report filters</p>
              <AbhaDonutChart created={totals.abhaCreated} remaining={totals.remaining} coverage={totals.coverage} />
              <div className="mt-7 rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Records in current selection</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(filteredRecords.length)}</p>
                <p className="mt-1 text-xs text-slate-500">{formatNumber(uniqueAsaCount)} distinct ASHA IDs in selection</p>
              </div>
            </section>
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-lg font-bold text-slate-900">{activeModule === "reports" ? "Consolidated PDF report" : `${moduleTitle} report`}</h2><p className="mt-1 text-xs text-slate-500">Aggregated from {formatNumber(filteredRecords.length)} source rows in eKavachABHA.csv</p></div>
              <div className="no-print flex flex-wrap gap-2">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search this report" className="w-56 rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <option value="coverage">Sort: Coverage</option><option value="population">Sort: Population</option><option value="abhaCreated">Sort: ABHA created</option><option value="name">Sort: Name</option>
                </select>
                <button onClick={printReport} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"><FileText size={15} /> Save PDF</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5 lg:grid-cols-4">
              <div><p className="text-xs text-slate-500">Population</p><p className="mt-1 font-bold text-slate-900">{formatNumber(totals.population)}</p></div>
              <div><p className="text-xs text-slate-500">ABHA created</p><p className="mt-1 font-bold text-emerald-700">{formatNumber(totals.abhaCreated)}</p></div>
              <div><p className="text-xs text-slate-500">Remaining</p><p className="mt-1 font-bold text-amber-700">{formatNumber(totals.remaining)}</p></div>
              <div><p className="text-xs text-slate-500">Coverage</p><p className="mt-1 font-bold text-slate-900">{formatPercent(totals.coverage)}</p></div>
            </div>
            {renderTable(visibleRows, activeModule === "unit" ? "Unit / UPHC" : activeModule === "subcentre" ? "Sub-Centre / Ward" : activeModule === "village" ? "Village / Mohalla" : activeModule === "asha" ? "ASHA ID / Worker" : "Unit / UPHC")}
            <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Showing {formatNumber(visibleRows.length)} grouped rows · Coverage = ABHA Created ÷ Population × 100</div>
          </section>
        )}

        {activeModule === "reports" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900">Available PDF reports</h3>
            <p className="mt-1 text-sm text-slate-500">Select a reporting module above, apply filters and choose Export PDF. The browser print dialog lets you save the report as a PDF.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {modules.filter((m) => m.id !== "overview" && m.id !== "reports").map((m) => (
                <button key={m.id} onClick={() => setActiveModule(m.id)} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-blue-300 hover:bg-blue-50/50">
                  <m.icon className="text-blue-700" size={20} /><span className="text-sm font-semibold text-slate-700">{m.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <footer className="no-print flex flex-col gap-1 border-t border-slate-200 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Ayodhya Integrated Health Portal · eKavach ABHA</span>
          <span>Source: public/data/eKavachABHA.csv · {formatNumber(records.length)} rows loaded</span>
        </footer>
      </div>

      <style>{`
        @media print {
          @page { size: landscape; margin: 12mm; }
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          main { padding: 0 !important; }
          body * { visibility: hidden; }
          #root, #root * { visibility: visible; }
          #root { position: absolute; inset: 0; width: 100%; }
          table { font-size: 9pt !important; }
          tr { break-inside: avoid; }
          .shadow-sm, .shadow-lg { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

export default DigitalHealthABHA;
