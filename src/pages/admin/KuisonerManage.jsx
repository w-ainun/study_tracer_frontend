import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  GripVertical,
  EyeOff,
  Archive,
  ListChecks,
  Ghost,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { alertSuccess, alertError, alertConfirm } from "../../utilitis/alert";

export default function KuisonerManage() {
  const [filter, setFilter] = useState("Semua");
  const navigate = useNavigate();

  const [kuesionerList, setKuesionerList] = useState([]);
  const [selectedKuesionerId, setSelectedKuesionerId] = useState(null);
  const [loadingKuesioner, setLoadingKuesioner] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Fetch kuesioner list on mount
  useEffect(() => {
    (async () => {
      setLoadingKuesioner(true);
      try {
        const res = await adminApi.getKuesioner({}, 100);
        const list = res.data?.data?.data || res.data?.data || [];
        setKuesionerList(list);
        if (list.length > 0) setSelectedKuesionerId(list[0].id);
      } catch { setKuesionerList([]); }
      finally { setLoadingKuesioner(false); }
    })();
  }, []);

  // Fetch pertanyaan when kuesioner changes
  const fetchPertanyaan = useCallback(async () => {
    if (!selectedKuesionerId) { setQuestions([]); return; }
    setLoadingQuestions(true);
    try {
      const res = await adminApi.getKuesionerDetail(selectedKuesionerId);
      const data = res.data?.data || res.data;
      setQuestions(data?.pertanyaan || []);
    } catch { setQuestions([]); }
    finally { setLoadingQuestions(false); }
  }, [selectedKuesionerId]);

  useEffect(() => { fetchPertanyaan(); }, [fetchPertanyaan]);

  // Fungsi Aksi
  const updateStatus = async (pertanyaanId, newStatus) => {
    try {
      await adminApi.updatePertanyaanStatus(selectedKuesionerId, pertanyaanId, { status_pertanyaan: newStatus });
      alertSuccess("Status berhasil diubah!");
      fetchPertanyaan();
    } catch (e) {
      alertError(e?.response?.data?.message || "Gagal mengubah status");
    }
  };

  const deleteQuestion = async (pertanyaanId) => {
    const { isConfirmed } = await alertConfirm("Hapus pertanyaan ini?");
    if (!isConfirmed) return;
    try {
      await adminApi.deletePertanyaan(selectedKuesionerId, pertanyaanId);
      alertSuccess("Pertanyaan berhasil dihapus!");
      fetchPertanyaan();
    } catch (e) {
      alertError(e?.response?.data?.message || "Gagal menghapus pertanyaan");
    }
  };

  // Statistik
  const hiddenCount = questions.filter((q) => q.status_pertanyaan === "TERSEMBUNYI").length;
  const draftCount = questions.filter((q) => q.status_pertanyaan === "DRAF").length;
  const activeCount = questions.filter((q) => q.status_pertanyaan === "TERLIHAT").length;

  const categories = ["Semua", "Bekerja", "Kuliah", "Wirausaha", "Pencari Kerja"];

  // LOGIKA FILTER
  const filteredQuestions = questions.filter((q) => {
    if (filter === "Draf") return q.status_pertanyaan === "DRAF";
    if (filter === "Tersembunyi") return q.status_pertanyaan === "TERSEMBUNYI";
    if (filter === "Semua") return true;
    return q.kategori === filter;
  });

  const formatOpsi = (opsi) => {
    if (!opsi || opsi.length === 0) return "Tidak ada opsi";
    return "Opsi: " + opsi.map(o => o.opsi || o).join(", ");
  };

  const tipeLabel = {
    pilihan_tunggal: "Pilihan Tunggal",
    pilihan_ganda: "Pilihan Ganda",
    teks_pendek: "Teks Pendek",
    skala: "Skala",
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-700">

      {/* KUESIONER SELECTOR */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Pilih Kuesioner</label>
        {loadingKuesioner ? (
          <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 size={16} className="animate-spin" /> Memuat kuesioner...</div>
        ) : kuesionerList.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada kuesioner. Buat kuesioner terlebih dahulu.</p>
        ) : (
          <select
            value={selectedKuesionerId || ""}
            onChange={(e) => setSelectedKuesionerId(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50 text-slate-700 font-medium"
          >
            {kuesionerList.map((k) => (
              <option key={k.id} value={k.id}>{k.judul} {k.status ? `(${k.status})` : ""}</option>
            ))}
          </select>
        )}
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/wb-admin/kuisoner/tambah-pertanyaan", { state: { kuesionerId: selectedKuesionerId } })}
          disabled={!selectedKuesionerId}
          className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
        >
          <Plus size={18} /> Tambah Pertanyaan
        </button>
        <button onClick={() => navigate("/wb-admin/kuisoner/lihat-jawaban", { state: { kuesionerId: selectedKuesionerId } })} disabled={!selectedKuesionerId} className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50">
          <Eye size={18} /> Lihat Jawaban
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Pertanyaan</p>
          {/* UPDATE: Menggunakan text-primary */}
          <p className="text-3xl font-black text-primary">{questions.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-b-4 border-b-green-500">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-wider mb-1">Aktif</p>
          <p className="text-3xl font-black text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-b-4 border-b-orange-400">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider mb-1">Draf</p>
          <p className="text-3xl font-black text-orange-500">{draftCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-b-4 border-b-slate-400">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Disembunyikan</p>
          <p className="text-3xl font-black text-slate-600">{hiddenCount}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full lg:w-auto no-scrollbar mask-gradient">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                filter === cat
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white text-slate-500 border-gray-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* KANAN: Tombol Filter Status (Tersembunyi & Draf) */}
        <div className="flex gap-2 self-end lg:self-auto w-full sm:w-auto overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          <button
            onClick={() => setFilter("Tersembunyi")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
              filter === "Tersembunyi"
                ? "bg-slate-600 text-white border-slate-600 shadow-md"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <EyeOff size={14} /> Tersembunyi ({hiddenCount})
          </button>

          <button
            onClick={() => setFilter("Draf")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
              filter === "Draf"
                ? "bg-orange-500 text-white border-orange-500 shadow-md"
                : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50"
            }`}
          >
            <Archive size={14} /> Draf ({draftCount})
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loadingQuestions ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Loader2 size={32} className="animate-spin text-primary mx-auto mb-2" />
            <p className="text-slate-400 font-medium text-sm">Memuat pertanyaan...</p>
          </div>
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              className={`group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-4 relative overflow-hidden ${
                q.status_pertanyaan === "TERLIHAT" ? "border-l-4 border-l-primary" : q.status_pertanyaan === "DRAF" ? "border-l-4 border-l-orange-400" : "border-l-4 border-l-slate-300 bg-slate-50/50"
              }`}
            >
              <div className="hidden sm:block pt-1 cursor-grab text-slate-300 hover:text-slate-500">
                <GripVertical size={20} />
              </div>

              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                    <ListChecks size={12} />
                    {tipeLabel[q.tipe_pertanyaan] || q.tipe_pertanyaan}
                  </span>
                  {q.kategori && (
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {q.kategori}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    q.status_pertanyaan === "TERLIHAT" ? "bg-green-100 text-green-700" : q.status_pertanyaan === "DRAF" ? "bg-orange-100 text-orange-700" : "bg-slate-200 text-slate-600"
                  }`}>
                    {q.status_pertanyaan}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-1">{q.pertanyaan}</h4>
                <p className="text-xs text-slate-500 font-medium bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">{formatOpsi(q.opsi)}</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
                <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Edit">
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => updateStatus(q.id, q.status_pertanyaan === "TERSEMBUNYI" ? "TERLIHAT" : "TERSEMBUNYI")}
                  className={`p-2 rounded-lg transition-all ${q.status_pertanyaan === "TERSEMBUNYI" ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
                  title={q.status_pertanyaan === "TERSEMBUNYI" ? "Tampilkan" : "Sembunyikan"}
                >
                  {q.status_pertanyaan === "TERSEMBUNYI" ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Hapus"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <Ghost size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium text-sm">{!selectedKuesionerId ? "Pilih kuesioner terlebih dahulu." : "Tidak ada pertanyaan dalam kategori ini."}</p>
          </div>
        )}

        <button
            onClick={() => navigate("/wb-admin/kuisoner/tambah-pertanyaan", { state: { kuesionerId: selectedKuesionerId } })}
            disabled={!selectedKuesionerId}
            className="cursor-pointer w-full py-8 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-primary hover:text-primary hover:bg-white transition-all group disabled:opacity-50"
        >
          <div className="p-3 bg-slate-100 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
             <Plus size={24} />
          </div>
          <span className="text-sm font-bold">Tambah Pertanyaan Lain</span>
        </button>
      </div>
    </div>
  );
}
