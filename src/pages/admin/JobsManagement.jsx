import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Download,
  Check,
  X,
  Pencil,
  Trash2,
  RotateCcw,
  Briefcase,
  MapPin,
  Layers,
  ChartNoAxesCombined,
  Hourglass,
  CalendarClock,
  View,
  Loader2
} from "lucide-react";

import banner from "../../assets/banner.jfif";
// import Header from "../../components/admin/Header";
// import SideBar from "../../components/admin/SideBar";
import TambahLowongan from "./TambahLowongan";
import { adminApi } from "../../api/admin";
import { STORAGE_BASE_URL } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// --- Helper & JobCard Component ---
const getDisplayStatus = (job) => {
  if (job.approval_status === "pending") return "MENUNGGU PERSETUJUAN";
  if (job.status === "closed") return "BERAKHIR";
  if (job.approval_status === "rejected") return "DITOLAK";
  if (job.status === "published" && job.approval_status === "approved") return "AKTIF";
  if (job.status === "draft") return "DRAFT";
  return job.status?.toUpperCase() || "-";
};

const JobCard = ({ job, onApprove, onReject, onDelete }) => {
  const navigate = useNavigate();
  const displayStatus = getDisplayStatus(job);

  const getStatusColor = (status) => {
    switch (status) {
      case "MENUNGGU PERSETUJUAN": return "bg-orange-100 text-orange-600 border-orange-200";
      case "AKTIF": return "bg-green-100 text-green-600 border-green-200";
      case "BERAKHIR": return "bg-red-100 text-red-600 border-red-200";
      case "DITOLAK": return "bg-red-100 text-red-600 border-red-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getBorderColor = (status) => {
    switch (status) {
      case "MENUNGGU PERSETUJUAN": return "border-l-4 border-l-orange-400";
      case "AKTIF": return "border-l-4 border-l-green-400";
      case "BERAKHIR": return "border-l-4 border-l-red-400";
      case "DITOLAK": return "border-l-4 border-l-red-400";
      default: return "border-l-4 border-l-gray-400";
    }
  };

  const fotoUrl = job.foto
    ? (job.foto.startsWith('http') ? job.foto : `${STORAGE_BASE_URL}/${job.foto}`)
    : banner;

  return (
    <div
      onClick={() => navigate(`/wb-admin/jobs/job-detail/${job.id}`)}
      className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 cursor-pointer group/card ${getBorderColor(displayStatus)}`}
    >
      <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0 w-full">
        <div className="w-full sm:w-24 h-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 relative group-hover/card:shadow-inner transition-all">
          <img
            src={fotoUrl}
            alt={job.perusahaan?.nama || job.judul}
            className="w-full h-full object-cover opacity-90 group-hover/card:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = banner; }}
          />
        </div>

        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusColor(displayStatus)}`}>
              {displayStatus}
            </span>
            {job.lowongan_selesai && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-md">
                <CalendarClock size={10} />
                Berakhir {job.lowongan_selesai}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-black text-gray-800 truncate group-hover/card:text-primary transition-colors leading-tight">
              {job.judul}
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-0.5">{job.perusahaan?.nama || '-'}</p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 font-bold items-center">
            <div className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-400"/> {job.lokasi || job.perusahaan?.kota?.nama || '-'}</div>
            {job.tipe_pekerjaan && (
                <>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-1.5"><Layers size={12} className="text-gray-400"/> {job.tipe_pekerjaan}</div>
                </>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2 self-end md:self-center flex-shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 border-gray-50 pt-3 md:pt-0 mt-2 md:mt-0"
        onClick={(e) => e.stopPropagation()}
      >
        {displayStatus === "MENUNGGU PERSETUJUAN" ? (
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button onClick={() => onApprove(job.id)} title="Setujui" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 hover:shadow-md transition-all active:scale-95 text-xs font-bold">
                    <Check size={14} strokeWidth={3} /> Setujui
                </button>
                <button onClick={() => onReject(job.id)} title="Tolak" className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-95">
                    <X size={16} strokeWidth={2.5} />
                </button>
            </div>
            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>
            <button title="Edit" className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all active:scale-95"><Pencil size={18} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
             {(displayStatus === "BERAKHIR" || displayStatus === "DITOLAK") && (
                <button title="Posting Ulang" className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all active:scale-95 border border-blue-100"><RotateCcw size={18} /></button>
             )}
            <button title="Edit" className="p-2 text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-primary rounded-xl transition-all active:scale-95 border border-slate-100"><Pencil size={18} /></button>
            <button onClick={() => onDelete(job.id)} title="Hapus" className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all active:scale-95 border border-rose-100"><Trash2 size={18} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
export default function ManajemenPekerjaan() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [lowonganStats, setLowonganStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. UPDATE: Menambahkan "Ditolak" ke dalam Filter Map
  const tabFilterMap = {
    "Semua": {},
    "Menunggu": { approval_status: "pending" },
    "Aktif": { status: "published", approval_status: "approved" },
    "Berakhir": { status: "closed" },
    "Ditolak": { approval_status: "rejected" } // Filter baru
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { ...tabFilterMap[activeTab] };
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      const res = await adminApi.getLowongan(filters, 50);
      const data = res.data?.data?.data || res.data?.data || [];
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  const filteredJobs = useMemo(() => {
    if (!selectedCategory) return jobs;
    return jobs.filter(job => job.tipe_pekerjaan === selectedCategory);
  }, [jobs, selectedCategory]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getLowonganStats();
      const data = res.data?.data || res.data || {};
      setLowonganStats(data);
      setCategories(data.categories || []);
    } catch { }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleApprove = async (id) => { await adminApi.approveLowongan(id); fetchJobs(); fetchStats(); };
  const handleReject = async (id) => { await adminApi.rejectLowongan(id); fetchJobs(); fetchStats(); };
  const handleDelete = async (id) => { if (confirm("Yakin hapus?")) { await adminApi.deleteLowongan(id); fetchJobs(); fetchStats(); } };
  const handleLowonganCreated = () => { setIsModalOpen(false); fetchJobs(); fetchStats(); };

  const handleExportCSV = () => {
    if (filteredJobs.length === 0) return;
    const headers = ['Judul', 'Perusahaan', 'Lokasi', 'Tipe Pekerjaan', 'Status', 'Tanggal Berakhir'];
    const rows = filteredJobs.map(job => [
      job.judul || '', job.perusahaan?.nama || '', job.lokasi || '', job.tipe_pekerjaan || '', getDisplayStatus(job), job.lowongan_selesai || '',
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `lowongan.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="space-y-6">

        {/* TOMBOL MOBILE (Hanya muncul di Layar Kecil) */}
        <div className="grid grid-cols-2 gap-3 lg:hidden">
            <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 text-primary font-bold rounded-xl hover:bg-gray-50 hover:border-primary active:scale-95 transition-all text-xs shadow-sm"
            >
                <Download size={16} />
                <span>Eksport CSV</span>
            </button>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 p-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all text-xs shadow-md shadow-primary/20"
            >
                <Plus size={16} />
                <span>Buat Lowongan</span>
            </button>
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">

          {/* Main Content (List Card) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* 2. UPDATE: Menambahkan "Ditolak" ke Tampilan Tab dan menambahkan overflow-x-auto */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto no-scrollbar">
                {["Semua", "Menunggu", "Aktif", "Berakhir", "Ditolak"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer px-3 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === tab ? "bg-primary text-white shadow-md scale-105" : "text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 group w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Cari Lowongan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                    <p className="font-medium">Tidak ada lowongan ditemukan</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">

            {/* TOMBOL DESKTOP (Hanya muncul di Layar Besar/Sidebar) */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
                <button
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 text-primary font-bold rounded-xl hover:bg-gray-50 hover:border-primary active:scale-95 transition-all text-xs shadow-sm group"
                >
                    <Download size={16} className="group-hover:scale-110 transition-transform"/>
                    <span>Eksport CSV</span>
                </button>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 p-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all text-xs shadow-md shadow-primary/20 group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform"/>
                    <span>Buat Lowongan</span>
                </button>
            </div>

            {/* Kategori */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4 gap-2">
                <h2 className="font-black text-primary text-sm uppercase tracking-wider">Kategori</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.length > 0 ? (
                  <>
                    <span onClick={() => setSelectedCategory(null)} className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${!selectedCategory ? 'bg-primary text-white border-primary shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-white'}`}>Semua</span>
                    {categories.map((cat) => (
                      <span key={cat.name} onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)} className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${selectedCategory === cat.name ? 'bg-primary text-white border-primary shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-white'}`}>
                        {cat.name} <span className={`text-[9px] ml-1 opacity-70`}>{cat.count}</span>
                      </span>
                    ))}
                  </>
                ) : <span className="text-gray-400 text-xs italic">Belum ada kategori tersedia</span>}
              </div>
            </div>

            {/* Ringkasan */}
            <div className="bg-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/20 relative overflow-hidden">
              <div className="relative z-10">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><ChartNoAxesCombined size={20} className="text-white/80"/> Ringkasan</h2>
                  <div className="space-y-3">
                    {[
                      { label: "Pekerjaan Aktif", value: lowonganStats?.active ?? "-", icon: <Check size={14} /> },
                      { label: "Menunggu Tinjauan", value: lowonganStats?.pending ?? "-", color: "text-orange-300", icon: <Hourglass size={14}/> },
                      { label: "Baru Minggu Ini", value: lowonganStats?.new_this_week ?? "-", icon: <CalendarClock size={14}/> },
                      { label: "Total Lowongan", value: lowonganStats?.total ?? "-", icon: <Layers size={14}/>},
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0 group">
                        <span className="text-xs font-medium text-white/70 flex items-center gap-2 group-hover:text-white transition-colors">{item.icon} {item.label}</span>
                        <span className={`text-sm font-black ${item.color || "text-white"}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
              </div>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
      <TambahLowongan isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleLowonganCreated} />
    </div>
  );
}
