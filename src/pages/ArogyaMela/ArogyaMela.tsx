import { useEffect, useMemo, useState } from "react"
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line,
} from "recharts"
import { Users, Building2, MapPin, CalendarDays, Download, Search } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type RecordRow = {
  date: string
  unit: string
  facility: string
  department: string
  complaint: string
  patients: number
}

// Load the source CSV from public/data. The parser supports quoted CSV fields.
const CSV_PATH = `${import.meta.env.BASE_URL}data/ArogyaMela.csv`

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1 }
      else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ",") { row.push(field); field = "" }
    else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some(value => value.trim() !== "")) rows.push(row)
      row = []; field = ""
    } else field += char
  }
  row.push(field.replace(/\r$/, ""))
  if (row.some(value => value.trim() !== "")) rows.push(row)
  return rows
}

function parseMealDate(value: string): string {
  const clean = value.trim()
  const match = clean.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2}|\d{4})$/)
  if (!match) return clean
  const [, day, monthText, yearText] = match
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].findIndex(m => m.toLowerCase() === monthText.toLowerCase())
  if (month < 0) return clean
  const year = yearText.length === 2 ? Number(`20${yearText}`) : Number(yearText)
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(Number(day)).padStart(2, "0")}`
}

function parseArogyaMelaCsv(text: string): RecordRow[] {
  const rows = parseCsvRows(text)
  if (!rows.length) return []
  const headers = rows[0].map(value => value.trim().replace(/^\uFEFF/, "").toLowerCase())
  const column = (name: string) => headers.indexOf(name.toLowerCase())
  const dateIndex = column("Meal Date")
  const unitIndex = column("Unit")
  const facilityIndex = column("Facility Name")
  const departmentIndex = column("Department")
  const complaintIndex = column("Chief Complaint")
  const patientsIndex = column("No of Patients")
  const required = [dateIndex, unitIndex, facilityIndex, departmentIndex, complaintIndex, patientsIndex]
  if (required.some(index => index < 0)) {
    throw new Error("CSV headers do not match the expected ArogyaMela format.")
  }
  return rows.slice(1).map(values => ({
    date: parseMealDate(values[dateIndex] ?? ""),
    unit: (values[unitIndex] ?? "").trim(),
    facility: (values[facilityIndex] ?? "").trim(),
    department: (values[departmentIndex] ?? "").trim(),
    complaint: (values[complaintIndex] ?? "").trim(),
    patients: Number((values[patientsIndex] ?? "0").trim()) || 0,
  })).filter(row => row.date && row.facility && Number.isFinite(row.patients))
}

const numberFormat = new Intl.NumberFormat("en-IN")
const dateLabel = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
  day: "2-digit", month: "short", year: "2-digit",
})
const sumPatients = (rows: RecordRow[]) => rows.reduce((sum, row) => sum + row.patients, 0)
const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b))

function KpiCard({ title, value, note, icon: Icon }: {
  title: string; value: string; note: string; icon: typeof Users
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{note}</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="size-5" /></div>
      </CardContent>
    </Card>
  )
}

export function ArogyaMela() {
  const [data, setData] = useState<RecordRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetch(CSV_PATH)
      .then(response => {
        if (!response.ok) throw new Error(`CSV request failed (${response.status})`)
        return response.text()
      })
      .then(csvText => {
        const parsed = parseArogyaMelaCsv(csvText)
        if (!parsed.length) throw new Error("The CSV file contains no usable data rows.")
        if (!cancelled) { setData(parsed); setLoadError(""); setLoading(false) }
      })
      .catch(error => {
        if (!cancelled) { setLoadError(error instanceof Error ? error.message : "Unable to load ArogyaMela CSV."); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [])
  const [unit, setUnit] = useState("All")
  const [facility, setFacility] = useState("All")
  const [department, setDepartment] = useState("All")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [query, setQuery] = useState("")

  const units = useMemo(() => unique(data.map(r => r.unit)), [data])
  const facilities = useMemo(() => unique(data.filter(r => unit === "All" || r.unit === unit).map(r => r.facility)), [data, unit])
  const departments = useMemo(() => unique(data.map(r => r.department)), [data])
  const dateBounds = useMemo(() => {
    const sorted = data.map(r => r.date).filter(Boolean).sort()
    return { min: sorted[0] ?? "", max: sorted[sorted.length - 1] ?? "" }
  }, [data])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.filter(r =>
      (unit === "All" || r.unit === unit) &&
      (facility === "All" || r.facility === facility) &&
      (department === "All" || r.department === department) &&
      (!fromDate || r.date >= fromDate) &&
      (!toDate || r.date <= toDate) &&
      (!q || r.complaint.toLowerCase().includes(q) || r.facility.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) || r.unit.toLowerCase().includes(q))
    )
  }, [data, unit, facility, department, fromDate, toDate, query])

  const kpis = useMemo(() => ({
    patients: sumPatients(filtered),
    records: filtered.length,
    facilities: new Set(filtered.map(r => r.facility)).size,
    units: new Set(filtered.map(r => r.unit)).size,
    departments: new Set(filtered.map(r => r.department)).size,
    dates: new Set(filtered.map(r => r.date)).size,
  }), [filtered])

  const byDate = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach(r => map.set(r.date, (map.get(r.date) || 0) + r.patients))
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
      .map(([day, patients]) => ({ day: dateLabel(day), patients }))
  }, [filtered])

  const byUnit = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach(r => map.set(r.unit, (map.get(r.unit) || 0) + r.patients))
    return [...map.entries()].map(([name, patients]) => ({ name, patients }))
      .sort((a, b) => b.patients - a.patients).slice(0, 10)
  }, [filtered])

  const byDepartment = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach(r => map.set(r.department, (map.get(r.department) || 0) + r.patients))
    return [...map.entries()].map(([name, patients]) => ({ name, patients }))
      .sort((a, b) => b.patients - a.patients).slice(0, 10)
  }, [filtered])

  const byComplaint = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach(r => map.set(r.complaint, (map.get(r.complaint) || 0) + r.patients))
    return [...map.entries()].map(([name, patients]) => ({ name, patients }))
      .sort((a, b) => b.patients - a.patients)
  }, [filtered])

  const byFacility = useMemo(() => {
    const map = new Map<string, { patients: number; records: number; unit: string }>()
    filtered.forEach(r => {
      const item = map.get(r.facility) || { patients: 0, records: 0, unit: r.unit }
      item.patients += r.patients
      item.records += 1
      map.set(r.facility, item)
    })
    return [...map.entries()].map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.patients - a.patients)
  }, [filtered])

  const exportCsv = () => {
    const header = ["Meal Date", "Unit", "Facility Name", "Department", "Chief Complaint", "No of Patients"]
    const lines = [header, ...filtered.map(r => [r.date, r.unit, r.facility, r.department, r.complaint, String(r.patients)])]
    const csv = lines.map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const a = document.createElement("a")
    a.href = url
    a.download = "ArogyaMela_filtered_data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setUnit("All"); setFacility("All"); setDepartment("All"); setFromDate(""); setToDate(""); setQuery("")
  }

  return (
    <div className="space-y-5">
      {loading && <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading ArogyaMela data from public/data/ArogyaMela.csv…</CardContent></Card>}
      {!loading && loadError && <Card><CardContent className="p-6 text-sm text-destructive">Unable to load ArogyaMela data: {loadError}. Check that public/data/ArogyaMela.csv exists and is deployed.</CardContent></Card>}
      <PageHeader
        crumbs={[{ label: "Health Programmes", href: "/" }, { label: "ArogyaMela" }]}
        title="ArogyaMela Dashboard"
        description="Patient attendance and service utilisation analysis from the ArogyaMela register."
        actions={<button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"><Download className="size-4" /> Export filtered data</button>}
      />

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Dashboard filters</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <label className="grid gap-1 text-sm"><span className="text-muted-foreground">Unit / Block</span>
            <select className="h-10 rounded-md border bg-background px-3" value={unit} onChange={e => { setUnit(e.target.value); setFacility("All") }}>
              <option>All</option>{units.map(v => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm"><span className="text-muted-foreground">Facility</span>
            <select className="h-10 rounded-md border bg-background px-3" value={facility} onChange={e => setFacility(e.target.value)}>
              <option>All</option>{facilities.map(v => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm"><span className="text-muted-foreground">Department</span>
            <select className="h-10 rounded-md border bg-background px-3" value={department} onChange={e => setDepartment(e.target.value)}>
              <option>All</option>{departments.map(v => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm"><span className="text-muted-foreground">From Date</span>
            <input type="date" className="h-10 rounded-md border bg-background px-3" value={fromDate}
              min={dateBounds.min} max={toDate || dateBounds.max} onChange={e => setFromDate(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm"><span className="text-muted-foreground">To Date</span>
            <input type="date" className="h-10 rounded-md border bg-background px-3" value={toDate}
              min={fromDate || dateBounds.min} max={dateBounds.max} onChange={e => setToDate(e.target.value)} />
          </label>
          <div className="flex items-end"><button onClick={resetFilters} className="h-10 w-full rounded-md border px-3 text-sm font-medium hover:bg-muted">Reset filters</button></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard title="Patients attended" value={numberFormat.format(kpis.patients)} note="Sum of No of Patients" icon={Users} />
        <KpiCard title="Facilities reporting" value={numberFormat.format(kpis.facilities)} note="Distinct facility names" icon={Building2} />
        <KpiCard title="Units / blocks covered" value={numberFormat.format(kpis.units)} note="Distinct units in selection" icon={MapPin} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Patient attendance by date</CardTitle></CardHeader>
          <CardContent><div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byDate} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="patients" name="Patients" stroke="#2563eb" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top 10 units by patients</CardTitle></CardHeader>
          <CardContent><div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byUnit} layout="vertical" margin={{ top: 4, right: 12, left: 30, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="patients" name="Patients" fill="#0d9488" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Chief complaints-wise counts</CardTitle></CardHeader>
          <CardContent><div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byComplaint.slice(0, 10)} layout="vertical" margin={{ top: 4, right: 12, left: 20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="patients" name="Patient count" fill="#7c3aed" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Chief complaints and coverage summary</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Chief complaints represented</p><p className="mt-1 text-xl font-bold">{numberFormat.format(byComplaint.length)}</p></div>
              <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Dates represented</p><p className="mt-1 text-xl font-bold">{numberFormat.format(kpis.dates)}</p></div>
            </div>
            <div className="space-y-3">
              {byComplaint.slice(0, 7).map(item => {
                const pct = kpis.patients ? item.patients / kpis.patients * 100 : 0
                return <div key={item.name}>
                  <div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate">{item.name}</span><span className="font-medium tabular-nums">{numberFormat.format(item.patients)} ({pct.toFixed(1)}%)</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                </div>
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Facility-wise performance</CardTitle><p className="mt-1 text-sm text-muted-foreground">Ranked by total patients in the selected filters.</p></div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search facility, unit, department..." className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-3 font-medium">#</th><th className="px-3 py-3 font-medium">Facility</th><th className="px-3 py-3 font-medium">Unit</th><th className="px-3 py-3 text-right font-medium">Data entries</th><th className="px-3 py-3 text-right font-medium">Patients</th>
              </tr></thead>
              <tbody>
                {byFacility.slice(0, 50).map((r, i) => <tr key={r.name} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-3 py-3 text-muted-foreground">{i + 1}</td><td className="px-3 py-3 font-medium">{r.name}</td><td className="px-3 py-3">{r.unit}</td><td className="px-3 py-3 text-right tabular-nums">{numberFormat.format(r.records)}</td><td className="px-3 py-3 text-right font-semibold tabular-nums">{numberFormat.format(r.patients)}</td>
                </tr>)}
                {byFacility.length === 0 && <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No records match the selected filters.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Showing up to 50 facilities. Total filtered records: {numberFormat.format(kpis.records)}.</p>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Source: public/data/ArogyaMela.csv. Total source records loaded: {numberFormat.format(data.length)}. No target-based achievement percentage is calculated because the source does not contain targets.</p>
    </div>
  )
}
