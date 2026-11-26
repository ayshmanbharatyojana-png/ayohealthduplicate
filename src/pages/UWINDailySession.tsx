import { useEffect, useMemo, useState } from "react"
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts"
import {
  Wallet, Clock3, TrendingUp, Baby, Users, UserRound,
  Download, ChevronDown, MapPin, CalendarDays, Activity,
} from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SessionRow = {
  date: string
  unit: string
  facility: string
  vaccinator: string
  site: string
  planned: number
  held: number
  pw: number
  infant: number
  child: number
  adolescent: number
}

type MetricKey = "all" | "pw" | "infant" | "child" | "adolescent"

const CSV_PATH = `${import.meta.env.BASE_URL}data/UWINDailySession.csv`
const numberFormat = new Intl.NumberFormat("en-IN")
const vaccineColors = ["#2563eb", "#16a34a", "#f59e0b", "#8b5cf6"]
const metricLabels: Record<MetricKey, string> = {
  all: "All beneficiary per Session",
  pw: "Unit wise PW per Session",
  infant: "Unit wise Infant per Session",
  child: "Unit wise Child per Session",
  adolescent: "Unit wise Adolescent per Session",
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i += 1
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ",") {
      row.push(field)
      field = ""
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""))
      if (row.some(value => value.trim() !== "")) rows.push(row)
      row = []
      field = ""
    } else {
      field += char
    }
  }

  row.push(field.replace(/\r$/, ""))
  if (row.some(value => value.trim() !== "")) rows.push(row)
  return rows
}

function excelDateToIso(value: string): string {
  const raw = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const serial = Number(raw)
  if (!Number.isFinite(serial) || serial <= 0) return raw
  const date = new Date(Date.UTC(1899, 11, 30) + serial * 86400000)
  return date.toISOString().slice(0, 10)
}

function parseNumber(value: string | undefined): number {
  const parsed = Number((value ?? "").trim())
  return Number.isFinite(parsed) ? parsed : 0
}

function parseSessionCsv(text: string): SessionRow[] {
  const rows = parseCsv(text)
  if (rows.length < 2) return []

  const headers = rows[0].map(value => value.trim().replace(/^\uFEFF/, "").toLowerCase())
  const index = (name: string) => headers.indexOf(name.toLowerCase())
  const columns = {
    date: index("Date"),
    unit: index("UNIT"),
    facility: index("Health Facility Name"),
    vaccinator: index("Vaccinator Name"),
    site: index("Session Site Name"),
    planned: index("Session Planned"),
    held: index("Session Held"),
    pw: index("PW Vaccinated"),
    infant: index("Infant Vaccinated"),
    child: index("Child Vaccinated"),
    adolescent: index("Adolescent Vaccinated"),
  }

  if (Object.values(columns).some(value => value < 0)) {
    throw new Error("CSV headers do not match the expected UWIN Daily Session format.")
  }

  return rows.slice(1).map(values => ({
    date: excelDateToIso(values[columns.date] ?? ""),
    unit: (values[columns.unit] ?? "").trim(),
    facility: (values[columns.facility] ?? "").trim(),
    vaccinator: (values[columns.vaccinator] ?? "").trim(),
    site: (values[columns.site] ?? "").trim(),
    planned: parseNumber(values[columns.planned]),
    held: parseNumber(values[columns.held]),
    pw: parseNumber(values[columns.pw]),
    infant: parseNumber(values[columns.infant]),
    child: parseNumber(values[columns.child]),
    adolescent: parseNumber(values[columns.adolescent]),
  })).filter(row => row.date && (row.unit || row.facility || row.site))
}

