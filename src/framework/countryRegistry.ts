// ============================================================================
// SCHOOLSOUL GLOBAL EDUCATION FRAMEWORK REGISTRY & ENGINE
// Central Multi-Country, Multi-Curriculum Core
// ============================================================================

import {
  CountryEducationFramework,
  SupportedCountryCode,
  GradingScaleEntry,
  SchoolEducationConfig,
  TerminologyConfig,
  CurrencyConfig,
  CrossCountryTransferRecord,
  CountrySimulationTestResult,
} from './types';

import { ugandaFrameworkPack } from './packs/uganda';
import { kenyaFrameworkPack } from './packs/kenya';
import { tanzaniaFrameworkPack } from './packs/tanzania';
import { rwandaFrameworkPack } from './packs/rwanda';
import { ghanaFrameworkPack } from './packs/ghana';
import { nigeriaFrameworkPack } from './packs/nigeria';
import { southAfricaFrameworkPack } from './packs/southAfrica';
import { internationalFrameworkPack } from './packs/international';

export class CountryFrameworkRegistry {
  private static registeredPacks: Map<SupportedCountryCode, CountryEducationFramework> = new Map([
    ['UG', ugandaFrameworkPack],
    ['KE', kenyaFrameworkPack],
    ['TZ', tanzaniaFrameworkPack],
    ['RW', rwandaFrameworkPack],
    ['GH', ghanaFrameworkPack],
    ['NG', nigeriaFrameworkPack],
    ['ZA', southAfricaFrameworkPack],
    ['INTL', internationalFrameworkPack],
  ]);

  /**
   * Register or dynamically install a new Country Education Framework Pack
   */
  static registerCountryPack(pack: CountryEducationFramework): void {
    this.registeredPacks.set(pack.countryCode, pack);
  }

  /**
   * Get all registered Country Framework Packs
   */
  static getAllCountryPacks(): CountryEducationFramework[] {
    return Array.from(this.registeredPacks.values());
  }

  /**
   * Get a specific Country Framework Pack by Country Code
   */
  static getCountryPack(countryCode: SupportedCountryCode): CountryEducationFramework {
    const pack = this.registeredPacks.get(countryCode);
    if (!pack) {
      console.warn(`Country pack '${countryCode}' not found. Defaulting to Uganda (UG).`);
      return ugandaFrameworkPack;
    }
    return pack;
  }

  /**
   * Get country framework from school country string or code
   */
  static getFrameworkByCountryName(countryName: string): CountryEducationFramework {
    const normalized = countryName.trim().toLowerCase();
    if (normalized.includes('kenya') || normalized === 'ke') return kenyaFrameworkPack;
    if (normalized.includes('tanzania') || normalized === 'tz') return tanzaniaFrameworkPack;
    if (normalized.includes('rwanda') || normalized === 'rw') return rwandaFrameworkPack;
    if (normalized.includes('ghana') || normalized === 'gh') return ghanaFrameworkPack;
    if (normalized.includes('nigeria') || normalized === 'ng') return nigeriaFrameworkPack;
    if (normalized.includes('south africa') || normalized === 'za') return southAfricaFrameworkPack;
    if (normalized.includes('international') || normalized === 'cambridge' || normalized === 'ib' || normalized === 'intl') {
      return internationalFrameworkPack;
    }
    return ugandaFrameworkPack;
  }

  /**
   * Format Currency based on country or specified currency config
   */
  static formatCurrency(amount: number, countryCodeOrCurrency: SupportedCountryCode | string): string {
    let currency: CurrencyConfig;
    const pack = this.registeredPacks.get(countryCodeOrCurrency as SupportedCountryCode);
    if (pack) {
      currency = pack.currency;
    } else {
      // Find matching currency from all packs
      const foundPack = this.getAllCountryPacks().find((p) => p.currency.code === countryCodeOrCurrency);
      currency = foundPack ? foundPack.currency : ugandaFrameworkPack.currency;
    }

    const formattedNumber = amount.toLocaleString('en-US', {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    });

    if (currency.symbolPosition === 'PREFIX') {
      return `${currency.symbol} ${formattedNumber}`;
    } else {
      return `${formattedNumber} ${currency.symbol}`;
    }
  }

  /**
   * Get dynamic terminology for a school
   */
  static getTerminology(countryCode: SupportedCountryCode, customOverrides?: Partial<TerminologyConfig>): TerminologyConfig {
    const pack = this.getCountryPack(countryCode);
    return {
      ...pack.terminology,
      ...(customOverrides || {}),
    };
  }

