import React, { useState, useEffect } from 'react';
import { ChevronDown, Instagram, Linkedin, Facebook, Twitter, Check, Trash2, Plus } from 'lucide-react';
import { masterDataApi } from '../api/masterData';

const iconMap = {
  instagram: <Instagram size={18} className="text-pink-500" />,
  linkedin: <Linkedin size={18} className="text-blue-600" />,
  facebook: <Facebook size={18} className="text-blue-500" />,
  twitter: <Twitter size={18} className="text-sky-400" />,
};

const fallbackPlatforms = [
  { id: 1, label: 'Instagram', key: 'instagram' },
  { id: 2, label: 'LinkedIn', key: 'linkedin' },
  { id: 3, label: 'Facebook', key: 'facebook' },
  { id: 4, label: 'Twitter', key: 'twitter' },
];

export default function SosmedInput({ value, onChange }) {
  const [platforms, setPlatforms] = useState([]);
  const [socials, setSocials] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  // Fetch platforms from API
  useEffect(() => {
    masterDataApi.getSocialMedia()
      .then((res) => {
        const data = res.data.data || [];
        const mapped = data.map((p) => ({
          id: p.id,
          label: p.nama_sosmed || p.nama || p.platform,
          key: (p.nama_sosmed || p.nama || p.platform || '').toLowerCase().replace(/\s+/g, ''),
        }));
        setPlatforms(mapped);

        // Jika ada data awal dari parent
        if (value && value.length > 0) {
          setSocials(value.map(item => ({
            platformId: item.id_sosmed || item.platformId,
            url: item.url
          })));
        } else {
          // Default: Munculkan 1 baris input kosong dengan platform pertama
          if (mapped.length > 0) {
            setSocials([{ platformId: mapped[0].id, url: '' }]);
          }
        }
      })
      .catch(() => {
        setPlatforms(fallbackPlatforms);
        if (value && value.length > 0) {
          setSocials(value.map(item => ({ platformId: item.id_sosmed || item.platformId, url: item.url })));
        } else {
          // Default fallback: 1 baris kosong
          setSocials([{ platformId: fallbackPlatforms[0].id, url: '' }]);
        }
      });
  }, []);

  const getIcon = (p) => iconMap[p.key] || <span className="w-[18px] h-[18px] rounded-full bg-gray-300 inline-block" />;

  const fireOnChange = (updatedSocials) => {
    if (onChange) {
      // Filter URL kosong agar tidak mengotori database
      const result = updatedSocials
        .filter((s) => s.url && s.url.trim() !== "")
        .map((s) => ({ id_sosmed: s.platformId, url: s.url }));
      onChange(result);
    }
  };

  const addSocial = () => {
    const usedIds = socials.map(s => s.platformId);
    const nextAvailable = platforms.find(p => !usedIds.includes(p.id)) || platforms[0];
    
    if (socials.length < platforms.length) {
      const updated = [...socials, { platformId: nextAvailable.id, url: '' }];
      setSocials(updated);
    }
  };

  const removeSocial = (index) => {
    if (socials.length > 1) {
      const updated = socials.filter((_, i) => i !== index);
      setSocials(updated);
      fireOnChange(updated);
    }
  };

  const updateSocial = (index, field, value) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: value };
    setSocials(updated);
    fireOnChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-secondary tracking-wider uppercase">
          Sosial Media <span className="text-[10px] text-third italic lowercase">(opsional)</span>
        </label>

        {socials.length < platforms.length && (
          <button
            type="button"
            onClick={addSocial}
            className="flex items-center gap-1 text-[10px] font-bold text-primary bg-fourth px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer shadow-sm"
          >
            <Plus size={14} /> TAMBAH
          </button>
        )}
      </div>

      {/* List Inputan */}
      <div className="space-y-3">
        {socials.map((item, index) => {
          const selectedPlatform = platforms.find(p => p.id === item.platformId);
          const usedIds = socials.map(s => s.platformId).filter(id => id !== item.platformId);
          const availablePlatforms = platforms.filter(p => !usedIds.includes(p.id));

          return (
            <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className={`flex-1 flex items-center bg-white border rounded-xl transition-all duration-300
                ${openDropdownIndex === index ? 'border-primary ring-2 ring-primary/5' : 'border-fourth hover:border-primary/50'}`}>

                {/* Custom Dropdown */}
                <div className="relative border-r border-fourth">
                  <button
                    type="button"
                    onClick={() => setOpenDropdownIndex(openDropdownIndex === index ? null : index)}
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer min-w-[50px] justify-center"
                  >
                    {selectedPlatform && getIcon(selectedPlatform)}
                    <ChevronDown size={14} className={`text-third transition-transform duration-300 ${openDropdownIndex === index ? 'rotate-180' : ''}`} />
                  </button>

                  {openDropdownIndex === index && (
                    <div className="absolute left-0 top-full z-30 mt-2 w-48 bg-white border border-fourth rounded-xl shadow-xl overflow-hidden">
                      <ul className="py-1">
                        {availablePlatforms.map((p) => (
                          <li
                            key={p.id}
                            onClick={() => {
                              updateSocial(index, 'platformId', p.id);
                              setOpenDropdownIndex(null);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-fourth cursor-pointer transition-colors text-sm text-secondary"
                          >
                            {getIcon(p)}
                            <span>{p.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Input URL */}
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => updateSocial(index, 'url', e.target.value)}
                  placeholder={`Url ${selectedPlatform?.label || ''}`}
                  className="w-full p-2.5 text-sm outline-none bg-transparent text-secondary placeholder:text-third/50"
                />
              </div>

              {/* Tombol Trash - Hanya muncul jika baris > 1 */}
              {socials.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSocial(index)}
                  className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl border border-transparent hover:border-red-100 cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Overlay Close Dropdown */}
      {openDropdownIndex !== null && (
        <div className="fixed inset-0 z-20" onClick={() => setOpenDropdownIndex(null)} />
      )}
    </div>
  );
}