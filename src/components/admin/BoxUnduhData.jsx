<div className="lg:col-span-4 space-y-4 order-first lg:order-last">
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-4 sticky top-6">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-purple-100 rounded-lg text-primary"><FileText size={16} /></div>
      <h3 className="font-bold text-primary text-sm">Laporan Status</h3>
    </div>
    <div className="space-y-4">
      <div className="space-y-1.5">
        <SmoothDropdown
          label="Jenis Data"
          options={["Data Universitas", "Data Program Studi", "Bidang Wirausaha", "Posisi Pekerjaan"]}
          placeholder="Pilih jurusan"
          isRequired={true}
          />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Format Laporan</label>
        <div className="flex gap-2 mt-2">
          {["CSV", "PDF"].map(fmt => (
            <button key={fmt} onClick={() => setSelectedFormat(fmt)} className={`cursor-pointer flex-1 py-2.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 ${selectedFormat === fmt ? "bg-primary text-white shadow-md" : "bg-gray-50 text-gray-400 border border-gray-200"}`}>{fmt}</button>
          ))}
        </div>
      </div>
      <button onClick={handleBuatLaporan} disabled={exportingReport} className="cursor-pointer w-full py-2.5 bg-primary text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md mt-4 disabled:opacity-50">
        {exportingReport ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        Unduh Data
      </button>
    </div>
  </div>
</div>
