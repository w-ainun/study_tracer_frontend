import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  FileDown,
  FileSpreadsheet,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  Users,
  ArrowLeft,
  Loader2
} from "lucide-react";
import SmoothDropdown from "../../components/admin/SmoothDropdown";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { alertError } from "../../utilitis/alert";

// Sub-komponen StatCard
function StatCard({ icon, label, value, bgColor, iconColor, className = "" }) {
  return (
    <div className={`p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 ${bgColor} ${className}`}>
      <div className={`p-3.5 rounded-xl ${iconColor} bg-slate-50 border border-slate-100`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function LihatJawaban() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [kuesionerList, setKuesionerList] = useState([]);
  const [selectedKuesionerId, setSelectedKuesionerId] = useState(location.state?.kuesionerId || null);
  const [loadingKuesioner, setLoadingKuesioner] = useState(true);

  const [jawabanList, setJawabanList] = useState([]);
  const [loadingJawaban, setLoadingJawaban] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });

  // Fetch kuesioner list
  useEffect(() => {
    (async () => {
      setLoadingKuesioner(true);
      try {
        const res = await adminApi.getKuesioner({}, 100);
        const list = res.data?.data?.data || res.data?.data || [];
        setKuesionerList(list);
        if (!selectedKuesionerId && list.length > 0) setSelectedKuesionerId(list[0].id);
      } catch { setKuesionerList([]); }
      finally { setLoadingKuesioner(false); }
    })();
  }, []);

  // Fetch jawaban
  const fetchJawaban = useCallback(async (page = 1) => {
    if (!selectedKuesionerId) { setJawabanList([]); return; }
    setLoadingJawaban(true);
    try {
      const res = await adminApi.getKuesionerJawaban(selectedKuesionerId, { page, search: searchTerm || undefined });
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setJawabanList(data);
        setPagination({ current_page: 1, last_page: 1, total: data.length, per_page: data.length });
      } else {
        setJawabanList(data?.data || []);
        setPagination({
          current_page: data?.current_page || 1,
          last_page: data?.last_page || 1,
          total: data?.total || 0,
          per_page: data?.per_page || 15,
        });
      }
    } catch { setJawabanList([]); }
    finally { setLoadingJawaban(false); }
  }, [selectedKuesionerId, searchTerm]);

  useEffect(() => { fetchJawaban(1); }, [fetchJawaban]);

  const handleViewDetail = (alumniId) => {
    navigate(`/wb-admin/kuisoner/lihat-jawaban/detail/${alumniId}`, { state: { kuesionerId: selectedKuesionerId } });
  };

  const totalResponden = pagination.total;
  const selesaiCount = jawabanList.filter(j => j.status === "Selesai" || j.status === "selesai").length;
  const belumCount = jawabanList.filter(j => j.status !== "Selesai" && j.status !== "selesai").length;

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-700">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <Link
          to="/wb-admin/kuisoner"
          className="flex items-center gap-2 text-third hover:text-primary transition-colors text-sm font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali
        </Link>

        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
            <FileDown size={18} /> 
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3D5A5C] text-white rounded-xl text-sm font-bold shadow-md shadow-[#3D5A5C]/20 hover:bg-[#2D4345] transition-all active:scale-95">
            <FileSpreadsheet size={18} /> 
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* --- Kuesioner Selector --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Pilih Kuesioner</label>
        {loadingKuesioner ? (
          <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 size={16} className="animate-spin" /> Memuat...</div>
        ) : (
          <select
            value={selectedKuesionerId || ""}
            onChange={(e) => setSelectedKuesionerId(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50 text-slate-700 font-medium"
          >
            <option value="">-- Pilih Kuesioner --</option>
            {kuesionerList.map((k) => (
              <option key={k.id} value={k.id}>{k.judul}</option>
            ))}
          </select>
        )}
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <StatCard 
          icon={<Users size={24} />} 
          label="Total Responden" 
          value={totalResponden.toLocaleString()} 
          bgColor="bg-white" 
          iconColor="text-[#3D5A5C]" 
        />
        <StatCard 
          icon={<TrendingUp size={24} />} 
          label="Selesai" 
          value={selesaiCount} 
          bgColor="bg-white" 
          iconColor="text-emerald-500" 
        />
        <StatCard 
          icon={<ClipboardList size={24} />} 
          label="Belum Selesai" 
          value={belumCount} 
          bgColor="bg-white" 
          iconColor="text-orange-500" 
          className="sm:col-span-2 lg:col-span-1" 
        />
      </div>

      {/* --- Filters Section (FIXED ALIGNMENT) --- */}
      {/* Menggunakan h-12 untuk semua elemen agar tingginya presisi sama */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        
        {/* Search Bar (Flex-1 agar mengisi sisa ruang) */}
        <div className="relative flex-1 h-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama alumni atau ID..."
            className="w-full pl-12 pr-4 h-full bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3D5A5C]/20 focus:border-[#3D5A5C] transition-all shadow-sm placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Dropdowns (Fixed width atau proportional) */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Wrapper div dengan h-12 untuk memaksa tinggi dropdown */}
          <div className="w-full sm:w-56 h-12">
            <SmoothDropdown options={["Semua Jurusan", "Teknik", "Ekonomi"]} placeholder="Semua Jurusan" />
          </div>
          <div className="w-full sm:w-56 h-12">
            <SmoothDropdown options={["2023", "2022", "2021"]} placeholder="Tahun Kelulusan" />
          </div>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-5 pl-8">Nama Alumni</th>
                <th className="px-6 py-5">Jurusan</th>
                <th className="px-6 py-5 text-center">Tahun</th>
                <th className="px-6 py-5">Tgl. Pengisian</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 pr-8 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loadingJawaban ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 size={24} className="animate-spin text-primary mx-auto mb-2" /><p className="text-xs text-slate-400">Memuat jawaban...</p></td></tr>
              ) : jawabanList.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400 text-sm">{selectedKuesionerId ? "Belum ada jawaban untuk kuesioner ini." : "Pilih kuesioner terlebih dahulu."}</td></tr>
              ) : (
              jawabanList.map((alumni) => (
                <tr key={alumni.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group last:border-0">
                  <td className="px-6 py-4 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-400 font-bold text-sm">
                        {(alumni.nama || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{alumni.nama || alumni.name || "-"}</p>
                        <p className="text-[11px] text-slate-400 font-medium">ID: {alumni.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-600 block truncate max-w-[200px]">{alumni.jurusan || alumni.prodi || "-"}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{alumni.tahun_lulus || alumni.tahun || "-"}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{alumni.tanggal_mengisi || alumni.tanggal || alumni.created_at?.slice(0, 10) || "-"}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${
                      (alumni.status === "Selesai" || alumni.status === "selesai")
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-orange-50 text-orange-600 border-orange-100"
                    }`}>
                      {alumni.status || "Selesai"}
                    </span>
                  </td>
                  <td className="px-6 py-4 pr-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetail(alumni.id || alumni.alumni_id)}
                        className="p-2 text-slate-400 hover:text-[#3D5A5C] hover:bg-[#3D5A5C]/10 rounded-lg transition-all active:scale-95" 
                        title="Lihat Detail Jawaban"
                      >
                        <Eye size={18} />
                      </button>
                      
                      <button className="p-2 text-slate-400 hover:text-[#3D5A5C] hover:bg-[#3D5A5C]/10 rounded-lg transition-all active:scale-95" title="Download PDF">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
            Menampilkan <span className="text-slate-700">{jawabanList.length}</span> dari <span className="text-slate-700">{pagination.total}</span> data
          </p>
          {pagination.last_page > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => fetchJawaban(pagination.current_page - 1)}
                className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#3D5A5C] hover:border-[#3D5A5C] transition-all disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="w-9 h-9 flex items-center justify-center text-slate-400">...</span>}
                      <button
                        onClick={() => fetchJawaban(p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold ${
                          p === pagination.current_page
                            ? "bg-[#3D5A5C] text-white shadow-md shadow-[#3D5A5C]/20"
                            : "text-slate-500 hover:bg-slate-200 transition-colors"
                        }`}
                      >{p}</button>
                    </React.Fragment>
                  ))}
              </div>
              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchJawaban(pagination.current_page + 1)}
                className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#3D5A5C] hover:border-[#3D5A5C] transition-all disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}