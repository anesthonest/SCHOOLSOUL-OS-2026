import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Globe, ShieldCheck } from 'lucide-react';
import { GLOBAL_COUNTRIES_LIST, GlobalCountryInfo, GlobalCountriesService } from '../../framework/globalCountries';
import { SupportedCountryCode } from '../../framework/types';

interface SearchableCountrySelectorProps {
  id?: string;
  selectedCountryCode: string;
  onSelectCountry: (country: GlobalCountryInfo) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
  helperText?: string;
}

export const SearchableCountrySelector: React.FC<SearchableCountrySelectorProps> = ({
  id = 'country-selector',
  selectedCountryCode,
  onSelectCountry,
  disabled = false,
  required = true,
  className = '',
  label = 'Country *',
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = useMemo(() => {
    return (
      GlobalCountriesService.getCountryByCode(selectedCountryCode) ||
      GLOBAL_COUNTRIES_LIST[0]
    );
  }, [selectedCountryCode]);

  const filteredCountries = useMemo(() => {
    return GlobalCountriesService.searchCountries(searchQuery);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (country: GlobalCountryInfo) => {
    onSelectCountry(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            {label}
          </span>
          {selectedCountry.hasDedicatedFrameworkPack && (
            <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded-sm">
              Verified Framework Pack
            </span>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border rounded-xl text-left transition-all ${
          disabled
            ? 'opacity-60 cursor-not-allowed border-slate-700 bg-slate-950'
            : isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 text-white shadow-lg'
            : 'border-slate-700 hover:border-slate-600 text-slate-100'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className="text-xl leading-none">{selectedCountry.flagEmoji}</span>
          <div className="truncate">
            <span className="text-sm font-medium text-slate-100">{selectedCountry.name}</span>
            <span className="text-xs text-slate-400 ml-2">({selectedCountry.code})</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-sm border border-slate-700">
            {selectedCountry.defaultCurrency}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
        </div>
      </button>

      {helperText && <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Box */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-10">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country, currency, code (e.g. Uganda, UG, KES)..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Country List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching country found for "{searchQuery}".
              </div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.code === selectedCountry.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-200 font-medium'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="text-xl leading-none shrink-0">{country.flagEmoji}</span>
                      <div className="truncate">
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          <span>{country.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({country.code})</span>
                          {country.hasDedicatedFrameworkPack && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1 py-0.2 rounded-sm">
                              Pack
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {country.educationAuthority || country.region} • {country.defaultCurrency} ({country.currencySymbol})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {country.phonePrefix}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-1.5 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{filteredCountries.length} countries available</span>
            <span className="text-blue-400">Strict Tenant & Country Isolation</span>
          </div>
        </div>
      )}
    </div>
  );
};