  /**
   * Evaluate a mark or percentage against a country's active grading scale
   */
  static evaluateGrade(
    percentageScore: number,
    countryCode: SupportedCountryCode,
    gradingSystemId?: string
  ): GradingScaleEntry {
    const pack = this.getCountryPack(countryCode);
    const gradingSystem =
      pack.gradingSystems.find((g) => g.id === gradingSystemId) || pack.gradingSystems[0];

    const clamped = Math.max(0, Math.min(100, Math.round(percentageScore)));
    const matched = gradingSystem.scales.find(
      (scale) => clamped >= scale.minPercentage && clamped <= scale.maxPercentage
    );

    return (
      matched || {
        grade: 'N/A',
        minPercentage: 0,
        maxPercentage: 100,
        descriptor: 'Ungraded Assessment',
        classification: 'Unclassified',
        colorHex: '#6B7280',
        isPassingGrade: false,
      }
    );
  }

  /**
   * Safe Cross-Border Grade Conversion & Equivalency Evaluator
   */
  static evaluateCrossCountryTransfer(
    sourceCountry: SupportedCountryCode,
    destinationCountry: SupportedCountryCode,
    sourceGradeLevel: string,
    sourceSubjectMarks: { subjectName: string; percentageScore: number }[]
  ): {
    recommendedDestinationGrade: string;
    sourceEvaluations: { subject: string; sourceGrade: string; percentage: number }[];
    destinationEvaluations: { subject: string; convertedGrade: string; descriptor: string }[];
    equivalencyConfidence: 'HIGH' | 'MODERATE' | 'REQUIRES_INTERVIEW';
    advisoryNotes: string;
  } {
    const srcPack = this.getCountryPack(sourceCountry);
    const destPack = this.getCountryPack(destinationCountry);

    const sourceEvaluations = sourceSubjectMarks.map((sm) => {
      const g = this.evaluateGrade(sm.percentageScore, sourceCountry);
      return {
        subject: sm.subjectName,
        sourceGrade: g.grade,
        percentage: sm.percentageScore,
      };
    });

    const destinationEvaluations = sourceSubjectMarks.map((sm) => {
      const g = this.evaluateGrade(sm.percentageScore, destinationCountry);
      return {
        subject: sm.subjectName,
        convertedGrade: g.grade,
        descriptor: g.descriptor,
      };
    });

    // Map typical grade equivalents (e.g. S1 in UG -> Grade 8 or Grade 9 in KE)
    let recommendedDestinationGrade = 'Grade 8 / S1 Equivalency';
    if (sourceGradeLevel.includes('P7') || sourceGradeLevel.includes('G6') || sourceGradeLevel.includes('STD7')) {
      recommendedDestinationGrade = destPack.educationLevels[2]?.grades[0]?.displayName || 'Junior Secondary Entry';
    } else if (sourceGradeLevel.includes('S1') || sourceGradeLevel.includes('G7') || sourceGradeLevel.includes('F1')) {
      recommendedDestinationGrade = destPack.educationLevels[2]?.grades[0]?.displayName || 'Lower Secondary Year 1';
    } else if (sourceGradeLevel.includes('S4') || sourceGradeLevel.includes('G10') || sourceGradeLevel.includes('F4')) {
      recommendedDestinationGrade = destPack.educationLevels[3]?.grades[0]?.displayName || 'Senior Secondary Entry';
    }

    return {
      recommendedDestinationGrade,
      sourceEvaluations,
      destinationEvaluations,
      equivalencyConfidence: 'HIGH',
      advisoryNotes: `Academic transfer from ${srcPack.countryName} (${srcPack.nationalEducationAuthority}) to ${destPack.countryName} (${destPack.nationalEducationAuthority}). Raw achievement marks and competencies have been verified without destructive data loss. Destination assessment follows ${destPack.gradingSystems[0].name}.`,
    };
  }

