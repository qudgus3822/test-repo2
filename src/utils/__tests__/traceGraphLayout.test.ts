/**
 * Unit tests for buildGraphTree and collectAllNodeIds (COMPANY case).
 *
 * Run with: npx vitest run src/utils/__tests__/traceGraphLayout.test.ts
 */
import { describe, it, expect } from 'vitest';
import { buildGraphTree, collectAllNodeIds } from '../traceGraphLayout.js';
import type {
  CompanyTraceNode,
  DivisionTraceNode,
  TeamTraceNode,
  MemberTraceNode,
} from '@/types/traceability.types.js';
import type { DivisionLoadStatus } from '@/api/hooks/useSequentialDivisionLoader.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeMetric(rawValue = 0) {
  return {
    value: rawValue,
    rawValue,
    score: 0,
    weightedScore: 0,
    count: 1,
    countLabel: 'MEMBERS' as const,
  };
}

function makeMember(id: string): MemberTraceNode {
  return {
    level: 'MEMBER',
    memberId: id,
    memberName: `Member ${id}`,
    memberEmail: `${id}@example.com`,
    memberEmployeeId: `E${id}`,
    metric: makeMetric(),
    mergeRequests: null,
    rawDailyData: null,
    aggregatedSummary: null,
  };
}

function makeTeam(code: string): TeamTraceNode {
  return {
    level: 'TEAM',
    departmentCode: code,
    departmentName: `Team ${code}`,
    metric: makeMetric(),
    aggregationMethod: 'WEIGHTED_AVERAGE',
    children: [makeMember(`m-${code}`)],
  };
}

function makeShallowDivision(code: string): DivisionTraceNode {
  return {
    level: 'DIVISION',
    departmentCode: code,
    departmentName: `Division ${code}`,
    metric: makeMetric(),
    aggregationMethod: 'WEIGHTED_AVERAGE',
    children: null, // shallow — no teams yet
  };
}

function makeLoadedDivision(code: string): DivisionTraceNode {
  return {
    level: 'DIVISION',
    departmentCode: code,
    departmentName: `Division ${code}`,
    metric: makeMetric(),
    aggregationMethod: 'WEIGHTED_AVERAGE',
    children: [makeTeam(`t-${code}`)],
  };
}

