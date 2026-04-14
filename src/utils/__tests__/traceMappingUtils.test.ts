/**
 * Unit tests for traceMappingUtils.
 *
 * Run with: npx vitest run src/utils/__tests__/traceMappingUtils.test.ts
 * (requires vitest: npm install -D vitest)
 */
import { describe, it, expect } from "vitest";
import {
  getNestedValue,
  extractDisplayColumns,
  extractItems,
  extractSummaryValues,
  buildTableRows,
  formatCellValue,
  isTraceMappingValid,
  buildUnifiedTable,
  flattenDailyItems,
} from "../traceMappingUtils.js";
import type {
  TraceMappingField,
  TraceMapping,
  DailyUserMetric,
} from "@/types/traceability.types.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeField(
  overrides: Partial<TraceMappingField> = {},
): TraceMappingField {
  return {
    key: "value",
    label: "값",
    type: "string",
    display: true,
    ...overrides,
  };
}

// ── getNestedValue ────────────────────────────────────────────────────────────

describe("getNestedValue", () => {
  it("flat key access", () => {
    expect(getNestedValue({ a: 1 }, "a")).toBe(1);
  });

  it("nested key", () => {
    expect(getNestedValue({ stats: { additions: 5 } }, "stats.additions")).toBe(
      5,
    );
  });

  it("missing path returns undefined", () => {
    expect(getNestedValue({}, "a.b.c")).toBeUndefined();
  });

  it("null input returns undefined", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getNestedValue(null as any, "a")).toBeUndefined();
  });

  it("prototype pollution: __proto__ returns undefined", () => {
    expect(getNestedValue({}, "__proto__")).toBeUndefined();
  });

  it("prototype pollution: constructor returns undefined", () => {
    expect(getNestedValue({ a: {} }, "a.constructor")).toBeUndefined();
  });

  it("prototype pollution: prototype returns undefined", () => {
    expect(getNestedValue({}, "prototype")).toBeUndefined();
  });
});

// ── extractItems ──────────────────────────────────────────────────────────────

describe("extractItems", () => {
  it("returns array at flat path", () => {
    const items = [{ id: 1 }, { id: 2 }];
    expect(extractItems({ mergeRequests: items }, "mergeRequests")).toEqual(
      items,
    );
  });

  it("returns array at nested path (first_time_pass_rate pattern)", () => {
    const items = [{ id: 1 }];
    const details = { mergeRequests: { firstTimePass: items } };
    expect(extractItems(details, "mergeRequests.firstTimePass")).toEqual(items);
  });

  it("non-array at path returns []", () => {
    expect(extractItems({ count: 5 }, "count")).toEqual([]);
  });

  it("null details returns []", () => {
    expect(extractItems(null, "mergeRequests")).toEqual([]);
  });

  it("missing path returns []", () => {
    expect(extractItems({}, "missing.path")).toEqual([]);
  });
});

// ── extractDisplayColumns ────────────────────────────────────────────────────

describe("extractDisplayColumns", () => {
  it("filters out display:false fields", () => {
    const ref: TraceMappingField[] = [
      makeField({ key: "id", label: "ID", display: true }),
      makeField({ key: "repoId", label: "저장소", display: false }),
    ];
    const items: TraceMappingField[] = [
      makeField({ key: "time", label: "시간", display: true }),
      makeField({ key: "formatted", label: "포맷", display: false }),
    ];
    const cols = extractDisplayColumns(ref, items);
    expect(cols).toHaveLength(2);
    expect(cols[0].key).toBe("id");
    expect(cols[1].key).toBe("time");
  });

  it("referenceFields come before itemFields", () => {
    const ref: TraceMappingField[] = [
      makeField({ key: "ref1", display: true }),
    ];
    const items: TraceMappingField[] = [
      makeField({ key: "item1", display: true }),
    ];
    const cols = extractDisplayColumns(ref, items);
    expect(cols[0].key).toBe("ref1");
    expect(cols[1].key).toBe("item1");
  });

  it("returns empty array when all fields are display:false", () => {
    const ref: TraceMappingField[] = [makeField({ key: "a", display: false })];
    const items: TraceMappingField[] = [
      makeField({ key: "b", display: false }),
    ];
    expect(extractDisplayColumns(ref, items)).toEqual([]);
  });
});

