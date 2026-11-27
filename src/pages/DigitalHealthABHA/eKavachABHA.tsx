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
