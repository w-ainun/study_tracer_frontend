import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  FileText,
  Clock,
  UserPlus,
  Briefcase,
  Building2,
  Store,
  Factory,
  Landmark,
} from "lucide-react";
import {
  ChartJurusan,
  ChartKarir,
  ChartsPenyelesaian,
} from "../../components/admin/Chart";
import { adminApi } from '../../api/admin';

// --- Komponen Skeleton Loading ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const DashboardLoading = () => (
  <div className="space-y-6 p-1">
    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-fourth shadow-sm h-32 flex flex-col justify-between">
          <Skeleton className="w-12 h-12" />
          <div className="space-y-2">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-16 h-6" />
          </div>
        </div>
      ))}
    </div>

    {/* Section Waiting List Skeleton */}
    <div className="bg-white border border-fourth rounded-2xl p-6 shadow-sm">
      <Skeleton className="w-64 h-6 mb-8" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="flex justify-center"><Skeleton className="w-48 h-48 rounded-full" /></div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="w-full h-24 rounded-2xl" />
          <Skeleton className="w-full h-24 rounded-2xl" />
        </div>
      </div>
    </div>

    {/* Charts Skeleton */}
    <div className="bg-white border border-fourth rounded-2xl p-6 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="lg:col-span-2 h-64 rounded-2xl" />
      </div>
    </div>
  </div>
);

