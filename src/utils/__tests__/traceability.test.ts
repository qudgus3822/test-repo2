/**
 * Unit tests for resolveTraceAggregation.
 *
 * Fixtures use production shape: parentCode is omitted (never populated
 * at runtime — see plan §0.1 / §0.4). Only `level` and `code` matter.
 *
 * Run with: npx vitest run src/utils/__tests__/traceability.test.ts
 */
import { describe, it, expect } from 'vitest';
import { resolveTraceAggregation } from '../traceability.js';
import type { OrganizationDepartment } from '@/types/organization.types.js';

// Typed factory — helper only reads `level` and `code`, so we narrow to
// that shape without constructing a full ScoreMetrics-extended dept.
function makeDept(
  level: number,
  code: string,
): Pick<OrganizationDepartment, "level" | "code"> {
  return { level, code };
}

describe('resolveTraceAggregation', () => {
  it('level 1 (회사/전사) → COMPANY with no departmentCode', () => {
    const dept = makeDept(1, '1000');
    const result = resolveTraceAggregation(dept);
    expect(result).toEqual({
      aggregationLevel: 'COMPANY',
      departmentCode: undefined,
    });
  });

  it('level 2 (실) → DIVISION with departmentCode', () => {
    const dept = makeDept(2, '2000');
    const result = resolveTraceAggregation(dept);
    expect(result).toEqual({
      aggregationLevel: 'DIVISION',
      departmentCode: '2000',
    });
  });

  it('level 3 (팀) → TEAM with departmentCode', () => {
    const dept = makeDept(3, '3000');
    const result = resolveTraceAggregation(dept);
    expect(result).toEqual({
      aggregationLevel: 'TEAM',
      departmentCode: '3000',
    });
  });

  it('level 4 (파트) → TEAM with departmentCode (fall-through for deeper levels)', () => {
    const dept = makeDept(4, '4000');
    const result = resolveTraceAggregation(dept);
    expect(result).toEqual({
      aggregationLevel: 'TEAM',
      departmentCode: '4000',
    });
  });
});