// ── formatCellValue ───────────────────────────────────────────────────────────

describe("formatCellValue", () => {
  it('null returns "-"', () => {
    expect(formatCellValue(null, makeField({ type: "string" }))).toBe("-");
  });

  it('undefined returns "-"', () => {
    expect(formatCellValue(undefined, makeField({ type: "string" }))).toBe("-");
  });

  it("number with unit appends unit", () => {
    expect(
      formatCellValue(352, makeField({ type: "number", unit: "라인" })),
    ).toBe("352라인");
  });

  it("float number rounded to 2 decimal places", () => {
    expect(formatCellValue(3.14159, makeField({ type: "number" }))).toBe(
      "3.14",
    );
  });

  it("integer number without decimals", () => {
    expect(formatCellValue(42, makeField({ type: "number" }))).toBe("42");
  });

  it('NaN number returns "-"', () => {
    expect(formatCellValue(NaN, makeField({ type: "number" }))).toBe("-");
  });

  it("date string returns Korean locale format", () => {
    const result = formatCellValue(
      "2024-01-15T10:30:00Z",
      makeField({ type: "date" }),
    );
    // Just verify it's not the raw string and not '-'
    expect(result).not.toBe("2024-01-15T10:30:00Z");
    expect(result).not.toBe("-");
    expect(result).toMatch(/2024/);
  });

  it("invalid date string returns original string", () => {
    expect(formatCellValue("not-a-date", makeField({ type: "date" }))).toBe(
      "not-a-date",
    );
  });

  it("numeric timestamp returns Korean locale format", () => {
    const result = formatCellValue(1705312200000, makeField({ type: "date" }));
    expect(result).not.toBe("-");
    expect(result).toMatch(/2024/);
  });

  it('empty string for date returns "-"', () => {
    expect(formatCellValue("", makeField({ type: "date" }))).toBe("-");
  });

  it('boolean true returns "예"', () => {
    expect(formatCellValue(true, makeField({ type: "boolean" }))).toBe("예");
  });

  it('boolean false returns "아니오"', () => {
    expect(formatCellValue(false, makeField({ type: "boolean" }))).toBe(
      "아니오",
    );
  });

  it('empty string for string type returns "-"', () => {
    expect(formatCellValue("", makeField({ type: "string" }))).toBe("-");
  });

  it("non-empty string returns the string", () => {
    expect(formatCellValue("hello", makeField({ type: "string" }))).toBe(
      "hello",
    );
  });

  it("object type returns JSON string", () => {
    expect(formatCellValue({ a: 1 }, makeField({ type: "object" }))).toBe(
      '{"a":1}',
    );
  });
});

// ── buildTableRows ────────────────────────────────────────────────────────────

