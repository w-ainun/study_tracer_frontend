import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Briefcase, Database,
  FileText, LogOut, X,
  IdCardLanyard
} from 'lucide-react';
import Logo from '../../assets/icon.png';
import { Link, matchPath, useLocation, useNavigate  } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { alertConfirm } from '../../utilitis/alert';
import { useEffect } from 'react';

export default function SideBar({ active, setActive }) {
  const [activeMenu, setActiveMenu] = useState('Beranda');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation()

  const menuItems = [
    { name: 'Beranda', icon: <LayoutDashboard size={20} />, path: '/wb-admin' },
    { name: 'Manajemen Pengguna', icon: <Users size={20} />, path: '/wb-admin/manage-user' },
    { name: 'Manajemen Pekerjaan', icon: <Briefcase size={20} />, path: '/wb-admin/jobs' },
    { name: 'Status Karier', icon: <IdCardLanyard size={20} />, path: '/wb-admin/status-karir' },
    { name: 'Data Master', icon: <Database size={20} />, path: '/wb-admin/master' },
    { name: 'Kuesioner', icon: <FileText size={20} />, path: '/wb-admin/kuisoner' },
  ];

  const handleLogout = async () => {
    const confirm = await alertConfirm("Apakah Anda yakin ingin keluar?");
    if (!confirm.isConfirmed) return;

    setIsLoggingOut(true); // Mulai loading

    try {
      await logout();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const routes = [
    { path: "/wb-admin", title: "Beranda" },
    { path: "/wb-admin/manage-user", title: "Manajemen Pengguna" },
    { path: "/wb-admin/jobs/job-detail/:id", title: "Manajemen Pekerjaan" },
    { path: "/wb-admin/jobs", title: "Manajemen Pekerjaan" },
    { path: "/wb-admin/status-karir", title: "Status Karier" },
    { path: "/wb-admin/master", title: "Data Master" },
    { path: "/wb-admin/kuisoner", title: "Kuesioner" },
    { path: "/wb-admin/kuisoner/tambah-pertanyaan", title: "Kuesioner" },
    { path: "/wb-admin/kuisoner/lihat-jawaban", title: "Kuesioner" },
  ];


  const getTitle = () => {
    const current = routes.find((route) =>
      matchPath({ path: route.path, end: true }, location.pathname)
    );

    return current?.title || "Dashboard";
  };
  useEffect(() => {
    setActiveMenu(getTitle());
  }, [location.pathname]);

  return (
    <>
      {active && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setActive(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed lg:relative z-10
        w-72 md:w-65
        h-dvh
        bg-white border-r border-fourth
        flex flex-col
        transition-all duration-300 ease-in-out
        ${active ? 'translate-x-0' : '-translate-x-full lg:hidden'}
      `}>

        {/* Header Sidebar + Tombol Close */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className='w-10 md:w-12'/>
            <div className="min-w-0">
              <h1 className="text-primary font-bold leading-tight text-sm truncate">Alumni Tracer</h1>
              <p className="text-third text-[10px]">Admin Portal</p>
            </div>
          </div>

          {/* Tombol Close (Hanya muncul di Mobile) */}
          <button
            onClick={() => setActive(false)}
            className="lg:hidden p-2 text-third hover:bg-fourth rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items (Scrollable Area) */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => {
            const isActive = activeMenu === item.name;
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => {
                  setActiveMenu(item.name);
                  if(window.innerWidth < 1024) setActive(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-fourth text-primary font-bold shadow-sm'
                    : 'text-third hover:bg-fourth/50 hover:text-secondary'}
                `}
              >
                <span className={isActive ? 'text-primary' : 'text-third'}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section (Tetap di paling bawah) */}
        <div className="p-4 border-t border-fourth bg-white">
          <button
            onClick={ handleLogout }
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Keluar Aplikasi</span>
          </button>

          {/* Padding tambahan untuk HP dengan 'Home Indicator' (iPhone/Android terbaru) */}
          <div className="h-2 lg:hidden"></div>
        </div>
      </div>
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            {/* Spinner sederhana dengan Tailwind */}
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700 font-medium">Menghapus sesi...</p>
          </div>
        </div>
      )}
    </>
  );
}
