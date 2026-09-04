// ============================================================================
// SCHOOLSOUL GLOBAL EDUCATION FRAMEWORK CLIENT SERVICE
// Multi-Country, Multi-Curriculum Core
// ============================================================================

import {
  CountryEducationFramework,
  SupportedCountryCode,
  SchoolEducationConfig,
  MultiSchoolOrganization,
  CrossCountryTransferRecord,
  CountrySimulationTestResult,
} from '../framework/types';
import { CountryFrameworkRegistry } from '../framework/countryRegistry';

const API_BASE = '/api/framework';

export class GlobalFrameworkService {
  private static cache: Map<string, any> = new Map();

  private static getCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    return item;
  }

  private static setCache<T>(key: string, data: T): void {
    this.cache.set(key, data);
  }

  // 1. GET ALL COUNTRY PACKS
  static async getAllCountryPacks(): Promise<CountryEducationFramework[]> {
    try {
      const res = await fetch(`${API_BASE}/countries`);
      if (res.ok) {
        const data = await res.json();
        this.setCache('all_countries', data);
        return data;
      }
    } catch (err) {
      console.warn('Network fetch failed for country packs, returning local registry:', err);
    }
    return CountryFrameworkRegistry.getAllCountryPacks();
  }

  // 2. GET SPECIFIC COUNTRY PACK
  static async getCountryPack(countryCode: SupportedCountryCode): Promise<CountryEducationFramework> {
    try {
      const res = await fetch(`${API_BASE}/country/${countryCode}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn(`Network fetch failed for country ${countryCode}, returning local registry:`, err);
    }
    return CountryFrameworkRegistry.getCountryPack(countryCode);
  }

  // 3. GET SCHOOL EDUCATION CONFIG
  static async getSchoolEducationConfig(schoolId: string): Promise<SchoolEducationConfig> {
    try {
      const res = await fetch(`${API_BASE}/school-config/${schoolId}`);
      if (res.ok) {
        const data = await res.json();
        this.setCache(`school_config_${schoolId}`, data);
        return data;
      }
    } catch (err) {
      console.warn(`Network fetch failed for school ${schoolId} config, returning local default:`, err);
    }
    return (
      this.getCache<SchoolEducationConfig>(`school_config_${schoolId}`) ||
      CountryFrameworkRegistry.createDefaultSchoolConfig(schoolId, 'UG', 'Local Client')
    );
  }

  // 4. UPDATE SCHOOL EDUCATION CONFIG
  static async updateSchoolEducationConfig(
    schoolId: string,
    updates: Partial<SchoolEducationConfig>
  ): Promise<SchoolEducationConfig> {
    const res = await fetch(`${API_BASE}/school-config/${schoolId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update school education configuration');
    const data = await res.json();
    this.setCache(`school_config_${schoolId}`, data);
    return data;
  }

  // 5. EVALUATE CROSS-BORDER TRANSFER
  static async evaluateTransfer(
    sourceCountry: SupportedCountryCode,
    destinationCountry: SupportedCountryCode,
    sourceGradeLevel: string,
    marks: { subjectName: string; percentageScore: number }[]
  ) {
    try {
      const res = await fetch(`${API_BASE}/transfer/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCountry, destinationCountry, sourceGradeLevel, marks }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Network evaluate transfer failed, falling back to local engine:', err);
    }
    return CountryFrameworkRegistry.evaluateCrossCountryTransfer(
      sourceCountry,
      destinationCountry,
      sourceGradeLevel,
      marks
    );
  }

  // 6. SUBMIT TRANSFER RECORD
  static async submitTransferRecord(payload: Partial<CrossCountryTransferRecord>): Promise<CrossCountryTransferRecord> {
    const res = await fetch(`${API_BASE}/transfer/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit transfer record');
    return await res.json();
  }

  static async getTransferRecords(): Promise<CrossCountryTransferRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/transfers`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Network fetch transfers failed:', err);
    }
    return [];
  }

  // 7. MULTI-SCHOOL ORGANIZATIONS
  static async getOrganizations(): Promise<MultiSchoolOrganization[]> {
    try {
      const res = await fetch(`${API_BASE}/organizations`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Network fetch organizations failed:', err);
    }
    return [];
  }

  static async createOrganization(payload: Partial<MultiSchoolOrganization>): Promise<MultiSchoolOrganization> {
    const res = await fetch(`${API_BASE}/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create multi-school organization');
    return await res.json();
  }

  // 8. GOVERNMENT EMIS EXPORT
  static async fetchGovernmentExport(countryCode: string, adapterId: string, format: 'JSON' | 'CSV' | 'XML' | 'PDF'): Promise<any> {
    const res = await fetch(`${API_BASE}/government-export/${countryCode}/${adapterId}/${format}`);
    if (!res.ok) throw new Error(`Failed to generate government export for ${countryCode} / ${adapterId}`);
    return await res.json();
  }

  // 9. RUN SIMULATION SUITE
  static runSimulations(): CountrySimulationTestResult[] {
    return CountryFrameworkRegistry.runMultiCountrySimulation();
  }
}
