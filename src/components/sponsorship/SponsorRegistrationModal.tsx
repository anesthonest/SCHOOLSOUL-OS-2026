import React, { useState } from 'react';
import { X, Building2, Globe, Mail, Phone, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import type { SponsorType, SponsorSupportType } from '../../types';
import { SponsorshipService } from '../../services/sponsorshipService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SponsorRegistrationModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [organizationType, setOrganizationType] = useState<SponsorType>('FOUNDATION');
  const [country, setCountry] = useState('Uganda');
  const [website, setWebsite] = useState('');
  const [officialContactEmail, setOfficialContactEmail] = useState('');
  const [officialContactPhone, setOfficialContactPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<SponsorSupportType[]>([
    'SCHOLARSHIP',
    'EQUIPMENT',
    'PROJECT_FUNDING',
  ]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const supportCategoriesList: { key: SponsorSupportType; label: string }[] = [
    { key: 'SCHOLARSHIP', label: 'Student Tuition Scholarships' },
    { key: 'FEES_SUPPORT', label: 'Hardship Fees Support' },
    { key: 'EQUIPMENT', label: 'Laptops & Lab Equipment' },
    { key: 'PROJECT_FUNDING', label: 'Student Innovation Grants' },
    { key: 'COMPETITION_FUNDING', label: 'Olympiad & STEM Competitions' },
    { key: 'CLUB_SUPPORT', label: 'School Clubs & Extracurriculars' },
    { key: 'SCHOOL_PROGRAM', label: 'School-Wide Facilities' },
    { key: 'MENTORSHIP', label: 'Supervised Professional Mentorship' },
    { key: 'TRAINING', label: 'Skills Bootcamps & Workshops' },
    { key: 'INTERNSHIP', label: 'Senior Secondary Internships' },
  ];

  const toggleCategory = (cat: SponsorSupportType) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !officialContactEmail.trim() || !purpose.trim()) {
      setError('Please provide all required organization details');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept SchoolSoul Child Safeguarding & Privacy terms');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await SponsorshipService.registerSponsor({
        name: name.trim(),
        organizationType,
        country: country.trim(),
        website: website.trim() || undefined,
        officialContactEmail: officialContactEmail.trim(),
        officialContactPhone: officialContactPhone.trim() || undefined,
        purpose: purpose.trim(),
        supportCategories: selectedCategories,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit sponsor registration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Register Sponsor Organization</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Join the verified SchoolSoul Opportunity Bridge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Organization Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. AfriTech Educational Foundation"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Organization Type *
              </label>
              <select
                value={organizationType}
                onChange={e => setOrganizationType(e.target.value as SponsorType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="FOUNDATION">Charitable Foundation</option>
                <option value="NGO">Non-Governmental Org (NGO)</option>
                <option value="CORPORATE_CSR">Corporate CSR Program</option>
                <option value="COMPANY">Company / Tech Enterprise</option>
                <option value="UNIVERSITY">University / Higher Institution</option>
                <option value="SCHOLARSHIP_PROVIDER">Scholarship Trust</option>
                <option value="INDIVIDUAL_SPONSOR">Individual Philanthropist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Country *</label>
              <input
                type="text"
                required
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="e.g. Uganda"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Website / Portal</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://foundation.org"
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Contact Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={officialContactEmail}
                  onChange={e => setOfficialContactEmail(e.target.value)}
                  placeholder="partnerships@foundation.org"
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={officialContactPhone}
                  onChange={e => setOfficialContactPhone(e.target.value)}
                  placeholder="+256 700 000 000"
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mission & Purpose of Educational Support *
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="Describe your organization's mission and how you aim to support secondary students, STEM labs, or community projects..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Support Categories (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {supportCategoriesList.map(item => {
                const isSelected = selectedCategories.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleCategory(item.key)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safeguarding Commitment */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
              <p className="font-semibold">SchoolSoul Safeguarding & Child Protection Agreement</p>
              <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                Sponsors receive strictly anonymized discovery candidate profiles. All direct communication, financial support, and
                hardware disbursements are supervised by school authorities and authenticated parental consent.
              </p>
              <label className="flex items-center gap-2 pt-1 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>I agree to SchoolSoul Child Safeguarding terms and school verification procedures.</span>
              </label>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !termsAccepted}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2"
            >
              {submitting ? 'Submitting Application...' : 'Submit Sponsor Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