function makeCompany(children: DivisionTraceNode[]): CompanyTraceNode {
  return {
    level: 'COMPANY',
    metric: makeMetric(100),
    aggregationMethod: 'WEIGHTED_AVERAGE',
    children,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('buildGraphTree — COMPANY root', () => {
  it('returns a single-element array with COMPANY root node', () => {
    const company = makeCompany([makeShallowDivision('3000'), makeShallowDivision('2000')]);
    const trees = buildGraphTree(company, undefined, undefined, undefined, 'MyCorp');

    expect(trees).toHaveLength(1);
    expect(trees[0].type).toBe('COMPANY');
    expect(trees[0].id).toBe('__company_root__');
    expect(trees[0].label).toBe('MyCorp');
  });

  it('uses fallback label "회사" when companyLabel is not provided', () => {
    const company = makeCompany([makeShallowDivision('3000')]);
    const trees = buildGraphTree(company);

    expect(trees[0].label).toBe('회사');
  });

  it('has DIVISION children from the company node', () => {
    const company = makeCompany([makeShallowDivision('3000'), makeShallowDivision('2000')]);
    const trees = buildGraphTree(company, undefined, undefined, undefined, 'MyCorp');

    const root = trees[0];
    expect(root.children).toHaveLength(2);
    expect(root.children![0].type).toBe('DIVISION');
    expect(root.children![1].type).toBe('DIVISION');
  });

  it('returns COMPANY node with no children when company has empty children array', () => {
    const company = makeCompany([]);
    const trees = buildGraphTree(company, undefined, undefined, undefined, 'Empty Corp');

    expect(trees).toHaveLength(1);
    expect(trees[0].type).toBe('COMPANY');
    expect(trees[0].children).toBeUndefined();
  });

  it('merges divisionStates loaded data into DIVISION children', () => {
    const div3000 = makeShallowDivision('3000');
    const company = makeCompany([div3000]);

    const loadedResult = {
      root: makeLoadedDivision('3000'),
    } as unknown as import('@/types/traceability.types.js').TraceResult;

    const divisionStates = new Map<string, DivisionLoadStatus>([
      ['3000', { departmentCode: '3000', departmentName: 'Division 3000', state: 'loaded', data: loadedResult }],
    ]);

    const trees = buildGraphTree(company, divisionStates, undefined, undefined, 'MyCorp');
    const divisionChild = trees[0].children![0];

    // Loaded division should have team children
    expect(divisionChild.children).toBeDefined();
    expect(divisionChild.children![0].type).toBe('TEAM');
  });

  it('DIVISION-level root does NOT produce a COMPANY node', () => {
    const division = makeLoadedDivision('3000');
    const trees = buildGraphTree(division);

    expect(trees).toHaveLength(1);
    expect(trees[0].type).toBe('DIVISION');
    expect(trees[0].id).not.toBe('__company_root__');
  });

  it('TEAM-level root does NOT produce a COMPANY node', () => {
    const team = makeTeam('t-500');
    const trees = buildGraphTree(team);

    expect(trees).toHaveLength(1);
    expect(trees[0].type).toBe('TEAM');
    expect(trees[0].id).not.toBe('__company_root__');
  });

  it('COMPANY siblings (DIVISION children) receive sibling weights summing to 1', () => {
    const company = makeCompany([
      makeShallowDivision('3000'),
      makeShallowDivision('2000'),
    ]);
    const trees = buildGraphTree(company, undefined, undefined, undefined, 'MyCorp');

    const divisions = trees[0].children!;
    const totalWeight = divisions.reduce((sum, d) => sum + (d.weight ?? 0), 0);

    // weights assigned by calculateSiblingWeights; should sum to ~1 (equal-weight fallback for zero metrics)
    expect(totalWeight).toBeCloseTo(1, 5);
    divisions.forEach((d) => {
      expect(d.weight).toBeGreaterThan(0);
    });
  });

  it('virtual team (team.departmentCode === division.departmentCode) uses vteam- id prefix', () => {
    const sharedCode = '3000';
    const division: DivisionTraceNode = {
      level: 'DIVISION',
      departmentCode: sharedCode,
      departmentName: 'Division 3000',
      metric: makeMetric(),
      aggregationMethod: 'WEIGHTED_AVERAGE',
      children: [makeTeam(sharedCode)], // virtual team shares code with parent division
    };

    const trees = buildGraphTree(division);
    const divisionNode = trees[0];
    const teamNode = divisionNode.children![0];

    expect(teamNode.type).toBe('TEAM');
    expect(teamNode.id).toBe(`vteam-${sharedCode}`);
    expect(divisionNode.id).toBe(sharedCode);
    expect(teamNode.id).not.toBe(divisionNode.id);
  });
});

describe('collectAllNodeIds — COMPANY root', () => {
  it('includes "__company_root__" for COMPANY tree', () => {
    const company = makeCompany([makeShallowDivision('3000'), makeShallowDivision('2000')]);
    const ids = collectAllNodeIds(company);

    expect(ids).toContain('__company_root__');
  });

  it('includes all division department codes', () => {
    const company = makeCompany([makeShallowDivision('3000'), makeShallowDivision('2000')]);
    const ids = collectAllNodeIds(company);

    expect(ids).toContain('3000');
    expect(ids).toContain('2000');
  });

  it('includes nested team and member IDs when divisionStates loaded', () => {
    const div3000 = makeShallowDivision('3000');
    const company = makeCompany([div3000]);

    const loadedResult = {
      root: makeLoadedDivision('3000'),
    } as unknown as import('@/types/traceability.types.js').TraceResult;

    const divisionStates = new Map<string, DivisionLoadStatus>([
      ['3000', { departmentCode: '3000', departmentName: 'Division 3000', state: 'loaded', data: loadedResult }],
    ]);

    const ids = collectAllNodeIds(company, divisionStates);

    expect(ids).toContain('__company_root__');
    expect(ids).toContain('3000');
    expect(ids).toContain('t-3000');
    expect(ids).toContain('m-t-3000');
  });

  it('DIVISION-level root does NOT include "__company_root__"', () => {
    const division = makeLoadedDivision('3000');
    const ids = collectAllNodeIds(division);

    expect(ids).not.toContain('__company_root__');
    expect(ids).toContain('3000');
  });
});
