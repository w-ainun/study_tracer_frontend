import React, { useState } from "react";
import LoginImage from "../assets/login_image.webp";
import Logo from "../assets/icon.png";
import { Mail, MoveRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({ email, password });
      console.log(user.role)
      if (user.role === "admin") {
        navigate("/wb-admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Login gagal. Periksa email dan password Anda.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-fourtd items-center justify-center p-4 overflow-hidden">
      <div className="flex w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden h-[75vh] lg:h-[85vh]">
        {/* Bagian Kiri: Banner Gambar */}
        <div className="hidden lg:block lg:w-1/2 h-full relative">
          <img
            src={LoginImage}
            alt="Login Visual"
            className="w-full h-full object-cover"
          />
          <div className="bg-black/30 absolute top-0 w-full h-full"></div>
          <div className="absolute bottom-0 z-10 p-5">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="" className="w-15" />
              <h1 className="font-extrabold text-fourth">
                Alumni Tracer Study
              </h1>
            </div>
            <p className="text-fourth text-medium">
              Masuk dan terhubung kembali dengan SMKN 1 Gondang. Pantau peluang
              kerja dan tetap dekat dengan sesama alumni.
            </p>
          </div>
        </div>

        {/* Bagian Kanan: Form Login */}
        <div className="w-full lg:w-1/2 py-3 px-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <img src={Logo} alt="logo" className="w-15" />
              <div>
                <h1 className="font-extrabold text-secondary">
                  Alumni Tracer Study
                </h1>
                <p className="font-light text-xs text-third">
                  SMK Negeri 1 Gondang
                </p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-secondary mb-3 ">
              Selamat Datang
            </h2>

            {/* Social Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <p className="text-secondary text-sm">
                Masukan email dan password untuk mengakses akun anda
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-third">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 p-3 bg-fourth border border-third rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"} // Logic perubahan type
                    placeholder="Masukkan Password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all pr-12" // Tambah padding kanan (pr-12) agar teks tidak tertutup icon
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff size={20} /> // Icon mata dicoret
                    ) : (
                      <Eye size={20} /> // Icon mata terbuka
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-secondary"
                  />
                  Ingatkan saya
                </label>
                <Link
                  to={"/reset-password"}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Lupa password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-secondary text-white font-bold py-3 rounded-lg transition-colors mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <MoveRight width={20} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-sm text-gray-500 text-center">
              Belum punya akun alumni?{" "}
              <Link
                to={"/register"}
                className="text-blue-600 hover:underline font-bold"
              >
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