describe("buildTableRows", () => {
  it("flat keys produce correct display values", () => {
    const items = [{ id: "1", title: "Test MR" }];
    const columns: TraceMappingField[] = [
      makeField({ key: "id", label: "ID", type: "string" }),
      makeField({ key: "title", label: "제목", type: "string" }),
    ];
    const rows = buildTableRows(items, columns);
    expect(rows).toHaveLength(1);
    expect(rows[0].display["id"]).toBe("1");
    expect(rows[0].display["title"]).toBe("Test MR");
  });

  it("nested keys (stats.additions) extract correctly", () => {
    const items = [{ stats: { additions: 100 } }];
    const columns: TraceMappingField[] = [
      makeField({ key: "stats.additions", label: "추가 라인", type: "number" }),
    ];
    const rows = buildTableRows(items, columns);
    expect(rows[0].display["stats.additions"]).toBe("100");
  });

  it("formattedKey takes precedence over raw value", () => {
    const items = [{ responseTime: 3600, responseTimeFormatted: "1시간" }];
    const columns: TraceMappingField[] = [
      makeField({
        key: "responseTime",
        label: "응답시간",
        type: "number",
        formattedKey: "responseTimeFormatted",
      }),
    ];
    const rows = buildTableRows(items, columns);
    expect(rows[0].display["responseTime"]).toBe("1시간");
  });

  it("formattedKey가 null이면 rawValue로 fallback한다", () => {
    const items = [{ responseTime: 3600, responseTimeFormatted: null }];
    const columns: TraceMappingField[] = [
      makeField({
        key: "responseTime",
        label: "응답시간",
        type: "number",
        formattedKey: "responseTimeFormatted",
      }),
    ];
    const rows = buildTableRows(items, columns);
    expect(rows[0].display["responseTime"]).toBe("3600");
  });

  it('formattedKey 값이 빈 문자열이면 rawValue로 fallback한다', () => {
    const items = [{ responseTime: 3600, responseTimeFormatted: "" }];
    const columns: TraceMappingField[] = [
      makeField({
        key: "responseTime",
        label: "응답시간",
        type: "number",
        formattedKey: "responseTimeFormatted",
      }),
    ];
    const rows = buildTableRows(items, columns);
    expect(rows[0].display["responseTime"]).toBe("3600");
  });

  it('null values in items display "-"', () => {
    const items = [{ id: null }];
    const columns: TraceMappingField[] = [
      makeField({ key: "id", label: "ID", type: "string" }),
    ];
    const rows = buildTableRows(items, columns);
    expect(rows[0].display["id"]).toBe("-");
  });

  it('NaN number values display "-"', () => {
    const items = [{ count: NaN }];
    const columns: TraceMappingField[] = [
      makeField({ key: "count", label: "수", type: "number" }),
    ];
    const rows = buildTableRows(items, columns);
    expect(rows[0].display["count"]).toBe("-");
  });
});

// ── extractSummaryValues ──────────────────────────────────────────────────────

describe("extractSummaryValues", () => {
  it("extracts summary fields from details", () => {
    const details = { avgResponseTime: 3600, totalCount: 5 };
    const fields: TraceMappingField[] = [
      makeField({
        key: "avgResponseTime",
        label: "평균 응답시간",
        type: "number",
        unit: "초",
      }),
      makeField({ key: "totalCount", label: "총 건수", type: "number" }),
    ];
    const entries = extractSummaryValues(details, fields);
    expect(entries).toHaveLength(2);
    expect(entries[0].label).toBe("평균 응답시간");
    expect(entries[0].value).toBe(3600);
    expect(entries[0].unit).toBe("초");
    expect(entries[1].label).toBe("총 건수");
    expect(entries[1].unit).toBeNull();
  });

  it("null details returns []", () => {
    expect(extractSummaryValues(null, [])).toEqual([]);
  });

  it("fields with display:false are excluded", () => {
    const details = { a: 1, b: 2 };
    const fields: TraceMappingField[] = [
      makeField({ key: "a", label: "A", display: true }),
      makeField({ key: "b", label: "B", display: false }),
    ];
    const entries = extractSummaryValues(details, fields);
    expect(entries).toHaveLength(1);
    expect(entries[0].label).toBe("A");
  });
});

// ── isTraceMappingValid ───────────────────────────────────────────────────────

