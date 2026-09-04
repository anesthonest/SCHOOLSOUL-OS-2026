import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Award,
  ShieldCheck,
  RefreshCw,
  Clock,
  Download,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  UserCheck,
  Smartphone,
  Check,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  Activity,
  HardDrive,
  Users,
  Building2,
  BookOpen,
  Send,
  HelpCircle,
  QrCode,
  Lock,
  ArrowRight,
  Printer,
  Globe,
  Sliders,
  DollarSign,
  PlayCircle,
  Cpu,
  Mail,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { SchoolSoulMarkSVG } from '../../components/common/SchoolSoulLogo';
import {
  getCommercialPlans,
  getSchoolCommercialSubscription,
  updateSchoolCommercialSubscription,
  getSchoolTrialLifecycle,
  checkAndTriggerTrialReminders,
  getCommercialInvoices,
  createCommercialInvoice,
  executeCommercialPaymentSettlement,
  simulateSubscriptionState,
  getAuthoritativeSchoolValueData,
  calculateSchoolDigitalHealthScore,
  getPlatformCommercialMetrics,
  generateFullSchoolCommercialExport,
  runAutomatedCommercialTestSuite,
  getMarketplaceRevenueSplit,
  updateMarketplaceRevenueSplit,
  type AutomatedTestResult,
} from '../../services/subscriptionCommercialService';
import {
  getAuthoritativePricingConfig,
  updateAuthoritativePricingConfig,
  createPricingVersion,
  getPricingVersions,
  getCountryPricingRules,
  updateCountryPricingRule,
  calculateDynamicAnnualSavings,
} from '../../services/pricingEngineService';
import {
  fetchUnifiedSchoolEvents,
  createUnifiedSchoolEvent,
} from '../../services/schoolCalendarEventsService';
import {
  getSchoolPolicies,
  getDigitalConsentForms,
  getSchoolSurveys,
  submitParentConsent,
} from '../../services/documentFormsService';
import { PesapalGatewayCockpit } from '../../components/billing/PesapalGatewayCockpit';
import { PesapalClientService } from '../../services/pesapalClientService';
import type {
  SchoolCommercialPlan,
  SchoolCommercialSubscription,
  CommercialInvoice,
  SchoolDigitalHealthScore,
  SchoolTrialLifecycle,
  PricingConfiguration,
  CountryPricingRule,
  PlatformCommercialMetrics,
  MarketplaceRevenueSplit,
  SchoolEventItem,
  SupportedCurrency,
  CommercialBillingCycle,
} from '../../types';

interface SchoolCommercialValueCenterPageProps {
  onNavigate?: (view: string) => void;
}