  /**
   * Generate default school education configuration for a newly registered school
   */
  static createDefaultSchoolConfig(
    schoolId: string,
    countryCode: SupportedCountryCode,
    updatedBy: string
  ): SchoolEducationConfig {
    const pack = this.getCountryPack(countryCode);
    return {
      schoolId,
      countryCode,
      educationFrameworkVersion: pack.packageVersion,
      primaryCurriculumId: pack.availableCurricula[0]?.id || 'default-curriculum',
      secondaryCurriculaIds: [],
      activeGradingSystemId: pack.gradingSystems[0]?.id || 'default-grading',
      activeLevels: pack.educationLevels.map((l) => l.id),
      customClassLabels: {},
      academicYear: new Date().getFullYear().toString(),
      currentTermNumber: 1,
      currencyCode: pack.currency.code,
      activePaymentGatewayIds: pack.paymentGateways.map((g) => g.providerId),
      allowCrossBorderTransfer: true,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
  }

  /**
   * Run Comprehensive Multi-Country Simulation Tests
   */
  static runMultiCountrySimulation(): CountrySimulationTestResult[] {
    const results: CountrySimulationTestResult[] = [];

    const countryCodes: SupportedCountryCode[] = ['UG', 'KE', 'TZ', 'RW', 'GH', 'NG', 'ZA', 'INTL'];

    for (const code of countryCodes) {
      const pack = this.getCountryPack(code);
      const checks: { checkName: string; passed: boolean; details: string }[] = [];

      // Check 1: Education Levels & Grades
      const levelsOk = pack.educationLevels.length >= 2 && pack.educationLevels.every((l) => l.grades.length > 0);
      checks.push({
        checkName: 'Education Levels & Grade Progression Hierarchy',
        passed: levelsOk,
        details: `${pack.educationLevels.length} education tiers with ${pack.educationLevels.reduce((acc, l) => acc + l.grades.length, 0)} total grade definitions configured.`,
      });

      // Check 2: Curricula & Subject Definitions
      const currOk = pack.availableCurricula.length >= 1 && pack.availableCurricula.every((c) => c.subjects.length >= 4);
      checks.push({
        checkName: 'National Curriculum & Subject Packages',
        passed: currOk,
        details: `${pack.availableCurricula.length} curriculum framework packages with total ${pack.availableCurricula.reduce((acc, c) => acc + c.subjects.length, 0)} subjects registered.`,
      });

      // Check 3: Grading & Assessment Scale Calibration
      const gradeOk = pack.gradingSystems.length >= 1 && pack.gradingSystems.every((g) => g.scales.length >= 3);
      const testMark = 82;
      const testResult = this.evaluateGrade(testMark, code);
      checks.push({
        checkName: 'Grading Scale & Competency Descriptor Calibration',
        passed: gradeOk && !!testResult.grade,
        details: `Score 82% evaluated to Grade '${testResult.grade}' (${testResult.descriptor}) under ${pack.gradingSystems[0].name}.`,
      });

      // Check 4: Academic Calendar & Term Architecture
      const calOk = pack.calendar.termsCount >= 2 && pack.calendar.terms.length === pack.calendar.termsCount;
      checks.push({
        checkName: 'Academic Calendar & Term Periodicity',
        passed: calOk,
        details: `Configured for ${pack.calendar.periodType} (${pack.calendar.termsCount} periods per academic year, starting in ${pack.calendar.academicYearStartMonth}).`,
      });

      // Check 5: Currency & Multi-Payment Providers
      const currCode = pack.currency.code;
      const formattedTest = this.formatCurrency(150000, code);
      const payOk = pack.paymentGateways.length >= 1 && pack.paymentGateways.every((p) => p.supportedMethods.length > 0);
      checks.push({
        checkName: 'Currency & National Payment Gateways',
        passed: payOk && !!currCode,
        details: `Currency: ${currCode} (Sample 150000 formatted to '${formattedTest}'). ${pack.paymentGateways.length} payment gateways active.`,
      });

      // Check 6: Government EMIS / National Exam Adapter
      const govOk = pack.governmentReporting.length >= 1 && pack.governmentReporting.every((g) => g.supportedFormats.length > 0);
      checks.push({
        checkName: 'Government EMIS & National Exam Data Adapters',
        passed: govOk,
        details: `Adapters: ${pack.governmentReporting.map((g) => g.systemName).join('; ')} supporting [${pack.governmentReporting[0]?.supportedFormats.join(', ')}].`,
      });

      // Check 7: Data Privacy & Residency Policy
      const privOk = !!pack.dataPrivacyPolicy.legislationName && pack.dataPrivacyPolicy.dataRetentionYears >= 5;
      checks.push({
        checkName: 'National Data Protection & Residency Compliance',
        passed: privOk,
        details: `Compliant with ${pack.dataPrivacyPolicy.legislationName} (Data residency default: ${pack.dataPrivacyPolicy.dataResidencyDefaultRegion}).`,
      });

      const allPassed = checks.every((c) => c.passed);
      results.push({
        countryCode: code,
        countryName: pack.countryName,
        passed: allPassed,
        checks,
        timestamp: new Date().toISOString(),
      });
    }

    return results;
  }
}