// --- Komponen StatCard ---
const StatCard = ({ icon: Icon, label, value, badge, badgeColor }) => (
  <div className="bg-white p-5 md:p-6 rounded-2xl border border-fourth shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
    <div className="flex flex-col gap-2 xl:flex-row md:justify-between items-start">
      <div className="p-3 bg-fourth rounded-xl text-primary flex-shrink-0">
        <Icon size={24} />
      </div>
      {badge && (
        <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${badgeColor} whitespace-nowrap`}>
          {badge}
        </span>
      )}
    </div>
    <div>
      <p className="text-third text-xs md:text-sm font-medium">{label}</p>
      <h3 className="text-xl md:text-2xl font-bold text-primary mt-1">
        {value}
      </h3>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashData, setDashData] = useState(null);
  const [lowonganStats, setLowonganStats] = useState(null);
  const [topCompanies, setTopCompanies] = useState([]);
  const [geographicDist, setGeographicDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [dashRes, lowRes, compRes, geoRes] = await Promise.all([
          adminApi.getDashboardStats().catch(() => null),
          adminApi.getLowonganStats().catch(() => null),
          adminApi.getTopCompanies().catch(() => null),
          adminApi.getGeographicDistribution().catch(() => null),
        ]);

        setDashData(dashRes?.data?.data || dashRes?.data || null);
        setLowonganStats(lowRes?.data?.data || lowRes?.data || null);
        setTopCompanies(compRes?.data?.data || compRes?.data || []);
        setGeographicDist(geoRes?.data?.data || geoRes?.data || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const companyIcons = [Building2, Building2, Store, Factory, Landmark];

  const statusDistribution = useMemo(() => {
    const dist = dashData?.status_distribution ?? [];
    if (dist.length > 0 && dashData?.total_users) {
      const totalInStatus = dist.reduce((sum, item) => sum + (item.total || 0), 0);
      const belumBekerja = dashData.total_users - totalInStatus;
      if (belumBekerja > 0) {
        return [...dist, { status: "Belum Bekerja", total: belumBekerja }];
      }
    }
    return dist;
  }, [dashData]);

  function hitungPersen(data) {
    const bagian = data[0]?.total?? 0
    const total = data.reduce((sum, item) => sum + item.total, 0);
    console.log(total)
    return Math.round((bagian / total) * 100);
  }

  const presentaseKerja = hitungPersen(statusDistribution)

  const dynamicStats = [
    {
      label: "Total Pengguna Aktif",
      value: dashData?.total_users ?? "-",
      icon: Users,
      badge: dashData?.users_growth != null ? `+${dashData.users_growth}%` : null,
      badgeColor: "bg-green-100 text-green-600",
    },
    {
      label: "Status Bekerja",
      value: `${presentaseKerja}%`,
      icon: ShieldCheck,
      badge: "Optimal",
      badgeColor: "bg-fourth text-secondary",
    },
    {
      label: "Kuesioner Aktif",
      value: dashData?.active_kuesioner ?? "-",
      icon: FileText,
      badge: "Active",
      badgeColor: "bg-green-100 text-green-600",
    },
    {
      label: "Total Menunggu",
      value: dashData?.pending_count ?? "-",
      icon: Clock,
      badge: "Butuh Aksi",
      badgeColor: "bg-orange-100 text-orange-600",
    },
  ];

  if (loading) return <DashboardLoading />;

  return (
    <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {dynamicStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* 2. Section Pendaftaran Alumni */}
      <div className="bg-white border border-fourth rounded-2xl p-4 md:p-6 shadow-sm">
        <h2 className="text-lg md:text-xl font-bold text-primary mb-6">
          Pendaftaran Alumni yang Menunggu
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="flex justify-center items-center">
            <ChartsPenyelesaian
              approved={dashData?.total_users ? (dashData.total_users - (dashData?.pending_users ?? 0)) : 0}
              total={dashData?.total_users ?? 0}
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            {[
              {
                title: "Pendaftaran Alumni Menunggu",
                count: dashData?.pending_users ?? 0,
                sub: "Permintaan akun baru menunggu verifikasi",
                icon: UserPlus,
                progress: dashData?.total_users ? `${Math.min(Math.round((dashData.pending_users / dashData.total_users) * 100), 100)}%` : "0%",
                link: "/wb-admin/manage-user",
              },
              {
                title: "Lowongan Kerja Menunggu",
                count: dashData?.pending_lowongan ?? 0,
                sub: "Postingan lowongan kerja yang menunggu",
                icon: Briefcase,
                progress: lowonganStats?.total ? `${Math.min(Math.round((dashData?.pending_lowongan / lowonganStats.total) * 100), 100)}%` : "0%",
                link: "/wb-admin/jobs",
              },
            ].map((item, i) => (
              <div key={i} className="p-4 md:p-5 border border-fourth rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-primary/30 transition-all">
                <div className="flex items-start md:items-center gap-4 w-full">
                  <div className="p-3 bg-fourth rounded-xl text-third group-hover:text-primary flex-shrink-0">
                    <item.icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-primary text-sm md:text-base truncate mr-2">{item.title}</h4>
                      <span className="text-xl md:text-2xl font-bold text-primary">{item.count}</span>
                    </div>
                    <p className="text-[11px] md:text-xs text-third mb-3">{item.sub}</p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary/40 h-full rounded-full" style={{ width: item.progress }} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(item.link)}
                  className="cursor-pointer w-full sm:w-auto px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all"
                >
                  Tinjau
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Profil & Statistik Alumni */}
      <div className="bg-white border border-fourth rounded-2xl p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
          <h2 className="text-lg md:text-xl font-bold text-primary">Profil & Statistik Alumni</h2>
          <div className="px-3 py-1 bg-fourth text-primary rounded-xl border flex-shrink-0">
            <p className="text-[10px] md:text-xs font-medium">Perbaruan Hari ini</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="w-full flex flex-col items-center text-center">
            <h1 className="text-primary text-base md:text-lg font-bold mb-4">Status Karir</h1>
            <div className="w-full max-w-[300px] lg:max-w-full">
              <ChartKarir data={statusDistribution} />
            </div>
          </div>

          <div className="w-full lg:col-span-2">
            <h1 className="text-primary text-base md:text-lg font-bold mb-4 text-center lg:text-left">Top 5 Alumni Setiap Jurusan</h1>
            <ChartJurusan data={dashData?.alumni_per_jurusan ?? []} />
          </div>
        </div>

        {/* Footer Stats Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-5">
          {/* Perusahaan Teratas */}
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-primary">5 Perusahaan Perekrut Teratas</h2>
            <div className="bg-white border border-fourth rounded-2xl overflow-hidden shadow-sm">
              {topCompanies.length > 0 ? topCompanies.map((company, index) => (
                <div key={index} className={`flex items-center justify-between p-4 hover:bg-fourth/30 transition-colors ${index !== topCompanies.length - 1 ? "border-b border-fourth" : ""}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-fourth rounded-lg text-third flex-shrink-0">
                      {React.createElement(companyIcons[index % companyIcons.length], { size: 18 })}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-primary text-xs md:text-sm truncate">{company.nama}</h4>
                      <p className="text-third text-[10px] truncate">{company.lokasi}</p>
                    </div>
                  </div>
                  <span className="bg-fourth text-primary px-3 py-1 rounded-full text-[9px] font-bold flex-shrink-0 ml-2">
                    {company.alumni_count} Alumni
                  </span>
                </div>
              )) : <div className="p-4 text-center text-gray-400 text-sm">Belum ada data perusahaan</div>}
            </div>
          </div>

          {/* Distribusi Geografis */}
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-primary">Distribursi Geografis</h2>
            <div className="bg-white border border-fourth rounded-2xl p-5 md:p-8 shadow-sm flex flex-col gap-5">
              {geographicDist.length > 0 ? geographicDist.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] md:text-xs">
                    <span className="font-bold text-primary uppercase tracking-wider">{item.provinsi || item.region}</span>
                    <span className="text-third font-medium">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-fourth h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              )) : <div className="text-center text-gray-400 text-sm">Belum ada data distribusi</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