describe("isTraceMappingValid", () => {
  const validMapping: TraceMapping = {
    itemType: "mergeRequest",
    itemsLocation: { validPath: "mergeRequests", invalidPath: "invalidMRs" },
    referenceFields: [],
    summaryFields: [],
    validItemFields: [],
    invalidItemFields: [],
  };

  it("valid mapping returns true", () => {
    expect(isTraceMappingValid(validMapping)).toBe(true);
  });

  it("null returns false", () => {
    expect(isTraceMappingValid(null)).toBe(false);
  });

  it("undefined returns false", () => {
    expect(isTraceMappingValid(undefined)).toBe(false);
  });

  it("missing itemsLocation returns false", () => {
    const m = { ...validMapping, itemsLocation: null };
    expect(isTraceMappingValid(m)).toBe(false);
  });

  it("wrong itemType returns false", () => {
    const m = { ...validMapping, itemType: "unknown" };
    expect(isTraceMappingValid(m)).toBe(false);
  });

  it("commit itemType is valid", () => {
    const m = { ...validMapping, itemType: "commit" };
    expect(isTraceMappingValid(m)).toBe(true);
  });

  it("missing referenceFields returns false", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { referenceFields: _, ...m } = validMapping;
    expect(isTraceMappingValid(m)).toBe(false);
  });
});

// ── buildUnifiedTable ────────────────────────────────────────────────────────

