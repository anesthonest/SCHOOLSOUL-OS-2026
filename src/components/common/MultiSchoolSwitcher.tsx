import React, { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Check, Globe, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserSchoolMembership } from '../../types';
import { CountryFrameworkRegistry } from '../../framework/countryRegistry';
import { SupportedCountryCode } from '../../framework/types';

export const MultiSchoolSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { schoolProfile, refreshSchoolProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock multi-school memberships for demonstration / network users
  const [schools, setSchools] = useState<UserSchoolMembership[]>([
    {
      schoolId: schoolProfile?.id || 'school-ug-001',
      schoolName: schoolProfile?.schoolName || 'Victoria Horizon International School',
      countryCode: schoolProfile?.countryCode || 'UG',
      countryName: schoolProfile?.country || 'Uganda',
      flagEmoji: '🇺🇬',
      role: 'Headteacher',
      currency: schoolProfile?.currency || 'UGX',
      isDefault: true,
    },
    {
      schoolId: 'school-ke-002',
      schoolName: 'Savannah Horizon Academy',
      countryCode: 'KE',
      countryName: 'Kenya',
      flagEmoji: '🇰🇪',
      role: 'Headteacher',
      currency: 'KES',
      isDefault: false,
    },
    {
      schoolId: 'school-tz-003',
      schoolName: 'Kilimanjaro Academy of Excellence',
      countryCode: 'TZ',
      countryName: 'Tanzania',
      flagEmoji: '🇹🇿',
      role: 'Administrator',
      currency: 'TZS',
      isDefault: false,
    },
  ]);

  const [activeSchoolId, setActiveSchoolId] = useState<string>(schoolProfile?.id || 'school-ug-001');

  useEffect(() => {
    if (schoolProfile?.id) {
      setActiveSchoolId(schoolProfile.id);
    }
  }, [schoolProfile]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeMembership = schools.find((s) => s.schoolId === activeSchoolId) || schools[0];

  const handleSwitchSchool = async (membership: UserSchoolMembership) => {
    setActiveSchoolId(membership.schoolId);
    setIsOpen(false);

    // Dynamic tenant adaptation
    console.log(`[SchoolSoul Tenant Switch] Switching to ${membership.schoolName} (${membership.countryName})`);
    
    // In production, this sets the X-School-ID header and re-initializes tenant session
    localStorage.setItem('schoolsoul_active_school_id', membership.schoolId);
    localStorage.setItem('schoolsoul_country_code', membership.countryCode);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        id="multi-school-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl text-left transition-all shadow-sm group"
        title="Switch active school and education framework"
      >
        <span className="text-lg leading-none shrink-0">{activeMembership.flagEmoji}</span>
        <div className="hidden sm:block text-left truncate max-w-[170px]">
          <div className="text-xs font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
            {schoolProfile?.schoolName || activeMembership.schoolName}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
            <span>{schoolProfile?.country || activeMembership.countryName}</span>
            <span>•</span>
            <span className="font-mono text-blue-400">{schoolProfile?.currency || activeMembership.currency}</span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Select Active School
              </span>
            </div>
            <span className="text-[10px] bg-blue-950 border border-blue-800 text-blue-300 px-1.5 py-0.5 rounded-sm font-medium">
              Multi-School Tenant
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
            {schools.map((school) => {
              const isSelected = school.schoolId === activeSchoolId;
              const pack = CountryFrameworkRegistry.getCountryPack(school.countryCode as SupportedCountryCode);
              return (
                <button
                  key={school.schoolId}
                  type="button"
                  onClick={() => handleSwitchSchool(school)}
                  className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                    isSelected ? 'bg-blue-600/20 text-white' : 'hover:bg-slate-800/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3 truncate">
                    <span className="text-2xl mt-0.5 leading-none">{school.flagEmoji}</span>
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate flex items-center gap-1.5">
                        <span>{school.schoolName}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {school.countryName} • {pack.nationalEducationAuthority.split('/')[0]}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span className="bg-slate-800 px-1.5 py-0.2 rounded-sm text-slate-300 font-mono">
                          {school.currency}
                        </span>
                        <span className="text-blue-300">
                          {school.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              Tenant & Country Isolated
            </span>
            <span className="text-blue-400 font-medium">Cross-Border OS</span>
          </div>
        </div>
      )}
    </div>
  );
};
