import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  School,
  BookOpen,
  Store,
  Briefcase,
  FileText,
  Download,
  Trash2,
  Pencil,
  Search,
  Loader2,
  X,
  Check,
  ChevronDown
} from "lucide-react";
import { alertSuccess, alertError, alertConfirm } from "../../utilitis/alert";
import { adminApi } from "../../api/admin";

// --- KOMPONEN CUSTOM: MULTI-SELECT DROPDOWN ---
const MultiSelectDropdown = ({ options = [], selected = [], onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionName) => {
    let newSelected;
    if (selected.includes(optionName)) {
      newSelected = selected.filter(item => item !== optionName);
    } else {
      newSelected = [...selected, optionName];
    }
    onChange(newSelected);
  };

  const removeOption = (e, optionName) => {
    e.stopPropagation();
    onChange(selected.filter(item => item !== optionName));
  };

  const filteredOptions = options.filter(opt =>
    opt.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Area */}
      <div
        className="w-full px-2 py-2 min-h-[38px] text-xs border border-gray-200 rounded focus-within:ring-1 focus-within:ring-primary bg-white cursor-text flex flex-wrap gap-1 items-center"
        onClick={() => setIsOpen(true)}
      >
        {selected.length === 0 && !search && (
          <span className="text-gray-400 absolute left-2 pointer-events-none">{placeholder}</span>
        )}

        {selected.map((item, idx) => (
          <span key={idx} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
            {item}
            <X size={12} className="cursor-pointer hover:text-blue-800" onClick={(e) => removeOption(e, item)} />
          </span>
        ))}

        <input
          type="text"
          className="flex-1 min-w-[60px] outline-none bg-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown size={14} className="text-gray-400 ml-auto" />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.id}
                className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between ${selected.includes(opt.nama) ? 'bg-blue-50 font-medium text-primary' : 'text-slate-600'}`}
                onClick={() => toggleOption(opt.nama)}
              >
                <span>{opt.nama}</span>
                {selected.includes(opt.nama) && <Check size={14} />}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-gray-400 italic">Tidak ada opsi ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
};

// --- SUB-KOMPONEN REUSABLE TABLE ---
const ManagedTable = ({
  title,
  icon: Icon,
  data = [],
  loading,
  placeholder,
  onAddLabel,
  nameKey = "nama",
  onCreate,
  onUpdate,
  onDelete,
  readOnly = false,
  withJurusan = false,
  dropdownOptions = []
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ nama: "", jurusan: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const filteredData = (data || []).filter((item) =>
    (item.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => setFormData({ nama: "", jurusan: [] });

  const handleCreate = async () => {
    if (!formData.nama.trim()) return;
    setSaving(true);
    try {
      const payload = { [nameKey]: formData.nama.trim() };
      if (withJurusan) payload.jurusan = formData.jurusan;
      await onCreate(payload);
      resetForm();
      setIsAdding(false);
    } catch (e) {
      alertError(e?.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!formData.nama.trim()) return;
    setSaving(true);
    try {
      const payload = { [nameKey]: formData.nama.trim() };
      if (withJurusan) payload.jurusan = formData.jurusan;
      await onUpdate(id, payload);
      setEditId(null);
      resetForm();
    } catch (e) {
      alertError(e?.response?.data?.message || "Gagal mengubah data");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setIsAdding(false);
    setFormData({
      nama: item.nama,
      jurusan: Array.isArray(item.jurusan) ? item.jurusan : (item.jurusan ? [item.jurusan] : [])
    });
  };

  const handleDelete = async (id, name) => {
    const { isConfirmed } = await alertConfirm(`Hapus "${name}"?`);
    if (!isConfirmed) return;
    try {
      await onDelete(id);
    } catch (e) {
      alertError(e?.response?.data?.message || "Gagal menghapus data");
    }
  };

  // Logika untuk menentukan tinggi tabel
  // Jika sedang Edit atau Tambah, beri min-height agar dropdown muat
  // Jika tidak, biarkan auto (pendek sesuai konten)
  const tableContainerClass = (isAdding || editId) 
    ? "p-4 overflow-x-auto min-h-[250px] transition-all duration-300" // Mode Edit: Tinggi
    : "p-4 overflow-x-auto transition-all duration-300"; // Mode Lihat: Pendek (Auto)

  return (
    <div className="bg-white rounded-lg border border-gray-100 mb-6 shadow-sm relative">
      {/* Header Table */}
      <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-blue-100 rounded-lg text-primary flex-shrink-0">
            <Icon size={16} />
          </div>
          <h3 className="font-bold text-primary text-md truncate">{title}</h3>
          <span className="text-xs text-slate-400 font-medium">({filteredData.length})</span>
        </div>
        {!readOnly && (
          <button
            onClick={() => { setIsAdding(true); setEditId(null); resetForm(); }}
            className="text-fourth bg-primary flex items-center gap-1 text-xs font-bold hover:text-white hover:bg-secondary px-2.5 py-2 rounded-lg transition-all group cursor-pointer"
          >
            <Plus size={12} className="group-hover:scale-125 transition-transform" />
            <span className="hidden sm:inline">{onAddLabel}</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="px-4 pt-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder={`Cari ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className={tableContainerClass}>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 font-bold text-[11px] uppercase tracking-widest border-b-2 border-gray-200 bg-gray-50">
              <th className="px-3 py-3 w-16">ID</th>
              <th className="px-3 py-3 w-1/3">Nama</th>
              {withJurusan && <th className="px-3 py-3">Jurusan Tersedia</th>}
              {!readOnly && <th className="px-3 py-3 text-right w-24">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Input Row */}
            {isAdding && !readOnly && (
              <tr className="bg-blue-50/50 animate-in fade-in duration-300 align-top">
                <td className="py-3 px-3 text-xs text-gray-400 italic">Auto</td>
                <td className="py-3 px-3">
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-2 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none"
                    autoFocus
                  />
                </td>
                {withJurusan && (
                  <td className="py-3 px-3">
                    <MultiSelectDropdown
                      options={dropdownOptions}
                      selected={formData.jurusan}
                      onChange={(newVal) => setFormData({ ...formData, jurusan: newVal })}
                      placeholder="Pilih Jurusan..."
                    />
                  </td>
                )}
                <td className="py-3 px-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setIsAdding(false); resetForm(); }} className="cursor-pointer px-2 py-1 text-[11px] font-bold text-gray-500 hover:bg-gray-200 rounded transition-colors">Batal</button>
                    <button onClick={handleCreate} disabled={saving || !formData.nama.trim()} className="cursor-pointer px-2 py-1 text-[11px] font-bold bg-primary text-white rounded shadow-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
                      {saving && <Loader2 size={10} className="animate-spin" />}
                      Simpan
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {loading ? (
              <tr><td colSpan={withJurusan ? 4 : 3} className="py-8 text-center"><Loader2 size={20} className="animate-spin text-primary mx-auto" /><p className="text-xs text-slate-400 mt-1">Memuat data...</p></td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={withJurusan ? 4 : 3} className="py-6 text-center text-xs text-slate-400">Tidak ada data ditemukan.</td></tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors align-top">
                  <td className="py-3 px-3 font-bold text-primary text-xs">{item.id}</td>
                  <td className="py-3 px-3">
                    {editId === item.id ? (
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        className="w-full px-2 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none"
                      />
                    ) : (
                      <span className="font-medium text-gray-700 text-sm group-hover:text-primary transition-colors">{item.nama}</span>
                    )}
                  </td>
                  {withJurusan && (
                    <td className="py-3 px-3">
                      {editId === item.id ? (
                        <MultiSelectDropdown
                          options={dropdownOptions}
                          selected={formData.jurusan}
                          onChange={(newVal) => setFormData({ ...formData, jurusan: newVal })}
                          placeholder="Pilih Jurusan..."
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {item.jurusan ? (
                            (Array.isArray(item.jurusan) ? item.jurusan : [item.jurusan]).map((j, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {typeof j === 'object' ? j.nama : j}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">- Tidak ada jurusan -</span>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                  {!readOnly && (
                    <td className="py-3 px-3">
                      {editId === item.id ? (
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleUpdate(item.id)} disabled={saving} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"><Check size={16} /></button>
                          <button onClick={() => { setEditId(null); resetForm(); }} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1 transition-opacity">
                          <button onClick={() => startEdit(item)} className="cursor-pointer p-1.5 text-gray-400 hover:text-[#3C5759] hover:bg-blue-100 rounded-lg active:scale-90"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(item.id, item.nama)} className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg active:scale-90"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function StatusKarir() {
  const [selectedReport, setSelectedReport] = useState("Data Universitas");
  const [exportingReport, setExportingReport] = useState(false);

  const [univData, setUnivData] = useState([]);
  const [prodiData, setProdiData] = useState([]);
  const [wirausahaData, setWirausahaData] = useState([]);
  const [posisiData, setPosisiData] = useState([]);
  const [loading, setLoading] = useState({ univ: true, prodi: true, wirausaha: true, posisi: true });

  // --- Fetch helpers ---
  const fetchUniv = useCallback(async () => {
    try {
      const res = await adminApi.getStatusKarierUniversitas();
      setUnivData(res.data?.data || []);
    } catch { setUnivData([]); }
    finally { setLoading(prev => ({ ...prev, univ: false })); }
  }, []);

  const fetchProdi = useCallback(async () => {
    try {
      const res = await adminApi.getStatusKarierProdi();
      setProdiData(res.data?.data || []);
    } catch { setProdiData([]); }
    finally { setLoading(prev => ({ ...prev, prodi: false })); }
  }, []);

  const fetchWirausaha = useCallback(async () => {
    try {
      const res = await adminApi.getStatusKarierBidangUsaha();
      setWirausahaData(res.data?.data || []);
    } catch { setWirausahaData([]); }
    finally { setLoading(prev => ({ ...prev, wirausaha: false })); }
  }, []);

  const fetchPosisi = useCallback(async () => {
    try {
      const res = await adminApi.getStatusKarierPosisi();
      setPosisiData(res.data?.data || []);
    } catch { setPosisiData([]); }
    finally { setLoading(prev => ({ ...prev, posisi: false })); }
  }, []);

  useEffect(() => {
    fetchUniv();
    fetchProdi();
    fetchWirausaha();
    fetchPosisi();
  }, [fetchUniv, fetchProdi, fetchWirausaha, fetchPosisi]);

  // --- CRUD handlers ---
  const handleCreateUniv = async (data) => {
    await adminApi.createStatusKarierUniversitas(data);
    alertSuccess("Data berhasil ditambahkan!");
    fetchUniv();
  };
  const handleUpdateUniv = async (id, data) => {
    await adminApi.updateStatusKarierUniversitas(id, data);
    alertSuccess("Data berhasil diubah!");
    fetchUniv();
  };
  const handleDeleteUniv = async (id) => {
    await adminApi.deleteStatusKarierUniversitas(id);
    alertSuccess("Data berhasil dihapus!");
    fetchUniv();
  };

  const handleCreateProdi = async (data) => {
    await adminApi.createStatusKarierProdi(data);
    alertSuccess("Data berhasil ditambahkan!");
    fetchProdi();
  };
  const handleUpdateProdi = async (id, data) => {
    await adminApi.updateStatusKarierProdi(id, data);
    alertSuccess("Data berhasil diubah!");
    fetchProdi();
  };
  const handleDeleteProdi = async (id) => {
    await adminApi.deleteStatusKarierProdi(id);
    alertSuccess("Data berhasil dihapus!");
    fetchProdi();
  };

  const handleCreateWirausaha = async (data) => {
    await adminApi.createStatusKarierBidangUsaha(data);
    alertSuccess("Data berhasil ditambahkan!");
    fetchWirausaha();
  };
  const handleUpdateWirausaha = async (id, data) => {
    await adminApi.updateStatusKarierBidangUsaha(id, data);
    alertSuccess("Data berhasil diubah!");
    fetchWirausaha();
  };
  const handleDeleteWirausaha = async (id) => {
    await adminApi.deleteStatusKarierBidangUsaha(id);
    alertSuccess("Data berhasil dihapus!");
    fetchWirausaha();
  };

  const handleCreatePosisi = async (data) => {
    await adminApi.createStatusKarierPosisi(data);
    alertSuccess("Data berhasil ditambahkan!");
    fetchPosisi();
  };
  const handleUpdatePosisi = async (id, data) => {
    await adminApi.updateStatusKarierPosisi(id, data);
    alertSuccess("Data berhasil diubah!");
    fetchPosisi();
  };
  const handleDeletePosisi = async (id) => {
    await adminApi.deleteStatusKarierPosisi(id);
    alertSuccess("Data berhasil dihapus!");
    fetchPosisi();
  };

  // --- Export handler (CSV only) ---
  const handleBuatLaporan = async () => {
    setExportingReport(true);
    try {
      const typeMap = {
        "Data Universitas": "universitas",
        "Data Program Studi": "prodi",
        "Bidang Wirausaha": "bidang-usaha",
        "Posisi Pekerjaan": "posisi",
      };
      const type = typeMap[selectedReport] || "universitas";
      const res = await adminApi.exportStatusKarierReport(type);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `laporan-${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      alertSuccess("Laporan berhasil diunduh!");
    } catch (e) {
      alertError(e?.response?.data?.message || "Gagal mengunduh laporan");
    } finally {
      setExportingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6 order-last lg:order-first">
          
          <ManagedTable
            title="Data Universitas"
            icon={School}
            data={univData}
            loading={loading.univ}
            placeholder="Nama Universitas"
            onAddLabel="Tambah Kampus"
            nameKey="nama"
            withJurusan={true}
            dropdownOptions={prodiData}
            onCreate={handleCreateUniv}
            onUpdate={handleUpdateUniv}
            onDelete={handleDeleteUniv}
          />

          <ManagedTable
            title="Master Program Studi (Umum)"
            icon={BookOpen}
            data={prodiData}
            loading={loading.prodi}
            placeholder="Contoh: Ilmu Komunikasi"
            onAddLabel="Tambah Prodi"
            nameKey="nama"
            onCreate={handleCreateProdi}
            onUpdate={handleUpdateProdi}
            onDelete={handleDeleteProdi}
          />

          <ManagedTable
            title="Bidang Wirausaha"
            icon={Store}
            data={wirausahaData}
            loading={loading.wirausaha}
            placeholder="Contoh: Kuliner"
            onAddLabel="Tambah Bidang"
            nameKey="nama_bidang"
            onCreate={handleCreateWirausaha}
            onUpdate={handleUpdateWirausaha}
            onDelete={handleDeleteWirausaha}
          />

          <ManagedTable
            title="Posisi Pekerjaan"
            icon={Briefcase}
            data={posisiData}
            loading={loading.posisi}
            placeholder="Contoh: Staff"
            onAddLabel="Tambah Posisi"
            nameKey="nama_posisi"
            onCreate={handleCreatePosisi}
            onUpdate={handleUpdatePosisi}
            onDelete={handleDeletePosisi}
          />
        </div>

        <div className="lg:col-span-4 space-y-4 order-first lg:order-last">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-4 sticky top-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg text-primary"><FileText size={16} /></div>
              <h3 className="font-bold text-primary text-sm">Laporan Status</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jenis Data</label>
                <select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)} className="cursor-pointer w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50 text-slate-700 font-medium">
                  <option>Data Universitas</option>
                  <option>Data Program Studi</option>
                  <option>Bidang Wirausaha</option>
                  <option>Posisi Pekerjaan</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Format Laporan</label>
                <div className="flex gap-2">
                  <div className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-primary text-white shadow-md text-center">CSV</div>
                </div>
              </div>
              <button onClick={handleBuatLaporan} disabled={exportingReport} className="cursor-pointer w-full py-2.5 bg-primary text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md mt-4 disabled:opacity-50">
                {exportingReport ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Unduh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}