describe("buildUnifiedTable", () => {
  const traceMapping: TraceMapping = {
    itemType: "mergeRequest",
    itemsLocation: { validPath: "mergeRequests", invalidPath: "invalidMergeRequests" },
    referenceFields: [
      makeField({ key: "id", label: "MR ID", type: "string", display: true }),
      makeField({ key: "repositoryId", label: "저장소 ID", type: "number", display: false }),
    ],
    summaryFields: [
      makeField({ key: "totalResolvableSuggestions", label: "해결 가능한 제안 수", type: "number", display: true, unit: "개" }),
      makeField({ key: "acceptedSuggestions", label: "수용된 제안 수", type: "number", display: true, unit: "개" }),
      makeField({ key: "acceptanceRate", label: "제안 수용률", type: "number", display: true, unit: "%" }),
    ],
    validItemFields: [
      makeField({ key: "totalResolvableSuggestions", label: "해결 가능한 제안 수", type: "number", display: true, unit: "개" }),
    ],
    invalidItemFields: [],
  };

  it("aggregatedSummary 제공 시 summaryEntries가 해당 값을 반영한다", () => {
    const rawDailyData: DailyUserMetric[] = [
      {
        date: "20260407", value: 0, totalCount: 0,
        relatedMergeRequests: [],
        details: {
          mergeRequests: [], invalidMergeRequests: [],
          totalResolvableSuggestions: 0, acceptedSuggestions: 0, acceptanceRate: 0,
        },
      },
      {
        date: "20260408", value: 100, totalCount: 1,
        relatedMergeRequests: [],
        details: {
          mergeRequests: [], invalidMergeRequests: [],
          totalResolvableSuggestions: 1, acceptedSuggestions: 1, acceptanceRate: 100,
        },
      },
    ];

    // 백엔드에서 계산된 aggregatedSummary
    const aggregatedSummary = {
      totalResolvableSuggestions: 1,
      acceptedSuggestions: 1,
      acceptanceRate: 100,
    };

    const result = buildUnifiedTable(traceMapping, rawDailyData, null, "MONTHLY", aggregatedSummary);

    expect(result.summaryEntries).toHaveLength(3);
    const suggestions = result.summaryEntries.find(e => e.label === "해결 가능한 제안 수");
    expect(suggestions?.value).toBe(1);
    const accepted = result.summaryEntries.find(e => e.label === "수용된 제안 수");
    expect(accepted?.value).toBe(1);
    const rate = result.summaryEntries.find(e => e.label === "제안 수용률");
    expect(rate?.value).toBe(100);
  });

  it("DAILY 조회 시 aggregatedSummary가 올바르게 표시된다", () => {
    const rawDailyData: DailyUserMetric[] = [
      {
        date: "20260408", value: 100, totalCount: 1,
        relatedMergeRequests: [],
        details: {
          mergeRequests: [], invalidMergeRequests: [],
          totalResolvableSuggestions: 2, acceptedSuggestions: 1, acceptanceRate: 50,
        },
      },
    ];

    // DAILY에서도 백엔드가 aggregatedSummary를 계산하여 전달
    const aggregatedSummary = {
      totalResolvableSuggestions: 2,
      acceptedSuggestions: 1,
      acceptanceRate: 50,
    };

    const result = buildUnifiedTable(traceMapping, rawDailyData, null, "DAILY", aggregatedSummary);

    expect(result.summaryEntries).toHaveLength(3);
    const suggestions = result.summaryEntries.find(e => e.label === "해결 가능한 제안 수");
    expect(suggestions?.value).toBe(2);
    const rate = result.summaryEntries.find(e => e.label === "제안 수용률");
    expect(rate?.value).toBe(50);
  });

  it("aggregatedSummary가 null이면 summaryEntries가 빈 배열이다", () => {
    const rawDailyData: DailyUserMetric[] = [
      {
        date: "20260408", value: 100, totalCount: 1,
        relatedMergeRequests: [],
        details: {
          mergeRequests: [], invalidMergeRequests: [],
          totalResolvableSuggestions: 1, acceptedSuggestions: 1, acceptanceRate: 100,
        },
      },
    ];

    const result = buildUnifiedTable(traceMapping, rawDailyData, null, "DAILY", null);
    expect(result.summaryEntries).toEqual([]);
  });

  it("aggregatedSummary 미전달 시 (구 백엔드) summaryEntries가 빈 배열이다", () => {
    const rawDailyData: DailyUserMetric[] = [
      {
        date: "20260408", value: 100, totalCount: 1,
        relatedMergeRequests: [],
        details: {
          mergeRequests: [], invalidMergeRequests: [],
          totalResolvableSuggestions: 1, acceptedSuggestions: 1, acceptanceRate: 100,
        },
      },
    ];

    // aggregatedSummary 파라미터 생략
    const result = buildUnifiedTable(traceMapping, rawDailyData, null, "DAILY");
    expect(result.summaryEntries).toEqual([]);
  });

  it("validItemFields에 formattedKey가 있으면 포맷된 값을 사용한다", () => {
    const traceMappingWithFormatted: TraceMapping = {
      itemType: "mergeRequest",
      itemsLocation: { validPath: "mergeRequests", invalidPath: "invalidMergeRequests" },
      referenceFields: [
        makeField({ key: "id", label: "MR ID", type: "string", display: true }),
        makeField({ key: "repositoryId", label: "저장소 ID", type: "number", display: false }),
      ],
      summaryFields: [],
      validItemFields: [
        makeField({
          key: "responseTime",
          label: "응답 시간",
          type: "number",
          display: true,
          formattedKey: "responseTimeFormatted",
        }),
      ],
      invalidItemFields: [],
    };

    const rawDailyData: DailyUserMetric[] = [
      {
        date: "20260408", value: 100, totalCount: 1,
        relatedMergeRequests: [{ iid: 58, repositoryId: 77132601 }],
        details: {
          mergeRequests: [{
            id: "58", repositoryId: 77132601,
            responseTime: 3600, responseTimeFormatted: "1시간",
          }],
          invalidMergeRequests: [],
        },
      },
    ];

    const mergeRequests = [{
      iid: 58, repositoryId: 77132601, repositoryName: "moco_api",
      title: "feat: test", author: "moco.minjae", authorEmail: "",
      reviewers: [], sourceBranch: "feat", targetBranch: "master",
      createdAt: "2026-04-08T03:26:02Z", mergedAt: "2026-04-08T03:26:27Z",
      projectEpicKey: undefined, projectName: undefined, externalUrl: undefined,
    }];

    const result = buildUnifiedTable(
      traceMappingWithFormatted, rawDailyData, mergeRequests, "DAILY", null,
    );

    // formattedKey가 있으므로 "1시간" 사용, type: number로 재포맷 하지 않음
    const responseTimeCol = result.columns.find(c => c.label === "응답 시간");
    expect(responseTimeCol).toBeDefined();
    expect(result.rows[0].display[responseTimeCol!.key]).toBe("1시간");
  });
});

// ── flattenDailyItems deduplication ───────────────────────────────────────────

