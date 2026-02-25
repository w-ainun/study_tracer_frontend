import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Calendar } from "lucide-react";

export default function YearsInput({ label, onSelect, isRequired, value }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const ref = useRef(null);

  // LOGIKA BARU: Sinkronisasi data dari formData (Parent) ke state internal
  useEffect(() => {
    if (value) {
      setSelectedYear(value);
    }
  }, [value]);

  // Generate tahun (misal dari 1980 sampai tahun depan)
  const currentYear = new Date().getFullYear() + 1;
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-[11px] font-bold text-secondary uppercase">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 bg-white border border-fourth rounded-xl text-sm flex justify-between items-center cursor-pointer hover:border-primary focus:ring-2 focus:ring-primary transition-all"
      >
        <span className={selectedYear ? "text-slate-800" : "text-gray-400"}>
          {selectedYear || "Pilih Tahun"}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-fourth rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {years.map((year) => (
            <div
              key={year}
              onClick={() => {
                setSelectedYear(year);
                onSelect(year); // Kirim ke parent
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-xs cursor-pointer hover:bg-fourth ${
                selectedYear === year ? "font-bold text-primary bg-blue-50" : "text-slate-600"
              }`}
            >
              {year}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}