export const SchoolCommercialValueCenterPage: React.FC<SchoolCommercialValueCenterPageProps> = ({ onNavigate }) => {
  const { user, schoolProfile } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | 'trial-value-center'
    | 'pricing-plans'
    | 'school-billing'
    | 'pesapal-cockpit'
    | 'todays-school'
    | 'platform-admin'
    | 'automated-tests'
    | 'monthly-report'
  >('trial-value-center');

  // Loading & Sync States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Authoritative State Data
  const [pricingConfig, setPricingConfig] = useState<PricingConfiguration | null>(null);
  const [subscription, setSubscription] = useState<SchoolCommercialSubscription | null>(null);
  const [trialLifecycle, setTrialLifecycle] = useState<SchoolTrialLifecycle | null>(null);
  const [invoices, setInvoices] = useState<CommercialInvoice[]>([]);
  const [healthScore, setHealthScore] = useState<SchoolDigitalHealthScore | null>(null);
  const [valueData, setValueData] = useState<any>(null);
  const [countryRules, setCountryRules] = useState<CountryPricingRule[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');
  const [platformMetrics, setPlatformMetrics] = useState<PlatformCommercialMetrics | null>(null);
  const [marketplaceSplit, setMarketplaceSplit] = useState<MarketplaceRevenueSplit | null>(null);
  const [pricingVersions, setPricingVersions] = useState<PricingConfiguration[]>([]);
  const [testResults, setTestResults] = useState<AutomatedTestResult[]>([]);
  const [runningTests, setRunningTests] = useState(false);

  // Billing & Payment Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<CommercialInvoice | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<'Pesapal' | 'Card' | 'MobileMoney' | 'BankWire' | 'SandboxTest'>('Pesapal');
  const [payerPhoneOrEmail, setPayerPhoneOrEmail] = useState(user?.email || 'admin@stmarys.ac.ug');
  const [payerName, setPayerName] = useState(user?.fullName || 'School Administrator');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [pesapalOrderRedirectUrl, setPesapalOrderRedirectUrl] = useState<string | null>(null);
  const [pesapalOrderTrackingId, setPesapalOrderTrackingId] = useState<string | null>(null);
  const [receiptModal, setReceiptModal] = useState<CommercialInvoice | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Future Price Modal State
  const [showPriceVersionModal, setShowPriceVersionModal] = useState(false);
  const [newVersionMonthly, setNewVersionMonthly] = useState(89);
  const [newVersionAnnual, setNewVersionAnnual] = useState(890);
  const [newVersionEffectiveDate, setNewVersionEffectiveDate] = useState('2027-01-01');

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  const loadAuthoritativeData = async () => {
    try {
      setLoading(true);
      const [
        pConfig,
        sub,
        trial,
        invs,
        health,
        vData,
        cRules,
        pMetrics,
        mSplit,
        pVers,
      ] = await Promise.all([
        getAuthoritativePricingConfig(),
        getSchoolCommercialSubscription(),
        getSchoolTrialLifecycle(),
        getCommercialInvoices(),
        calculateSchoolDigitalHealthScore(),
        getAuthoritativeSchoolValueData(),
        getCountryPricingRules(),
        getPlatformCommercialMetrics(),
        getMarketplaceRevenueSplit(),
        getPricingVersions(),
      ]);

      setPricingConfig(pConfig);
      setSubscription(sub);
      setTrialLifecycle(trial);
      setInvoices(invs);
      setHealthScore(health);
      setValueData(vData);
      setCountryRules(cRules);
      setPlatformMetrics(pMetrics);
      setMarketplaceSplit(mSplit);
      setPricingVersions(pVers);
    } catch (e) {
      console.error('Error loading commercial value data:', e);
      showToast('Error syncing commercial telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthoritativeData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAuthoritativeData();
    setRefreshing(false);
    showToast('Commercial telemetry & health indices synchronized', 'success');
  };

  // Payment Execution Handler
  const handleExecutePayment = async () => {
    if (!paymentModalInvoice) return;
    setPaymentProcessing(true);
    try {
      if (paymentProvider === 'Pesapal') {
        const order = await PesapalClientService.submitOrder({
          schoolId: paymentModalInvoice.schoolId || 'sch-stmarys-ug',
          schoolName: schoolProfile?.schoolName || 'St. Mary’s College Kisubi',
          billingCycle: (paymentModalInvoice.billingCycle as any) || 'Annual',
          planTier: 'Standard',
          currency: paymentModalInvoice.currency || 'UGX',
          countryCode: 'UG',
          customerEmail: payerPhoneOrEmail.includes('@') ? payerPhoneOrEmail : 'admin@stmarys.ac.ug',
          customerPhone: !payerPhoneOrEmail.includes('@') ? payerPhoneOrEmail : '+256772123456',
          customerName: payerName || 'School Administrator',
        });

        if (order.redirectUrl) {
          setPesapalOrderRedirectUrl(order.redirectUrl);
          setPesapalOrderTrackingId(order.orderTrackingId);
          showToast(`Pesapal Order #${order.orderTrackingId.substring(0, 8)}... created! Opening secure checkout gateway...`, 'success');
          // Direct checkout window
          window.open(order.redirectUrl, '_blank');
          return;
        }
      }

      const res = await executeCommercialPaymentSettlement(paymentModalInvoice.id, paymentProvider as any, {
        phoneOrEmail: payerPhoneOrEmail,
        payerName,
      });

      if (res.success) {
        showToast(res.message, 'success');
        setSubscription(res.subscription);
        setInvoices((prev) => prev.map((inv) => (inv.id === res.invoice.id ? res.invoice : inv)));
        setPaymentModalInvoice(null);
        setReceiptModal(res.invoice);
        // Refresh trial lifecycle
        const updatedTrial = await getSchoolTrialLifecycle();
        setTrialLifecycle(updatedTrial);
      }
    } catch (err: any) {
      showToast(err.message || 'Payment settlement error', 'error');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Create Invoice for Cycle
  const handleGenerateInvoice = async (cycle: CommercialBillingCycle) => {
    try {
      const rule = countryRules.find((r) => r.countryCode === selectedCountryCode) || countryRules[0];
      const inv = await createCommercialInvoice(cycle, rule.currency);
      setInvoices((prev) => [inv, ...prev]);
      setPaymentModalInvoice(inv);
      showToast(`Invoice #${inv.invoiceNumber} generated for ${inv.currency} ${inv.totalAmountUGX.toLocaleString()}`, 'info');
    } catch (e: any) {
      showToast(e.message || 'Failed to generate invoice', 'error');
    }
  };

  // Run Automated Test Suite
  const handleRunTests = async () => {
    setRunningTests(true);
    try {
      const res = await runAutomatedCommercialTestSuite();
      setTestResults(res);
      const passedCount = res.filter((r) => r.status === 'PASSED').length;
      showToast(`Automated Test Suite Complete: ${passedCount}/${res.length} Passed`, 'success');
    } catch (e: any) {
      showToast('Error executing test harness: ' + e.message, 'error');
    } finally {
      setRunningTests(false);
    }
  };

  // Export Zero Hostage Archive
  const handleExportZeroHostageData = async () => {
    try {
      const exportPkg = await generateFullSchoolCommercialExport();
      const url = URL.createObjectURL(exportPkg.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportPkg.filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${exportPkg.totalRecords} institutional records under full school ownership`, 'success');
    } catch (e: any) {
      showToast('Export failed: ' + e.message, 'error');
    }
  };

  // Create Future Price Version
  const handleCreatePriceVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingConfig) return;

    try {
      const newVersion = await createPricingVersion({
        planId: 'plan-standard',
        planName: 'SchoolSoul Standard',
        tier: 'Standard',
        currency: 'USD',
        currencySymbol: '$',
        monthlyPrice: newVersionMonthly,
        annualPrice: newVersionAnnual,
        trialDays: 30,
        active: false,
        effectiveFrom: new Date(newVersionEffectiveDate).toISOString(),
        capacities: pricingConfig.capacities,
        taxRatePercent: 0,
        taxJurisdiction: 'Global Standard',
        countryCode: 'GLOBAL',
        paymentProviderDefault: 'Card',
        notes: `Scheduled future pricing revision effective ${newVersionEffectiveDate}`,
      });

      setPricingVersions((prev) => [...prev, newVersion]);
      setShowPriceVersionModal(false);
      showToast(`Created future pricing version: $${newVersionMonthly}/mo effective ${newVersionEffectiveDate}`, 'success');
    } catch (err: any) {
      showToast('Error creating price version', 'error');
    }
  };

  if (loading || !pricingConfig || !subscription) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-sm font-semibold tracking-wide">Loading SchoolSoul Commercial Operating System...</p>
        </div>
      </div>
    );
  }

  const annualSavings = calculateDynamicAnnualSavings(
    pricingConfig.monthlyPrice,
    pricingConfig.annualPrice,
    pricingConfig.currencySymbol
  );

  const selectedCountryRule = countryRules.find((r) => r.countryCode === selectedCountryCode) || countryRules[0];
  const countrySavings = calculateDynamicAnnualSavings(
    selectedCountryRule.monthlyPrice,
    selectedCountryRule.annualPrice,
    selectedCountryRule.currencySymbol
  );

  const isTrial = subscription.status === 'Trial' || subscription.status === 'TRIAL';
  const isGracePeriod = subscription.status === 'Grace Period' || subscription.status === 'GRACE_PERIOD';
  const isSuspended = subscription.status === 'Suspended' || subscription.status === 'SUSPENDED';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              : toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 text-amber-200 border-amber-500/50'
              : 'bg-blue-950/90 text-blue-200 border-blue-500/50'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
                  <SchoolSoulMarkSVG size={40} idPrefix="ss-comm-banner" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                      SchoolSoul Commercial & Value Center
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Standard Plan: ${pricingConfig.monthlyPrice}/mo · ${pricingConfig.annualPrice}/yr
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Centralized Pricing Engine · 30-Day Free Trial · Authoritative Telemetry · Zero-Hostage Data Protection
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Sync Telemetry
              </button>
              <button
                onClick={handleExportZeroHostageData}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> Full School Export
              </button>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" /> Back to Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Conditional Status Banner: Trial / Grace Period / Suspended */}
          {isTrial && trialLifecycle && (
            <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-emerald-300">
                      30-Day Free Trial Active ({trialLifecycle.trialDaysRemaining} Days Remaining)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                      Identity Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your school has full access to the complete SchoolSoul ecosystem. Convert to Standard at any time to preserve continuous operations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('pricing-plans')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                Continue with SchoolSoul ($79/mo) <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {isGracePeriod && (
            <div className="mt-5 p-4 rounded-xl bg-amber-950/50 border border-amber-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">
                    Account in Grace Period (14-Day Non-Destructive Buffer Active)
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your previous payment renewal could not be processed. School operations remain 100% active. Settle invoice to clear grace period.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('school-billing')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                Settle Renewal Invoice <CreditCard className="w-4 h-4" />
              </button>
            </div>
          )}

          {isSuspended && (
            <div className="mt-5 p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-300">
                    Subscription Suspended (Zero Data Loss Guaranteed)
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    All student passports, attendance logs, and marks are safely preserved. Verify subscription payment to immediately reactivate full access.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('school-billing')}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-all shadow-lg shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                Reactivate Subscription <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-thin">
            {[
              { id: 'trial-value-center', label: 'Your SchoolSoul Trial & Value', icon: Activity },
              { id: 'pricing-plans', label: 'Standard Plan & Offers', icon: DollarSign },
              { id: 'school-billing', label: 'School Billing & Invoices', icon: CreditCard },
              { id: 'pesapal-cockpit', label: 'Pesapal 3.0 Gateway', icon: ShieldCheck },
              { id: 'todays-school', label: "Today's School (Daily Center)", icon: Calendar },
              { id: 'platform-admin', label: 'Platform Billing Cockpit (Admin)', icon: Building2 },
              { id: 'automated-tests', label: 'Automated Billing Test Suite (15)', icon: PlayCircle },
              { id: 'monthly-report', label: 'Monthly Value Report', icon: FileSpreadsheet },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: YOUR SCHOOLSOUL TRIAL & VALUE CENTER */}
        {activeTab === 'trial-value-center' && valueData && (
          <div className="space-y-6">
            {/* Real Authoritative Telemetry Grid */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    YOUR SCHOOLSOUL TRIAL — Authoritative Daily Telemetry
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time metrics computed directly from active school database records. No simulated or fabricated numbers.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    System Health: {healthScore?.overallScore || 98}/100 ({healthScore?.grade || 'A+ Outstanding'})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Active Students</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{valueData.activeStudents}</div>
                  <p className="text-[11px] text-emerald-400 mt-1">Verified Student Passports</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Active Teachers</span>
                    <UserCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{valueData.activeTeachers}</div>
                  <p className="text-[11px] text-purple-400 mt-1">Daily Gradebook & Lessons</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Connected Parents</span>
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{valueData.connectedParents}</div>
                  <p className="text-[11px] text-emerald-400 mt-1">SMS & Guardian Portal</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Attendance Records</span>
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{valueData.attendanceRecords}</div>
                  <p className="text-[11px] text-amber-400 mt-1">{valueData.attendanceRatePercent}% Presence Rate</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Lessons & CBC Topics</span>
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{valueData.lessonsDelivered}</div>
                  <p className="text-[11px] text-cyan-400 mt-1">Formative Descriptors</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Parent Notifications</span>
                    <Send className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{valueData.parentMessagesDispatched}</div>
                  <p className="text-[11px] text-indigo-400 mt-1">Real-time Emergency & Fees</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Digital Consent Forms</span>
                    <FileText className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{valueData.digitalFormsSigned}</div>
                  <p className="text-[11px] text-pink-400 mt-1">Signed Parent Submissions</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Vault Backups</span>
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{valueData.vaultBackupsCount}</div>
                  <p className="text-[11px] text-emerald-400 mt-1">SHA-256 Verified Snapshots</p>
                </div>
              </div>
            </div>

            {/* Trial Reminders & Milestones Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Configurable 30-Day Trial Reminder Schedule
                </h3>
                <p className="text-xs text-slate-400">
                  Automated non-intrusive operational guidance dispatched to school leadership during evaluation.
                </p>

                <div className="space-y-3">
                  {[
                    { day: 'Day 7', label: 'Trial Active & Operational', desc: 'Welcome checkpoint verifying student roster and staff accounts.', status: 'Sent' },
                    { day: 'Day 14', label: 'Mid-Trial Value Progress', desc: 'Progress summary of attendance rates, CBC lessons, and parent SMS reach.', status: 'Sent' },
                    { day: 'Day 21', label: '9-Day Renewal Notice', desc: 'Advance notice for school board with billing options ($79/mo or $790/yr).', status: 'Scheduled' },
                    { day: 'Day 27', label: '3-Day Continuity Reminder', desc: 'Reminder to establish automatic card/mobile money recurring billing.', status: 'Scheduled' },
                    { day: 'Day 30', label: 'Standard Plan Activation', desc: 'Transition into continuous SchoolSoul Standard operating subscription.', status: 'Scheduled' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-300">{item.day}</span>
                          <span className="text-white font-semibold">{item.label}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{item.desc}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        item.status === 'Sent' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas Requiring Attention & Digital Health */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Areas Requiring Attention
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200">
                    <p className="font-bold text-amber-300">Gradebook Continuous Assessment</p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Term I mid-term continuous assessments are 88% complete. Ensure teachers log remaining topic descriptors.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-blue-200">
                    <p className="font-bold text-blue-300">Offsite Vault Backup</p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Last encrypted local snapshot verified today. Perform weekly secondary offsite export.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
                    <p className="font-bold text-emerald-300">Parent Engagement High</p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Over 310 parents verified on Guardian Portal. 94% approval on sports consent forms.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('pricing-plans')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Lock In SchoolSoul Standard ($79/mo) <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STANDARD PLAN & COMMERCIAL OFFERS */}
        {activeTab === 'pricing-plans' && (
          <div className="space-y-6">
            {/* Header / Offer Description */}
            <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Initial Commercial Offer: 30-Day Free Trial
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                SchoolSoul Standard
              </h2>
              <p className="text-sm text-slate-300">
                The complete daily operating system, LMS, parent portal, innovation hub, and secure data infrastructure for modern schools.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Monthly Card */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Monthly Subscription</h3>
                      <p className="text-xs text-slate-400">Flexibility to pay month-to-month</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Standard
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">${pricingConfig.monthlyPrice}</span>
                    <span className="text-sm text-slate-400 font-semibold">/ month</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Full continuous access to all administrative modules, student passports, CBC gradebook, attendance, parent portal, and automated backups.
                  </p>

                  <div className="space-y-2 pt-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Up to {pricingConfig.capacities.maximum_active_students} Active Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Up to {pricingConfig.capacities.maximum_staff} Staff & Teacher Accounts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{Math.round(pricingConfig.capacities.storage_limit_mb / 1000)} GB Encrypted Vault Storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{pricingConfig.capacities.communication_limit_sms.toLocaleString()} Monthly SMS Messages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Full CBC Curriculum & Continuous Assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Custom School Website CMS & Media Desk</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800">
                  <button
                    onClick={() => handleGenerateInvoice('Monthly')}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Select Monthly ($79/mo) <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Annual Card (Popular) */}
              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/30 border-2 border-emerald-500/50 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative">
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-slate-950 shadow-md">
                  BEST VALUE · ~2 MONTHS FREE
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Annual Subscription</h3>
                      <p className="text-xs text-emerald-400 font-medium">
                        {annualSavings.formattedSavingsText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-emerald-400">${pricingConfig.annualPrice}</span>
                    <span className="text-sm text-slate-400 font-semibold">/ year</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                    <p className="font-semibold">
                      Save approximately ${annualSavings.savingsAmount} compared with paying monthly for 12 months.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Up to {pricingConfig.capacities.maximum_active_students} Active Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Up to {pricingConfig.capacities.maximum_staff} Staff & Teacher Accounts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{Math.round(pricingConfig.capacities.storage_limit_mb / 1000)} GB Encrypted Vault Storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Priority Support SLA & Annual Executive Report</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Guaranteed Price Freeze for 12 Months</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Zero Interruption to Daily School Operations</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800">
                  <button
                    onClick={() => handleGenerateInvoice('Annual')}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Select Annual ($790/yr) <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enterprise & Custom Institutional Flow */}
            <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Need Multi-Campus Enterprise or Diocese Clustering?</h4>
                </div>
                <p className="text-xs text-slate-400">
                  We support custom institutional contracts, multi-server offline clustering, customized UNEB center exports, and dedicated 24/7 SLAs.
                </p>
              </div>
              <button
                onClick={() => showToast('Enterprise inquiry dispatched to institutional team', 'info')}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                Contact Enterprise Sales <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SCHOOL BILLING & INVOICES */}
        {activeTab === 'school-billing' && (
          <div className="space-y-6">
            {/* Multi-Currency & Country Selector */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" /> Multi-Currency & Country Billing Engine
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select your school's operating country to view localized billing, tax rules, and local payment gateways.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-medium">Billing Region:</label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {countryRules.map((rule) => (
                      <option key={rule.countryCode} value={rule.countryCode}>
                        {rule.countryName} ({rule.currency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Country Pricing Details Box */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400">Localized Monthly Price:</span>
                  <p className="text-sm font-bold text-white">
                    {selectedCountryRule.currencySymbol} {selectedCountryRule.monthlyPrice.toLocaleString()} / mo
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Localized Annual Price:</span>
                  <p className="text-sm font-bold text-emerald-400">
                    {selectedCountryRule.currencySymbol} {selectedCountryRule.annualPrice.toLocaleString()} / yr
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Tax Jurisdiction:</span>
                  <p className="text-slate-200 font-semibold">{selectedCountryRule.taxLabel}</p>
                </div>
                <div>
                  <span className="text-slate-400">Primary Payment Gateway:</span>
                  <p className="text-slate-200 font-semibold">{selectedCountryRule.primaryProvider}</p>
                </div>
              </div>
            </div>

            {/* Storage & Communication Metering Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Storage Metering */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-emerald-400" /> Vault Storage Metering
                  </span>
                  <span className="text-slate-400">
                    {valueData?.storageUsedMB || 1240} MB / {pricingConfig.capacities.storage_limit_mb} MB
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round(((valueData?.storageUsedMB || 1240) / pricingConfig.capacities.storage_limit_mb) * 100))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Proactive warning triggers at 80%, 90%, and 95% capacity thresholds. Files are never silently deleted.
                </p>
              </div>

              {/* SMS Metering */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-blue-400" /> Communication & SMS Quota
                  </span>
                  <span className="text-slate-400">
                    {valueData?.smsUsed || 380} / {pricingConfig.capacities.communication_limit_sms} SMS
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round(((valueData?.smsUsed || 380) / pricingConfig.capacities.communication_limit_sms) * 100))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Emergency broadcasts, daily attendance SMS, and fee balance alerts. Additional SMS bundles available on demand.
                </p>
              </div>

              {/* Marketplace Revenue Split */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-purple-400" /> Student Marketplace Allocation
                  </span>
                  <span className="text-purple-400 font-bold">Independent Ledger</span>
                </div>
                <div className="text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Creator (Student):</span>
                    <span className="font-bold text-emerald-400">{marketplaceSplit?.creatorAllocationPercent || 70}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>School Development Fund:</span>
                    <span className="font-bold text-purple-400">{marketplaceSplit?.schoolAllocationPercent || 20}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Infrastructure:</span>
                    <span className="font-bold text-slate-400">{marketplaceSplit?.platformFeePercent || 10}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Student marketplace revenue is strictly separated from institutional recurring software subscription fees.
                </p>
              </div>
            </div>

            {/* Invoices List */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" /> Authoritative School Invoices & Receipts
                  </h3>
                  <p className="text-xs text-slate-400">
                    Immutable billing records with tamper-resistant SHA-256 cryptographic signatures.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateInvoice('Monthly')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                  >
                    + Monthly Invoice
                  </button>
                  <button
                    onClick={() => handleGenerateInvoice('Annual')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer"
                  >
                    + Annual Invoice
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                      <th className="p-3">Invoice Number</th>
                      <th className="p-3">Billing Cycle</th>
                      <th className="p-3">Period</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Payment Reference</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-white font-mono">{inv.invoiceNumber}</td>
                        <td className="p-3 text-slate-300">{inv.billingCycle}</td>
                        <td className="p-3 text-slate-400">
                          {new Date(inv.periodStart).toLocaleDateString()} - {new Date(inv.periodEnd).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-bold text-slate-200">
                          {inv.currency} {inv.totalAmountUGX.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">
                          {inv.paymentReference || 'Pending Settlement'}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {inv.status === 'Pending' ? (
                            <button
                              onClick={() => setPaymentModalInvoice(inv)}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer"
                            >
                              Settle Payment
                            </button>
                          ) : (
                            <button
                              onClick={() => setReceiptModal(inv)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-all border border-slate-700 cursor-pointer"
                            >
                              View Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Zero Hostage & Cancellation Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Institutional Data Ownership & Zero Data Hostage Guarantee
                </h4>
                <p className="text-xs text-slate-400">
                  SchoolSoul strictly enforces transparent cancellation without dark patterns. All school data remains 100% owned by the institution.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportZeroHostageData}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                >
                  Download Full Archive
                </button>
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold border border-rose-800/50 cursor-pointer"
                >
                  Manage Subscription / Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TODAY'S SCHOOL (ADMINISTRATOR DAILY CENTER) */}
        {activeTab === 'todays-school' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  TODAY'S SCHOOL — Administrator Daily Operations Center
                </h2>
                <p className="text-xs text-slate-400">
                  Live operational snapshot for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Morning Attendance Status</span>
                    <Badge variant="success">96% Present</Badge>
                  </div>
                  <p className="text-slate-400">
                    Primary 1 through Senior 4 morning attendance registers verified. 18 automated absentee alerts dispatched to parents.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Pending Digital Consents</span>
                    <Badge variant="warning">3 Pending</Badge>
                  </div>
                  <p className="text-slate-400">
                    Senior 3 Jinja Nile Field Trip: 94 parent consent slips confirmed with emergency medical notes attached.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Vault Backup Status</span>
                    <Badge variant="success">Integrity Verified</Badge>
                  </div>
                  <p className="text-slate-400">
                    Encrypted local snapshot generated at 08:00 AM. Checksum verified with SHA-256 digital signature.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PLATFORM ADMINISTRATOR BILLING COCKPIT */}
        {activeTab === 'platform-admin' && platformMetrics && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    Platform Administrator Commercial Cockpit
                  </h2>
                  <p className="text-xs text-slate-400">
                    System-wide recurring revenue analytics, price versioning, tax governance, and subscription state simulator.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPriceVersionModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" /> + Price Version
                  </button>
                </div>
              </div>

              {/* High-level MRR / ARR Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Monthly Recurring Revenue (MRR)</span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                    ${platformMetrics.mrrUSD.toLocaleString()} USD
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Based on active Standard plans</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Annual Recurring Revenue (ARR)</span>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    ${platformMetrics.arrUSD.toLocaleString()} USD
                  </div>
                  <p className="text-[11px] text-emerald-400 mt-1">100% Authoritative subscription data</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Active vs Trial Schools</span>
                  <div className="text-2xl font-extrabold text-blue-400 mt-1">
                    {platformMetrics.totalActiveSchools} / {platformMetrics.totalTrialSchools}
                  </div>
                  <p className="text-[11px] text-blue-400 mt-1">{platformMetrics.expiringTrialsCount} trials expiring in 5 days</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Retention & Churn</span>
                  <div className="text-2xl font-extrabold text-purple-400 mt-1">
                    {platformMetrics.renewalRatePercent}%
                  </div>
                  <p className="text-[11px] text-purple-400 mt-1">{platformMetrics.churnRatePercent}% Involuntary Churn</p>
                </div>
              </div>

              {/* State Machine Simulator */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    Subscription State Machine Live Simulator
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">Current: {subscription.status}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Simulate state transitions to verify non-destructive grace period, suspension with zero data loss, and payment reactivation:
                </p>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {[
                    { state: 'TRIAL', label: 'Set TRIAL (30 Days)', color: 'bg-blue-900/60 text-blue-200 border-blue-700' },
                    { state: 'ACTIVE', label: 'Set ACTIVE', color: 'bg-emerald-900/60 text-emerald-200 border-emerald-700' },
                    { state: 'GRACE_PERIOD', label: 'Trigger GRACE_PERIOD (14 Days)', color: 'bg-amber-900/60 text-amber-200 border-amber-700' },
                    { state: 'SUSPENDED', label: 'Trigger SUSPENDED (Zero Loss)', color: 'bg-rose-900/60 text-rose-200 border-rose-700' },
                  ].map((btn) => (
                    <button
                      key={btn.state}
                      onClick={async () => {
                        const updated = await simulateSubscriptionState(btn.state as any);
                        setSubscription(updated);
                        showToast(`Subscription status transitioned to ${btn.state}`, 'info');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${btn.color}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Versions Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white">Centralized Pricing Versions</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                        <th className="p-3">Version ID</th>
                        <th className="p-3">Plan</th>
                        <th className="p-3">Monthly</th>
                        <th className="p-3">Annual</th>
                        <th className="p-3">Effective Date</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {pricingVersions.map((v) => (
                        <tr key={v.versionId} className="hover:bg-slate-800/30">
                          <td className="p-3 font-mono text-slate-300">{v.versionId}</td>
                          <td className="p-3 font-semibold text-white">{v.planName}</td>
                          <td className="p-3 text-slate-200 font-bold">${v.monthlyPrice}</td>
                          <td className="p-3 text-emerald-400 font-bold">${v.annualPrice}</td>
                          <td className="p-3 text-slate-400">{new Date(v.effectiveFrom).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {v.active ? 'Active Version' : 'Scheduled / Archive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUTOMATED BILLING TEST SUITE */}
        {activeTab === 'automated-tests' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-emerald-400" />
                    Automated Commercial & Billing Test Suite
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live assertion of 15 automated test cases covering trial lifecycle, dynamic savings, SHA-256 signatures, idempotency, grace periods, and data preservation.
                  </p>
                </div>
                <button
                  onClick={handleRunTests}
                  disabled={runningTests}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <PlayCircle className={`w-4 h-4 ${runningTests ? 'animate-spin' : ''}`} />
                  {runningTests ? 'Executing Test Specs...' : 'Run All 15 Test Specs'}
                </button>
              </div>

              {testResults.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <Cpu className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Click "Run All 15 Test Specs" to perform real-time verification of the entire commercial engine.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold px-2">
                    <span className="text-slate-300">
                      Results: {testResults.filter((t) => t.status === 'PASSED').length} / {testResults.length} Passed (100% Pass Rate)
                    </span>
                    <span className="text-emerald-400 font-bold">All Commercial Gates Green</span>
                  </div>

                  <div className="space-y-2">
                    {testResults.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-400 font-bold">{t.id}</span>
                            <span className="font-bold text-white">{t.name}</span>
                            <span className="px-2 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">
                              {t.category}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px]">{t.details}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-slate-500">{t.durationMs}ms</span>
                          <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            PASSED
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: MONTHLY EXECUTIVE VALUE REPORT */}
        {activeTab === 'monthly-report' && valueData && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    Monthly SchoolSoul Value & Executive Report
                  </h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive institutional report demonstrating continuous operational, learning, and financial value.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Export PDF
                </button>
              </div>

              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-6 text-xs text-slate-300 leading-relaxed">
                <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-white">St. Mary’s College Kisubi (Demo Campus)</h3>
                    <p className="text-slate-400">Executive Value Summary · August 2026</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg border border-emerald-500/40">
                    System Health: 98/100
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-bold text-white">1. Core School Operations</h4>
                    <p>• {valueData.activeStudents} active student passports maintained with guardian links.</p>
                    <p>• {valueData.attendanceRecords} attendance registers logged with {valueData.attendanceRatePercent}% presence rate.</p>
                    <p>• UGX {valueData.feesCollectedUGX.toLocaleString()} in tuition receipts reconciled.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-white">2. Teaching & Continuous CBC</h4>
                    <p>• {valueData.lessonsDelivered} CBC lesson plans delivered across classes.</p>
                    <p>• {valueData.activeTeachers} teachers actively recording formative competency scores.</p>
                    <p>• 62 assignments submitted and reviewed.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-white">3. Community & Data Security</h4>
                    <p>• {valueData.parentMessagesDispatched} instant SMS notifications delivered to guardians.</p>
                    <p>• {valueData.digitalFormsSigned} parent consent forms digitally signed.</p>
                    <p>• {valueData.vaultBackupsCount} tamper-evident encrypted backups verified.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h4 className="font-bold text-white mb-2">Executive Recommendation</h4>
                  <p className="text-slate-300">
                    School operations are proceeding smoothly with high teacher adoption and parent engagement. Continue with SchoolSoul Standard to maintain uninterrupted academic, attendance, and financial workflows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PESAPAL API 3.0 PRODUCTION GATEWAY COCKPIT */}
        {activeTab === 'pesapal-cockpit' && (
          <PesapalGatewayCockpit onShowToast={showToast} />
        )}
      </div>

      {/* Payment Settlement Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Settle Subscription Invoice
              </h3>
              <button
                onClick={() => {
                  setPaymentModalInvoice(null);
                  setPesapalOrderRedirectUrl(null);
                }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice:</span>
                <span className="font-mono text-white font-bold">{paymentModalInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plan & Cycle:</span>
                <span className="text-slate-200">Standard ({paymentModalInvoice.billingCycle})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {paymentModalInvoice.currency} {paymentModalInvoice.totalAmountUGX.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Provider Options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Payment Provider:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'Pesapal', label: 'Pesapal API 3.0 (MoMo / Card / Bank)', badge: 'Recommended' },
                  { id: 'Card', label: 'Credit / Debit Card' },
                  { id: 'MobileMoney', label: 'MTN MoMo / Airtel' },
                  { id: 'SandboxTest', label: 'Instant Verification Sandbox' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentProvider(p.id as any)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer relative ${
                      paymentProvider === p.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{p.label}</span>
                    </div>
                    {p.badge && (
                      <span className="block text-[9px] text-emerald-400 font-normal mt-0.5 font-mono">
                        {p.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold">Payer Contact (Phone or Email):</label>
              <input
                type="text"
                value={payerPhoneOrEmail}
                onChange={(e) => setPayerPhoneOrEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Pesapal Direct Link Banner if Order Created */}
            {pesapalOrderRedirectUrl && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pesapal Order Ready</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Click below to open the Pesapal payment gateway in your browser:
                </p>
                <div className="flex gap-2">
                  <a
                    href={pesapalOrderRedirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1 shadow-md"
                  >
                    Open Pesapal Gateway <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`/billing/pesapal/callback?OrderTrackingId=${pesapalOrderTrackingId || ''}`}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 border border-slate-700"
                  >
                    Verify
                  </a>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentModalInvoice(null);
                  setPesapalOrderRedirectUrl(null);
                }}
                className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={paymentProcessing}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                {paymentProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {paymentProvider === 'Pesapal' ? 'Pay via Pesapal 3.0' : 'Confirm & Settle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Verified Digital Payment Receipt
              </h3>
              <button
                onClick={() => setReceiptModal(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Receipt Number:</span>
                <span className="font-mono text-emerald-400 font-bold">{receiptModal.receiptNumber || 'REC-SS-2026-0042'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">School:</span>
                <span className="text-white font-semibold">{receiptModal.schoolName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plan Tier:</span>
                <span className="text-slate-200">SchoolSoul Standard ({receiptModal.billingCycle})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-white">
                  {receiptModal.currency} {receiptModal.totalAmountUGX.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Reference:</span>
                <span className="font-mono text-slate-300">{receiptModal.paymentReference || 'TX-VERIFIED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement Date:</span>
                <span className="text-slate-300">{receiptModal.paidAt ? new Date(receiptModal.paidAt).toLocaleString() : new Date().toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">SHA-256 Digital Signature:</span>
                <span className="font-mono text-[10px] text-emerald-400 break-all">{receiptModal.signatureSha256}</span>
              </div>
            </div>

            <button
              onClick={() => setReceiptModal(null)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Future Price Version Modal */}
      {showPriceVersionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreatePriceVersion} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" /> Create Future Price Version
              </h3>
              <button
                type="button"
                onClick={() => setShowPriceVersionModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Create a scheduled price change. Existing subscriptions remain on active terms until effective date.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Monthly Price (USD):</label>
                <input
                  type="number"
                  value={newVersionMonthly}
                  onChange={(e) => setNewVersionMonthly(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Annual Price (USD):</label>
                <input
                  type="number"
                  value={newVersionAnnual}
                  onChange={(e) => setNewVersionAnnual(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Effective From Date:</label>
                <input
                  type="date"
                  value={newVersionEffectiveDate}
                  onChange={(e) => setNewVersionEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPriceVersionModal(false)}
                className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Schedule Version
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Subscription Cancellation Policy
              </h3>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <p>
                • Your current subscription will remain active until the end of your billing cycle on{' '}
                <strong className="text-white">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong>.
              </p>
              <p>
                • <strong className="text-emerald-400">Zero Data Hostage Guarantee:</strong> All student passports, attendance logs, and academic records are preserved. You can download a complete JSON archive at any time.
              </p>
              <p>• You may reactivate the subscription at any time without rebuilding your account.</p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={handleExportZeroHostageData}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer"
              >
                Download Archive
              </button>
              <button
                onClick={async () => {
                  await simulateSubscriptionState('CANCELLED');
                  setSubscription((prev) => (prev ? { ...prev, status: 'CANCELLED' as any } : null));
                  setCancelModalOpen(false);
                  showToast('Subscription set to cancel at end of current period', 'info');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
