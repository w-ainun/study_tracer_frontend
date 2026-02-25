import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  Building2,
  Share2,
  AlertCircle,
  Loader2,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { STORAGE_BASE_URL } from '../../api/axios';
import banner from '../../assets/banner.jfif';

const JobDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/lowongan/${id}`);
        setJob(res.data?.data || res.data);
      } catch (err) {
        setError('Lowongan tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#3C5759]" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-gray-400" />
        <p className="text-gray-500 font-medium">{error || 'Lowongan tidak ditemukan'}</p>
        <button onClick={() => navigate(-1)} className="text-[#3C5759] font-semibold hover:underline">
          Kembali
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-600 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'closed': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getApprovalLabel = (status) => {
    switch (status) {
      case 'approved': return 'DISETUJUI';
      case 'pending': return 'MENUNGGU';
      case 'rejected': return 'DITOLAK';
      default: return status?.toUpperCase();
    }
  };

  const fotoUrl = job.foto
    ? (job.foto.startsWith('http') ? job.foto : `${STORAGE_BASE_URL}/${job.foto}`)
    : banner;

  return (
    // Tambahkan relative agar layout anak bisa diatur
    <div className="min-h-screen bg-[#F8FAFC] relative">

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* 1. TOMBOL KEMBALI - Diperbaiki */}
        {/* Tidak menggunakan fixed, tapi diletakkan di awal flow konten agar tidak tertutup sidebar */}
        <div>
          <Link
            to="/wb-admin/jobs"
            className="flex items-center gap-2 text-third hover:text-primary transition-colors mb-8 text-sm font-medium group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Kembali
          </Link>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* --- KOLOM KIRI (Konten Utama) --- */}
          <div className="lg:col-span-8 space-y-5">

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">

              {/* Gambar Full */}
              <div className="w-full h-56 md:h-[400px] bg-gray-50 flex items-center justify-center relative p-2">
                <img
                  src={fotoUrl}
                  alt="Lowongan"
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                  onError={(e) => { e.target.src = banner; }}
                />
              </div>

              {/* Info Detail */}
              <div className="p-5 md:p-6 relative">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#3C5759]/10 rounded-lg flex items-center justify-center">
                             <Building2 size={16} className="text-[#3C5759]" />
                        </div>
                        <span className="text-[#3C5759] font-bold text-sm">
                            {job.perusahaan?.nama || '-'}
                        </span>
                    </div>

                    <h1 className="text-xl md:text-3xl font-black text-gray-900 leading-tight">
                        {job.judul}
                    </h1>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 items-start md:items-end">
                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    {job.approval_status && (
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border ${
                        job.approval_status === 'approved' ? 'text-green-600 border-green-200 bg-green-50' :
                        job.approval_status === 'pending' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                        'text-red-600 border-red-200 bg-red-50'
                      }`}>
                        {getApprovalLabel(job.approval_status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="p-1.5 bg-[#E8F0F0] rounded-lg text-[#3C5759]">
                  <FileText size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Deskripsi Pekerjaan</h2>
              </div>
              <div className="prose prose-slate prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {job.deskripsi || 'Tidak ada deskripsi yang tersedia.'}
              </div>
            </div>
          </div>

          {/* --- KOLOM KANAN (Sidebar Ringkasan) --- */}
          <div className="lg:col-span-4 space-y-5">
            <div className="lg:sticky lg:top-6 space-y-5">

              {/* Card Ringkasan */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5 hover:shadow-md transition-shadow">
                <h3 className="font-black text-[#3C5759] uppercase tracking-widest text-[11px] border-b border-gray-100 pb-3">
                  Detail Ringkasan
                </h3>

                <div className="space-y-4">
                  {[
                    { icon: MapPin, label: "Lokasi", value: job.lokasi || job.perusahaan?.kota?.nama },
                    { icon: Clock, label: "Tipe Pekerjaan", value: job.tipe_pekerjaan },
                    { icon: Calendar, label: "Batas Melamar", value: job.lowongan_selesai },
                    { icon: Briefcase, label: "Perusahaan", value: job.perusahaan?.nama }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-gray-600 group/item">
                      <div className="p-2 bg-gray-50 rounded-lg text-[#3C5759] group-hover/item:bg-[#3C5759] group-hover/item:text-white transition-colors shrink-0 mt-0.5">
                        <item.icon size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-sm font-bold text-gray-800 leading-tight">{item.value || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-[#3C5759] rounded-2xl p-5 text-white shadow-lg shadow-[#3C5759]/20 relative overflow-hidden transition-transform hover:scale-[1.01]">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={18} className="text-white/70" />
                      <h3 className="font-bold text-sm">Info Admin</h3>
                  </div>
                  <p className="text-[11px] text-white/80 leading-relaxed font-medium">
                    Pastikan lowongan ini memenuhi standar komunitas sebelum menyetujuinya. Periksa kelengkapan deskripsi dan validitas perusahaan.
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default JobDetail;
