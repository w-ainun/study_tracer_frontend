import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  LockKeyhole, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function Step1Account({ onNext, formData, updateFormData }) {
  const [errors, setErrors] = useState({});
  
  // State untuk mengatur visibilitas password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Format email tidak valid';
    if (!formData.password) errs.password = 'Password wajib diisi';
    else if (formData.password.length < 8) errs.password = 'Password minimal 8 karakter';
    if (formData.password !== formData.password_confirmation) errs.password_confirmation = 'Konfirmasi password tidak cocok';
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-fourth rounded-lg text-primary"><LockKeyhole size={20} /></div>
        <h3 className="font-bold text-primary">Pengaturan akun</h3>
      </div>

      <div className="space-y-4">
        {/* Input Email */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-secondary">Email</label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-third" size={16} />
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white border border-fourth rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary">Password <span className="text-red-500">*</span></label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-third" size={16} />
              <input
                // Ubah type berdasarkan state showPassword
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan Password Anda"
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                // Tambahkan padding kanan (pr-10) agar teks tidak tertutup ikon mata
                className="w-full pl-10 pr-10 py-3 bg-white border border-fourth rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              {/* Tombol Toggle Mata */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-third hover:text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-third italic">minimal 8 karakter dengan huruf dan angka</p>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Input Konfirmasi Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary">Konfirmasi Password <span className="text-red-500">*</span></label>
            <div className="relative mt-2">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-third" size={16} />
              <input
                // Ubah type berdasarkan state showConfirmPassword
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Masukkan Konfirmasi Password Anda"
                value={formData.password_confirmation}
                onChange={(e) => updateFormData({ password_confirmation: e.target.value })}
                // Tambahkan padding kanan (pr-10)
                className="w-full pl-10 pr-10 py-3 bg-white border border-fourth rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              {/* Tombol Toggle Mata */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-third hover:text-primary transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password_confirmation && <p className="text-xs text-red-500">{errors.password_confirmation}</p>}
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 md:px-8 py-3 bg-primary text-white rounded-xl text-xs md:text-sm font-bold hover:opacity-90 transition-all cursor-pointer"
        >
          Selanjutnya <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}