<option>All</option>{facilities.map(v => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm"><span className="text-muted-foreground">Department</span>
            <select className="h-10 rounded-md border bg-background px-3" value={department} onChange={e => setDepartment(e.target.value)}>
              <option>All</option>{departments.map(v => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm"><span className="text-muted-foreground">From Date</span>
            <input
              type="date"
              className="h-10 rounded-md border bg-background px-3"
              value={fromDate}
              min={dateBounds.min}
              max={toDate || dateBounds.max}
              onChange={e => setFromDate(e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm"><span className="text-muted-foreground">To Date</span>
            <input
              type="date"
              className="h-10 rounded-md border bg-background px-3"
              value={toDate}
              min={fromDate || dateBounds.min}
              max={dateBounds.max}
              onChange={e => setToDate(e.target.value)}
            />
          </label>
          <div className="flex items-end"><button onClick={resetFilters} className="h-10 w-full rounded-md border px-3 text-sm font-medium hover:bg-muted">Reset filters</button></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Patients attended" value={numberFormat.format(kpis.patients)} note="Sum of No of Patients" icon={Users} />
        <KpiCard title="Data entries" value={numberFormat.format(kpis.records)} note="Rows in the filtered register" icon={CalendarDays} />
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
          <CardHeader><CardTitle>Patients by department</CardTitle></CardHeader>
          <CardContent><div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDepartment} layout="vertical" margin={{ top: 4, right: 12, left: 20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="patients" name="Patients" fill="#7c3aed" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Department and coverage summary</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Departments represented</p><p className="mt-1 text-xl font-bold">{numberFormat.format(kpis.departments)}</p></div>
              <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Dates represented</p><p className="mt-1 text-xl font-bold">{numberFormat.format(kpis.dates)}</p></div>
            </div>
            <div className="space-y-3">
              {byDepartment.slice(0, 7).map(item => {
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
      <p className="text-xs text-muted-foreground">Source: public/data/ArogyaMela.csv. Records and patient totals are calculated from the CSV currently loaded. No target-based achievement percentage is calculated because the source does not contain targets.</p>
    </div>
  )
}
