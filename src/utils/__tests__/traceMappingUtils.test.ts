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
} from "../traceMappingUtils.js";
import type {
  TraceMappingField,
  TraceMapping,
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
