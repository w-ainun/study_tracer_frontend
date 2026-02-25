import React from "react";

export default function DateOfBirthInput({ onChange, isRequired, value }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-secondary uppercase">
        Tanggal Lahir {isRequired && <span className="text-red-500">*</span>}
      </label>
      <input
        type="date"
        // Gunakan value dari props formData
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 bg-white border border-fourth rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-slate-700"
      />
    </div>
  );
}