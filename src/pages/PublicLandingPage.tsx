import React, { useState } from 'react';
import {
  Lock,
  UserPlus,
  QrCode,
  CreditCard,
  Smartphone,
  Building2,
  Check,
  X,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SchoolSoulMarkSVG } from '../components/common/SchoolSoulLogo';
import { PWAInstallButton } from '../components/common/PWAInstallBanner';
import { useTheme } from '../context/ThemeContext';
import { DEFAULT_COMMERCIAL_PLANS } from '../services/subscriptionCommercialService';
import { DEFAULT_COUNTRY_PRICING_RULES } from '../services/pricingEngineService';
import { UniversalPaymentSelector, PaymentItemDetails } from '../components/billing/UniversalPaymentSelector';

interface PublicLandingPageProps {
  onGoToAuth: (initialTab?: 'LOGIN' | 'REGISTER' | 'STATUS') => void;
  onGoToRegisterSchool?: () => void;
  schoolName?: string;
  schoolLogo?: string;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onGoToAuth,
  onGoToRegisterSchool,
  schoolName = 'SchoolSoul OS',
  schoolLogo,
}) => {
  const { theme, toggleTheme } = useTheme();

  // Modals for authoritative Pricing and Payment Options
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showPaymentPreviewModal, setShowPaymentPreviewModal] = useState<boolean>(false);

  // Pricing Modal State
  const [selectedCurrency, setSelectedCurrency] = useState<string>('UGX');
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Annual'>('Monthly');

  // Interactive Payment Preview Item
  const previewPaymentItem: PaymentItemDetails = {
    purpose: 'SUBSCRIPTION_RENEWAL',
    title: 'SchoolSoul Professional Tier — Termly License',
    subtitle: 'Institutional operating license including CBC gradebook, LAN sync, and portals',
    schoolId: 'demo-school-001',
    schoolName: schoolName || 'Kampala International Model Academy',
    amount: selectedCurrency === 'USD' ? 79 : selectedCurrency === 'KES' ? 10500 : 295000,
    currency: selectedCurrency,
    billingCycle: 'Monthly',
    studentCount: 650,
  };

  // Currency multiplier helper based on authoritative country rules
  const currentPricingRule = DEFAULT_COUNTRY_PRICING_RULES.find((r) => r.currency === selectedCurrency) || DEFAULT_COUNTRY_PRICING_RULES[1]; // default UGX

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* 1. Compact Header */}
      <header className="shrink-0 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt={schoolName}
                className="w-8 h-8 rounded-lg object-contain bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xs">
                <SchoolSoulMarkSVG size={22} idPrefix="ss-header-brand" />
              </div>
            )}
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                {schoolName}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">
                School Operating System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton className="hidden sm:inline-flex" />
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Centered Application Entry Viewport */}
      <main className="grow flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-md mx-auto text-center space-y-5 sm:space-y-6">
          {/* Identity */}
          <div className="space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 flex items-center justify-center mx-auto shadow-sm">
              <SchoolSoulMarkSVG size={32} idPrefix="ss-landing-mark" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight uppercase pt-1">
              SchoolSoul OS
            </h1>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
              School Operating System
            </p>
          </div>

          {/* Short Description */}
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
              "One operating system for the modern school."
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Manage your school from one secure, resilient platform.
            </p>
          </div>

          {/* Primary Action Cluster: ALL 5 ACTIONS VISIBLE ON FIRST SCREEN (>=48px touch targets) */}
          <div className="space-y-3 pt-1 w-full max-w-xs sm:max-w-sm mx-auto">
            {/* Action 1: LOGIN */}
            <Button
              variant="primary"
              size="lg"
              data-testid="first-screen-login-btn"
              onClick={() => onGoToAuth('LOGIN')}
              iconLeading={<Lock className="w-5 h-5" />}
              className="w-full justify-center px-8 py-3.5 sm:py-4 text-base font-extrabold tracking-wide uppercase bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/50 cursor-pointer min-h-[50px] rounded-xl"
            >
              LOGIN
            </Button>

            {/* Action 2: REGISTER SCHOOL */}
            <Button
              variant="secondary"
              size="lg"
              data-testid="first-screen-register-btn"
              onClick={() => (onGoToRegisterSchool ? onGoToRegisterSchool() : onGoToAuth('REGISTER'))}
              iconLeading={<UserPlus className="w-5 h-5" />}
              className="w-full justify-center px-8 py-3.5 sm:py-4 text-base font-extrabold tracking-wide uppercase border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-xs cursor-pointer min-h-[50px] rounded-xl"
            >
              REGISTER SCHOOL
            </Button>

            {/* Action 3: JOIN EXISTING SCHOOL */}
            <Button
              variant="secondary"
              size="lg"
              data-testid="first-screen-join-btn"
              onClick={() => onGoToAuth('REGISTER')}
              iconLeading={<QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
              className="w-full justify-center px-8 py-3.5 sm:py-4 text-sm sm:text-base font-extrabold tracking-wide uppercase border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200 shadow-xs cursor-pointer min-h-[50px] rounded-xl"
            >
              JOIN EXISTING SCHOOL
            </Button>

            {/* Actions 4 & 5: PRICING & PAYMENT OPTIONS (Two-column grid, >=48px touch targets) */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Button
                variant="outline"
                size="md"
                data-testid="first-screen-pricing-btn"
                onClick={() => setShowPricingModal(true)}
                iconLeading={<CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                className="w-full justify-center px-3 py-3 text-xs sm:text-sm font-bold tracking-wide uppercase border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[48px] rounded-xl shadow-2xs"
              >
                PRICING
              </Button>

              <Button
                variant="outline"
                size="md"
                data-testid="first-screen-payment-options-btn"
                onClick={() => setShowPaymentModal(true)}
                iconLeading={<Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                className="w-full justify-center px-3 py-3 text-xs sm:text-sm font-bold tracking-wide uppercase border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[48px] rounded-xl shadow-2xs"
              >
                PAYMENT OPTIONS
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Small Footer with Attribution & Essential Actions */}
      <footer className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 px-4 text-center space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-medium">
          <button
            onClick={() => onGoToAuth('LOGIN')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <button
            onClick={() => (onGoToRegisterSchool ? onGoToRegisterSchool() : onGoToAuth('REGISTER'))}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Register School
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <button
            onClick={() => onGoToAuth('REGISTER')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Join Existing School
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <button
            onClick={() => setShowPricingModal(true)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Pricing Plans
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Payment Methods
          </button>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          SchoolSoul OS — Developed by VINEXSAH TECHNOLOGIES. All rights reserved.
        </p>
      </footer>

      {/* =========================================================================
          PRICING MODAL (Authoritative Plans, Currency Selector, Capacity & Features)
          ========================================================================= */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl relative my-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pricing-modal-title"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close pricing modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center max-w-xl mx-auto mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Authoritative Institutional Plans</span>
              </div>
              <h2 id="pricing-modal-title" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                Simple, Transparent School Pricing
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Zero hidden charges. Includes offline-first local vault, role dashboards, and continuous curriculum updates.
              </p>

              {/* Currency & Billing Cycle Controls */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                {/* Currency Selector */}
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  {DEFAULT_COUNTRY_PRICING_RULES.map((rule) => (
                    <button
                      key={rule.currency}
                      onClick={() => setSelectedCurrency(rule.currency)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        selectedCurrency === rule.currency
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                          : 'hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {rule.currency}
                    </button>
                  ))}
                </div>

                {/* Billing Cycle Toggle */}
                <div className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  <button
                    onClick={() => setBillingCycle('Monthly')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      billingCycle === 'Monthly'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('Annual')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      billingCycle === 'Annual'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <span>Annual</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Save 17%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {DEFAULT_COMMERCIAL_PLANS.map((plan) => {
                // Calculate display price according to selected currency and billing cycle
                let displayPrice = 0;
                let symbol = currentPricingRule.currencySymbol;

                if (selectedCurrency === 'USD') {
                  const base = plan.tier === 'Starter' ? 32 : plan.tier === 'Enterprise' ? 320 : 79;
                  displayPrice = billingCycle === 'Annual' ? base * 10 : base;
                } else if (selectedCurrency === 'UGX') {
                  const base = plan.monthlyBaseUGX;
                  displayPrice = billingCycle === 'Annual' ? plan.annualBaseUGX : base;
                } else {
                  // Proportionally convert from UGX based on current rule
                  const ratio = currentPricingRule.monthlyPrice / 295000;
                  const converted = Math.round((plan.monthlyBaseUGX * ratio) / 100) * 100;
                  displayPrice = billingCycle === 'Annual' ? converted * 10 : converted;
                }

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between border transition-all ${
                      plan.isPopular
                        ? 'border-blue-500 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-lg ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      {plan.isPopular && (
                        <span className="inline-block px-2.5 py-0.5 mb-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white">
                          Recommended · Most Popular
                        </span>
                      )}
                      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {plan.tagline}
                      </p>

                      {/* Price Display */}
                      <div className="mt-4 mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{symbol}</span>
                          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {displayPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            /{billingCycle === 'Annual' ? 'year' : 'month'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Capacity: Up to {plan.entitlements.maxStudents.toLocaleString()} students · {plan.entitlements.maxStaff} staff
                        </p>
                      </div>

                      {/* Feature Checklist */}
                      <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-6">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>CBC Gradebook & Attendance</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>Student & Parent Universal Portals</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>Local Vault Offline Backups</span>
                        </li>
                        {plan.entitlements.offlineMultiDeviceLAN && (
                          <li className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>100% Offline-First Multi-Device LAN</span>
                          </li>
                        )}
                        {plan.entitlements.marketplaceEnabled && (
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Marketplace & Virtual Learning</span>
                          </li>
                        )}
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>All 4 Payment Rails (MTN, Airtel, Pesapal, Bank)</span>
                        </li>
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        variant={plan.isPopular ? 'primary' : 'secondary'}
                        size="md"
                        className="w-full justify-center text-xs font-extrabold uppercase min-h-[44px] cursor-pointer"
                        onClick={() => {
                          setShowPricingModal(false);
                          if (onGoToRegisterSchool) onGoToRegisterSchool();
                          else onGoToAuth('REGISTER');
                        }}
                      >
                        Register School on this Plan
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPricingModal(false);
                          setShowPaymentModal(true);
                        }}
                        className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer py-1"
                      >
                        View Payment Methods →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note & Close */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <p>
                Have custom multi-campus diocese or vocational college requirements? Contact us at enterprise@vinexsah.com.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPricingModal(false)}
                className="cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAYMENT OPTIONS MODAL (Four First-Class Rails: MTN, Airtel, Pesapal, Bank)
          ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl relative my-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close payment options modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center max-w-xl mx-auto mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Four First-Class Payment Rails</span>
              </div>
              <h2 id="payment-modal-title" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                SchoolSoul OS Payment Methods
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Integrated for African and global institutions with real-time settlement and automated accounting.
              </p>
            </div>

            {/* 4 First-Class Payment Rails Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rail 1: MTN Mobile Money */}
              <div className="p-4 rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
                      MTN
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">MTN Mobile Money</h4>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">Integrated via MTN MoMo Open API</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-amber-200/80 dark:bg-amber-900/60 px-2 py-0.5 rounded text-amber-950 dark:text-amber-100">
                    *165#
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Direct USSD push to subscriber phone. Authorize instantly with mobile PIN. Full webhook status tracking.
                </p>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1 border-t border-amber-200 dark:border-amber-800/40">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
                  <span>Sandbox Verified · Production Config Enabled via .env</span>
                </div>
              </div>

              {/* Rail 2: Airtel Money */}
              <div className="p-4 rounded-xl border border-rose-300/80 dark:border-rose-700/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs">
                      airtel
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Airtel Money</h4>
                      <p className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">Integrated via Airtel Money API</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-rose-200/80 dark:bg-rose-900/60 px-2 py-0.5 rounded text-rose-950 dark:text-rose-100">
                    *185#
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Automated collections via Airtel Uganda & East Africa gateway. Real-time disbursement and collection reconciliation.
                </p>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1 border-t border-rose-200 dark:border-rose-800/40">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
                  <span>Sandbox Verified · Production Config Enabled via .env</span>
                </div>
              </div>

              {/* Rail 3: Pesapal */}
              <div className="p-4 rounded-xl border border-blue-300/80 dark:border-blue-700/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      P
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Pesapal</h4>
                      <p className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold">Integrated via Pesapal Payment Gateway</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-200/80 dark:bg-blue-900/60 px-2 py-0.5 rounded text-blue-950 dark:text-blue-100">
                    Visa · MC · Amex
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Accept regional debit/credit cards and multiple regional mobile wallets via Pesapal 3.0 REST API with Instant Payment Notification (IPN).
                </p>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1 border-t border-blue-200 dark:border-blue-800/40">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
                  <span>Active & Verified (Pesapal v3.0 REST API)</span>
                </div>
              </div>

              {/* Rail 4: Bank Payment */}
              <div className="p-4 rounded-xl border border-emerald-300/80 dark:border-emerald-700/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Bank Payment</h4>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">Direct Deposit / EFT Transfer</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-200/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-950 dark:text-emerald-100">
                    Slip Reference
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Institutions deposit directly into the official school bank account. System generates a unique reference, and Bursar/Headteacher authoritatively approves.
                </p>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1 border-t border-emerald-200 dark:border-emerald-800/40">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Policy:</span>
                  <span>Admin Verification Required · No Fabricated Details</span>
                </div>
              </div>
            </div>

            {/* Offline & Security Guarantee */}
            <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Offline-First Security & Audit Guarantee</span>
              </div>
              <p>
                Payment initiation strictly requires an active network connection. Offline sessions safely defer online card/USSD prompts to prevent fraudulent double-spending. Bank transfer receipts are queued securely for headteacher sign-off.
              </p>
            </div>

            {/* Interactive Preview Action */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setShowPaymentModal(false);
                  setShowPaymentPreviewModal(true);
                }}
                iconLeading={<Smartphone className="w-4 h-4" />}
                className="w-full sm:w-auto cursor-pointer font-bold text-xs uppercase"
              >
                Launch Universal Payment Selector Preview
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPaymentModal(false)}
                className="cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE PAYMENT PREVIEW MODAL (UniversalPaymentSelector)
          ========================================================================= */}
      {showPaymentPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative my-8"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 uppercase">
                  Universal Payment Selector — Live Test
                </h3>
                <p className="text-xs text-slate-500">
                  Test and inspect all 4 payment methods in action.
                </p>
              </div>
              <button
                onClick={() => setShowPaymentPreviewModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <UniversalPaymentSelector
              item={previewPaymentItem}
              initialMethod="MTN_MOMO"
              onSuccess={(receipt) => {
                alert(`Receipt Generated: ${receipt.receiptNumber}\nMethod: ${receipt.paymentMethod}\nStatus: Verified`);
                setShowPaymentPreviewModal(false);
              }}
              onCancel={() => setShowPaymentPreviewModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
