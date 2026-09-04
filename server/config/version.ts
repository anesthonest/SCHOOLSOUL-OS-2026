/**
 * SchoolSoul OS V6 — Release Candidate Version & Freeze Manifest
 * Master Single Source of Truth for Application, Schema, and Release Freeze.
 */

export interface SchoolSoulVersionManifest {
  version: string;
  schemaVersion: string;
  buildIdentifier: string;
  releaseDate: string;
  releaseChannel: 'production-candidate-freeze' | 'production-stable';
  freezeStatus: 'LOCKED' | 'UNLOCKED';
  environment: string;
  supportedCurricula: string[];
  dualStorageEngine: string;
  resilienceEngineLevel: number;
}

export const SCHOOLSOUL_V6_MANIFEST: SchoolSoulVersionManifest = {
  version: '6.0.0-RELEASE-CANDIDATE',
  schemaVersion: '2026.6.0',
  buildIdentifier: 'SS-V6-RC-20260902',
  releaseDate: '2026-09-02',
  releaseChannel: 'production-candidate-freeze',
  freezeStatus: 'LOCKED',
  environment: process.env.NODE_ENV || 'production',
  supportedCurricula: [
    'Uganda (UNEB / NCDC CBC)',
    'Kenya (CBC / KNEC)',
    'Tanzania (NECTA)',
    'Rwanda (REB / CBC)',
    'Ghana (GES / NaCCA)',
    'Nigeria (NERDC / WAEC)',
    'South Africa (CAPS / IEB)',
    'International (Cambridge / IB)',
  ],
  dualStorageEngine: 'LocalSchoolStorage + ProviderAgnosticCloudReplica',
  resilienceEngineLevel: 4,
};