function formatDate(value: string): string {
  if (!value) return "—"
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function sum(rows: SessionRow[], key: "planned" | "held" | "pw" | "infant" | "child" | "adolescent") {
  return rows.reduce((total, row) => total + row[key], 0)
}

function KpiCard({
  title, value, icon: Icon, tone,
}: {
  title: string
  value: number
  icon: typeof Wallet
  tone: "green" | "red" | "blue"
}) {
  const toneClass = tone === "green"
    ? "bg-green-100 text-green-700"
    : tone === "red"
      ? "bg-red-100 text-red-700"
      : "bg-blue-100 text-blue-700"

  return (
    <Card className="min-w-0">
      <CardContent className="flex min-h-[96px] items-center gap-3 p-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{numberFormat.format(value)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function UWINDailySession() {
  const [data, setData] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [sessionDate, setSessionDate] = useState("")
  const [status, setStatus] = useState("all")
  const [metric, setMetric] = useState<MetricKey>("all")
  const [showNotHeld, setShowNotHeld] = useState(false)

  useEffect(() => {
    let active = true
    fetch(CSV_PATH)
      .then(response => {
        if (!response.ok) throw new Error(`CSV request failed (${response.status})`)
        return response.text()
      })
      .then(text => {
        if (active) {
          setData(parseSessionCsv(text))
          setLoadError("")
        }
      })
      .catch(error => {
        if (active) setLoadError(error instanceof Error ? error.message : "Unknown loading error")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const dates = useMemo(() => [...new Set(data.map(row => row.date))].sort(), [data])
  const filtered = useMemo(() => data.filter(row => {
    const matchesDate = !sessionDate || row.date === sessionDate
    const rowStatus = row.held > 0 ? "held" : "not-held"
    const matchesStatus = status === "all" || status === rowStatus
    return matchesDate && matchesStatus
  }), [data, sessionDate, status])

  const kpis = useMemo(() => ({
    planned: sum(filtered, "planned"),
    held: sum(filtered, "held"),
    pw: sum(filtered, "pw"),
    infant: sum(filtered, "infant"),
    child: sum(filtered, "child"),
    adolescent: sum(filtered, "adolescent"),
  }), [filtered])

  const byUnit = useMemo(() => {
    const totals = new Map<string, { pw: number; infant: number; child: number; adolescent: number }>()
    filtered.forEach(row => {
      const current = totals.get(row.unit) ?? { pw: 0, infant: 0, child: 0, adolescent: 0 }
      current.pw += row.pw
      current.infant += row.infant
      current.child += row.child
      current.adolescent += row.adolescent
      totals.set(row.unit, current)
    })
    return [...totals.entries()].map(([unit, values]) => ({
      unit,
      ...values,
      all: values.pw + values.infant + values.child + values.adolescent,
    })).sort((a, b) => b[metric] - a[metric])
  }, [filtered, metric])

  const vaccineBreakdown = useMemo(() => [
    { name: "PW Vaccinated", value: kpis.pw },
    { name: "Infant Vaccinated", value: kpis.infant },
    { name: "Child Vaccinated", value: kpis.child },
    { name: "Adolescent Vaccinated", value: kpis.adolescent },
  ], [kpis])

  const notHeldRows = useMemo(
    () => filtered.filter(row => row.planned > row.held),
    [filtered],
  )

  const exportCsv = () => {
    const header = ["Date", "UNIT", "Health Facility Name", "Vaccinator Name", "Session Site Name", "Session Planned", "Session Held", "PW Vaccinated", "Infant Vaccinated", "Child Vaccinated", "Adolescent Vaccinated"]
    const lines = [header, ...filtered.map(row => [
      row.date, row.unit, row.facility, row.vaccinator, row.site,
      String(row.planned), String(row.held), String(row.pw), String(row.infant),
      String(row.child), String(row.adolescent),
    ])]
    const csv = lines.map(line => line.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "UWINDailySession_filtered.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Immunization", href: "/immunization" }, { label: "UWIN Daily Session" }]}
        title="UWIN Daily Session"
        description="Session planning, session held and beneficiary vaccination coverage."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <span className="whitespace-nowrap text-muted-foreground">Session Date</span>
              <select
                value={sessionDate}
                onChange={event => setSessionDate(event.target.value)}
                className="h-10 min-w-36 rounded-md border bg-background px-3"
              >
                <option value="">All Dates</option>
                {dates.map(date => <option key={date} value={date}>{formatDate(date)}</option>)}
              </select>
            </label>
            <select
              aria-label="Session status"
              value={status}
              onChange={event => setStatus(event.target.value)}
              className="h-10 rounded-md border bg-background px-3"
            >
              <option value="all">All Status</option>
              <option value="held">Session Held</option>
              <option value="not-held">Not Held</option>
            </select>
            <button
              onClick={exportCsv}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Download className="size-4" /> Export Data <ChevronDown className="size-3.5" />
            </button>
          </div>
        }
      />

      {loading && <Card><CardContent className="p-5 text-sm text-muted-foreground">Loading UWIN session data…</CardContent></Card>}
      {!loading && loadError && <Card><CardContent className="p-5 text-sm text-destructive">Unable to load {CSV_PATH}: {loadError}</CardContent></Card>}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <KpiCard title="Session Planned" value={kpis.planned} icon={Wallet} tone="green" />
        <KpiCard title="Session Held" value={kpis.held} icon={Clock3} tone="red" />
        <KpiCard title="PW Vaccinated" value={kpis.pw} icon={TrendingUp} tone="blue" />
        <KpiCard title="Infant Vaccinated" value={kpis.infant} icon={Baby} tone="blue" />
        <KpiCard title="Child Vaccinated" value={kpis.child} icon={Users} tone="blue" />
        <KpiCard title="Adolescent Vaccinated" value={kpis.adolescent} icon={UserRound} tone="blue" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-7">
        <Card className="xl:col-span-5">
          <CardContent className="pt-5">
            <div className="mb-4 flex flex-wrap gap-2 border-b pb-3">
              {(Object.keys(metricLabels) as MetricKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setMetric(key)}
                  className={`rounded-t-md px-3 py-2 text-left text-sm transition-colors ${metric === key ? "border-b-2 border-primary font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {metricLabels[key]}
                </button>
              ))}
            </div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">{metricLabels[metric]}</p>
              <span className="text-xs text-muted-foreground">Beneficiaries by unit</span>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byUnit} margin={{ top: 8, right: 12, left: 0, bottom: 38 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="unit" angle={-28} textAnchor="end" interval={0} height={65} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => numberFormat.format(Number(value ?? 0))} />
                  <Bar dataKey={metric} name={metric === "all" ? "All beneficiaries" : metricLabels[metric]} fill="#2563eb" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Beneficiaries Vaccinated by Type</CardTitle></CardHeader>
            <CardContent>
              <div className="relative h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={vaccineBreakdown} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={2}>
                      {vaccineBreakdown.map((entry, index) => <Cell key={entry.name} fill={vaccineColors[index]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => numberFormat.format(Number(value ?? 0))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold tabular-nums">{numberFormat.format(kpis.pw + kpis.infant + kpis.child + kpis.adolescent)}</span>
                  <span className="text-xs text-muted-foreground">Total vaccinated</span>
                </div>
              </div>
              <div className="space-y-2">
                {vaccineBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="size-2.5 rounded-sm" style={{ backgroundColor: vaccineColors[index] }} />
                      {item.name}
                    </span>
                    <strong className="tabular-nums text-foreground">{numberFormat.format(item.value)}</strong>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-7">
        <Card className="xl:col-span-5">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Line List of Session Sites Planned but Not Held</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{notHeldRows.length} records in the current selection</p>
            </div>
            <button onClick={() => setShowNotHeld(value => !value)} className="text-sm font-medium text-primary">
              {showNotHeld ? "Hide list" : "View list"}
            </button>
          </CardHeader>
          {showNotHeld && (
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Date</th>
                    <th className="pb-2 pr-3 font-medium">Unit</th>
                    <th className="pb-2 pr-3 font-medium">Facility</th>
                    <th className="pb-2 pr-3 font-medium">Vaccinator</th>
                    <th className="pb-2 font-medium">Session Site</th>
                  </tr>
                </thead>
                <tbody>
                  {notHeldRows.map((row, index) => (
                    <tr key={`${row.date}-${row.site}-${index}`} className="border-b last:border-0">
                      <td className="py-2.5 pr-3 whitespace-nowrap">{formatDate(row.date)}</td>
                      <td className="py-2.5 pr-3">{row.unit}</td>
                      <td className="py-2.5 pr-3">{row.facility}</td>
                      <td className="py-2.5 pr-3">{row.vaccinator}</td>
                      <td className="py-2.5">{row.site}</td>
                    </tr>
                  ))}
                  {notHeldRows.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No planned-but-not-held sessions are present in the selected CSV records.</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <button onClick={exportCsv} className="flex items-center gap-3 rounded-lg border p-3 text-left text-sm hover:bg-muted">
              <Download className="size-4 text-primary" /> Export filtered records
            </button>
            <button onClick={() => { setSessionDate(""); setStatus("all"); setMetric("all") }} className="flex items-center gap-3 rounded-lg border p-3 text-left text-sm hover:bg-muted">
              <Activity className="size-4 text-primary" /> Reset dashboard filters
            </button>
            <div className="flex items-center gap-3 rounded-lg border p-3 text-sm">
              <MapPin className="size-4 text-primary" />
              <span>{numberFormat.format(new Set(filtered.map(row => row.unit)).size)} units represented</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3 text-sm">
              <CalendarDays className="size-4 text-primary" />
              <span>{numberFormat.format(dates.length)} session dates in source</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Source: public/data/UWINDailySession.csv · {numberFormat.format(data.length)} source records loaded · {numberFormat.format(filtered.length)} records in current selection.
      </p>
    </div>
  )
}
