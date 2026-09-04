/**
 * Universal Person Naming Utilities for SchoolSoul OS
 * Supports universal naming conventions across all international education systems:
 * - Single given name
 * - Two names (Given + Surname)
 * - Three names (Given + Middle/Third + Surname)
 * - Multiple patronymic / matronymic / tribal / clan / compound names
 * - Formats cleanly without "null", "undefined", "N/A", or broken spacing.
 */

export interface NameComponents {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
}

/**
 * Cleanly formats a person's full name from distinct components or full name string
 */
export function formatPersonName(
  firstName?: string | null,
  middleName?: string | null,
  lastName?: string | null,
  fallback: string = 'Unnamed Record'
): string {
  const parts = [firstName, middleName, lastName]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter((p) => p.length > 0 && p.toLowerCase() !== 'null' && p.toLowerCase() !== 'undefined' && p.toLowerCase() !== 'n/a');

  if (parts.length === 0) {
    return fallback;
  }

  // Join with single whitespace
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Formats a student name ensuring clean fallback
 */
export function formatStudentName(student?: Partial<NameComponents> | null): string {
  if (!student) return 'Student';
  if (student.fullName && typeof student.fullName === 'string' && student.fullName.trim()) {
    const cleaned = student.fullName.replace(/\b(null|undefined|N\/A)\b/gi, '').replace(/\s+/g, ' ').trim();
    if (cleaned) return cleaned;
  }
  return formatPersonName(student.firstName, student.middleName, student.lastName, 'Student');
}

/**
 * Splits a single full name string into universal components without enforcing a middle name
 */
export function splitUniversalName(fullNameStr: string): { firstName: string; middleName?: string; lastName: string } {
  if (!fullNameStr || typeof fullNameStr !== 'string') {
    return { firstName: '', middleName: '', lastName: '' };
  }

  const tokens = fullNameStr
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0 && t.toLowerCase() !== 'null' && t.toLowerCase() !== 'undefined');

  if (tokens.length === 0) {
    return { firstName: '', middleName: '', lastName: '' };
  }
  if (tokens.length === 1) {
    return { firstName: tokens[0], middleName: '', lastName: '' };
  }
  if (tokens.length === 2) {
    return { firstName: tokens[0], middleName: '', lastName: tokens[1] };
  }

  // 3 or more tokens: first token is firstName, last token is lastName, intermediate tokens form middle/patronymic name
  const firstName = tokens[0];
  const lastName = tokens[tokens.length - 1];
  const middleName = tokens.slice(1, tokens.length - 1).join(' ');

  return { firstName, middleName, lastName };
}

/**
 * Cleans any name string removing trailing/accidental null or undefined literals
 */
export function cleanNameDisplay(nameStr?: string | null, fallback: string = '—'): string {
  if (!nameStr || typeof nameStr !== 'string') return fallback;
  const cleaned = nameStr
    .replace(/\b(null|undefined|N\/A)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || fallback;
}