describe("flattenDailyItems deduplication", () => {
  /**
   * DailyUserMetric 목업 생성 헬퍼
   */
  function makeDay(date: string, items: Record<string, unknown>[]): DailyUserMetric {
    return {
      date,
      details: { mergeRequests: items },
    } as unknown as DailyUserMetric;
  }

  const validPath = "mergeRequests";

  it("같은 (id, repositoryId)가 다른 날짜에 있을 때 나중 날짜만 포함된다", () => {
    // Arrange: 같은 MR이 11-05와 11-06 모두에 존재하는 중복 상황
    const day1 = makeDay("20251105", [
      { id: "11", repositoryId: 72305182, responseTime: 100 },
    ]);
    const day2 = makeDay("20251106", [
      { id: "11", repositoryId: 72305182, responseTime: 200 },
    ]);

    // Act
    const result = flattenDailyItems([day1, day2], validPath);

    // Assert: 나중 날짜(11-06) 항목만 포함
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("20251106");
    expect(result[0].item["responseTime"]).toBe(200);
  });

  it("서로 다른 (id, repositoryId)는 모두 유지된다", () => {
    // Arrange
    const day1 = makeDay("20251105", [
      { id: "10", repositoryId: 72305182, responseTime: 100 },
    ]);
    const day2 = makeDay("20251106", [
      { id: "11", repositoryId: 72305182, responseTime: 200 },
    ]);

    // Act
    const result = flattenDailyItems([day1, day2], validPath);

    // Assert: 각각 다른 MR이므로 둘 다 유지
    expect(result).toHaveLength(2);
  });

  it("id 또는 repositoryId가 없는 항목은 중복 검사 없이 모두 유지된다", () => {
    // Arrange: id가 없는 항목
    const day1 = makeDay("20251105", [
      { repositoryId: 72305182, responseTime: 100 }, // id 없음
      { id: "11", responseTime: 200 }, // repositoryId 없음
    ]);
    const day2 = makeDay("20251106", [
      { repositoryId: 72305182, responseTime: 300 }, // id 없음 (중복 검사 없이 추가)
    ]);

    // Act
    const result = flattenDailyItems([day1, day2], validPath);

    // Assert: id 또는 repositoryId가 없으면 중복 검사 생략 → 모두 유지
    expect(result).toHaveLength(3);
  });

  it("중복이 없는 경우 기존 동작과 동일하다", () => {
    // Arrange
    const day1 = makeDay("20251105", [
      { id: "1", repositoryId: 1001, responseTime: 10 },
      { id: "2", repositoryId: 1001, responseTime: 20 },
    ]);
    const day2 = makeDay("20251106", [
      { id: "3", repositoryId: 1001, responseTime: 30 },
    ]);

    // Act
    const result = flattenDailyItems([day1, day2], validPath);

    // Assert
    expect(result).toHaveLength(3);
  });

  it("3일치 데이터에서 동일 MR이 첫째/셋째날에 있을 때 셋째날 항목만 유지된다", () => {
    // Arrange: MR #5가 1일차와 3일차에 중복
    const day1 = makeDay("20251104", [
      { id: "5", repositoryId: 100, responseTime: 50 },
    ]);
    const day2 = makeDay("20251105", [
      { id: "6", repositoryId: 100, responseTime: 60 }, // 다른 MR
    ]);
    const day3 = makeDay("20251106", [
      { id: "5", repositoryId: 100, responseTime: 500 }, // day1의 #5와 중복
    ]);

    // Act
    const result = flattenDailyItems([day1, day2, day3], validPath);

    // Assert: MR #5는 3일차(20251106) 항목만, MR #6은 유지 → 총 2개
    expect(result).toHaveLength(2);
    const mr5 = result.find((r) => r.item["id"] === "5");
    expect(mr5).toBeDefined();
    expect(mr5!.date).toBe("20251106");
    expect(mr5!.item["responseTime"]).toBe(500);
  });
});
