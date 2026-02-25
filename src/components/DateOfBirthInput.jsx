import React from "react";
import DatePicker from "react-datepicker";

// Import CSS bawaan library
import "react-datepicker/dist/react-datepicker.css";

export default function DateOfBirthInput({ onChange, isRequired, value }) {
  // Konversi string value (YYYY-MM-DD) ke Object Date untuk library
  const selectedDate = value ? new Date(value) : null;

  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-secondary uppercase block">
        Tanggal Lahir {isRequired && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative custom-datepicker">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            // Simpan kembali dalam format YYYY-MM-DD agar sinkron dengan database
            if (date) {
              const formattedDate = date.toISOString().split("T")[0];
              onChange(formattedDate);
            } else {
              onChange("");
            }
          }}
          // Fitur navigasi cepat:
          showMonthDropdown
          showYearDropdown
          dropdownMode="select" // Menggunakan dropdown agar tidak perlu scroll panjang
          yearDropdownItemNumber={100} // Menampilkan rentang 100 tahun ke belakang
          scrollableYearDropdown={true}
          
          placeholderText="Pilih tanggal"
          dateFormat="dd/MM/yyyy"
          className="w-full p-2.5 bg-white border border-fourth rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-slate-700"
        />
      </div>

      {/* Tambahkan sedikit CSS Global untuk merapikan ukuran dropdown jika perlu */}
      <style jsx global>{`
        .react-datepicker-wrapper {
          display: block;
          width: 100%;
        }
        .react-datepicker__header {
          background-color: white;
          border-bottom: 1px solid #e2e8f0;
        }
        .react-datepicker__day--selected {
          background-color: #3b82f6 !important; /* Sesuaikan dengan warna primary kamu */
          border-radius: 0.75rem;
        }
      `}</style>
    </div>
  );
}