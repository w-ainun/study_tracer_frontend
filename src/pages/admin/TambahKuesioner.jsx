import React, { useState } from "react";
import {
  Eye,
  Save,
  X,
  Plus,
  FileQuestionMark,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import SmoothDropdown from "../../components/admin/SmoothDropdown";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { alertSuccess, alertError } from "../../utilitis/alert";

export default function TambahPertanyaan() {
  const location = useLocation();
  const navigate = useNavigate();
  const kuesionerId = location.state?.kuesionerId;

  const [selectedCategory, setSelectedCategory] = useState("Bekerja");
  const [pertanyaanText, setPertanyaanText] = useState("");
  const [tipePertanyaan, setTipePertanyaan] = useState("Pilihan Tunggal");

  // Map display names to backend enum values
  const tipeMap = {
    "Pilihan Tunggal": "pilihan_tunggal",
    "Pilihan Ganda": "pilihan_ganda",
    "Teks Pendek": "teks_pendek",
    "Skala": "skala",
  };
  const [judulBagian, setJudulBagian] = useState("");
  const [saving, setSaving] = useState(false);

  const [options, setOptions] = useState([
    "Bekerja Penuh Waktu",
    "Tidak Bekerja"
  ]);

  const addOption = () => setOptions([...options, ""]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSimpan = async () => {
    if (!kuesionerId) {
      alertError("Kuesioner belum dipilih. Kembali dan pilih kuesioner terlebih dahulu.");
      return;
    }
    if (!pertanyaanText.trim()) {
      alertError("Pertanyaan wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        pertanyaan: pertanyaanText.trim(),
        tipe_pertanyaan: tipeMap[tipePertanyaan] || tipePertanyaan,
        kategori: selectedCategory,
        judul_bagian: judulBagian || null,
        opsi: tipePertanyaan === "Teks Pendek" ? [] : options.filter(o => o.trim()),
      };
      await adminApi.addPertanyaan(kuesionerId, payload);
      alertSuccess("Pertanyaan berhasil ditambahkan!");
      navigate("/wb-admin/kuisoner", { replace: true });
    } catch (e) {
      alertError(e?.response?.data?.message || "Gagal menyimpan pertanyaan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-slate-700">
      <div>
        <Link
          to="/wb-admin/kuisoner"
          className="flex items-center gap-2 text-third hover:text-primary transition-colors mb-8 text-sm font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-[#3D5A5C] font-bold">
            <FileQuestionMark size={20} />
            <h2>Tambah Pertanyaan {kuesionerId ? `(Kuesioner #${kuesionerId})` : ""}</h2>
          </div>
          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Mode Draft
          </span>
        </div>

        {!kuesionerId && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm rounded-xl p-4 mb-6">
            Kuesioner belum dipilih. <Link to="/wb-admin/kuisoner" className="underline font-bold">Kembali pilih kuesioner</Link>.
          </div>
        )}

        <div className="grid grid-cols-12 gap-12">
          {/* Left Column: Form */}
          <div className="col-span-8 space-y-6">
            <div>
              <SmoothDropdown
                label="Kategori Status Karier"
                options={["Bekerja", "Kuliah", "Wirausaha", "Cari Kerja"]}
                placeholder="Pilih status karier"
                isRequired={true}
                value={selectedCategory}
                onSelect={(val) => setSelectedCategory(val)}
              />
            </div>

            <div>
              <SmoothDropdown
                label="Tipe Pertanyaan"
                options={["Pilihan Tunggal", "Pilihan Ganda", "Teks Pendek", "Skala"]}
                placeholder="Pilih tipe pertanyaan"
                isRequired={true}
                value={tipePertanyaan}
                onSelect={(val) => setTipePertanyaan(val)}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-secondary uppercase">
                Pertanyaan <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="masukan pertanyaan kuisoner.."
                rows={4}
                value={pertanyaanText}
                onChange={(e) => setPertanyaanText(e.target.value)}
                className="mt-2 w-full p-3 bg-white border border-fourth rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <SmoothDropdown
                label="Judul Bagian"
                options={["Riwayat Pekerjaan", "Identitas Diri", "Pendidikan", "Wirausaha", "Pencari Kerja"]}
                placeholder="Pilih judul bagian"
                isRequired={false}
                value={judulBagian}
                onSelect={(val) => setJudulBagian(val)}
              />
            </div>

            <div className="bg-slate-50/50 border border-dashed border-gray-200 rounded-2xl p-6">
              <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.15em]">
                Opsi Jawaban
              </label>
              <div className="space-y-3">
                {options.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-3 group animate-in fade-in slide-in-from-top-1">
                    <div className="w-5 h-5 border-2 border-slate-300 rounded-full flex-shrink-0" />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Opsi ${idx + 1}`}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-[#3D5A5C] focus:outline-none transition-colors"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(idx)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addOption}
                className="mt-6 flex items-center gap-2 text-[#3D5A5C] font-bold text-xs hover:bg-[#3D5A5C] hover:text-white px-3 py-2 rounded-lg border border-[#3D5A5C] transition-all"
              >
                <Plus size={16} /> Tambahkan Opsi
              </button>
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="col-span-4 border-l border-gray-100 pl-8">
            <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-wider">
              Ringkasan
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl border bg-slate-50 border-gray-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Kategori</p>
                <p className="text-sm font-bold text-[#3D5A5C]">{selectedCategory}</p>
              </div>
              <div className="p-3 rounded-xl border bg-slate-50 border-gray-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tipe</p>
                <p className="text-sm font-bold text-[#3D5A5C]">{tipePertanyaan}</p>
              </div>
              {judulBagian && (
                <div className="p-3 rounded-xl border bg-slate-50 border-gray-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Judul Bagian</p>
                  <p className="text-sm font-bold text-[#3D5A5C]">{judulBagian}</p>
                </div>
              )}
              <div className="p-3 rounded-xl border bg-slate-50 border-gray-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Opsi</p>
                <p className="text-sm font-bold text-[#3D5A5C]">{(tipePertanyaan === "Teks Pendek") ? "-" : options.filter(o => o.trim()).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all">
              <Eye size={18} /> Pratinjau
            </button>
            <button
              onClick={handleSimpan}
              disabled={saving || !kuesionerId}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#3D5A5C] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2D4345] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
