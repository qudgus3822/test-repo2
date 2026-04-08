import type { TraceMappingField, TraceMapping, DailyUserMetric, MergeRequestSummary } from "@/types/traceability.types.js";

// ── Item type label ────────────────────────────────────────────────────────────

/**
 * Returns the Korean display label for an item type.
 * Defaults to "MR" when itemType is undefined or "mergeRequest".
 */
export function getItemTypeLabel(itemType?: 'mergeRequest' | 'commit'): string {
  return itemType === 'commit' ? '커밋' : 'MR';
}

// ── Prototype pollution guard ──────────────────────────────────────────────────

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// ── Core utility functions ────────────────────────────────────────────────────

/**
 * Traverses a dot-notation path on an object.
 * Includes a prototype pollution guard: any unsafe key segment returns undefined.
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (UNSAFE_KEYS.has(key)) return undefined;
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/**
 * Returns columns for table headers:
 * referenceFields(display:true) + itemFields(display:true).
 */
export function extractDisplayColumns(
  referenceFields: TraceMappingField[],
  itemFields: TraceMappingField[],
): TraceMappingField[] {
  return [
    ...referenceFields.filter(f => f.display),
    ...itemFields.filter(f => f.display),
  ];
}

/**
 * Extracts item array from details using a dot-notation path.
 * Returns [] when the path resolves to a non-array or details is null.
 */
export function extractItems(
  details: Record<string, unknown> | null,
  path: string,
): unknown[] {
  if (!details) return [];
  const value = getNestedValue(details, path);
  return Array.isArray(value) ? value : [];
}

/**
 * Counts total items across all days by extracting from details via path.
 * Used for commit-type metrics where itemCount should be commit count, not MR count.
 */
export function countItemsFromDetails(
  rawDailyData: DailyUserMetric[] | null,
  validPath: string,
): number {
  if (!rawDailyData) return 0;
  let count = 0;
  for (const day of rawDailyData) {
    count += extractItems(day.details, validPath).length;
  }
  return count;
}

// ── Summary ───────────────────────────────────────────────────────────────────

export interface SummaryEntry {
  label: string;
  value: unknown;
  unit: string | null;
  type: TraceMappingField['type'];
}

/**
 * Extracts summary key-value pairs from details root level.
 * Only fields with display:true are included.
 */
export function extractSummaryValues(
  details: Record<string, unknown> | null,
  summaryFields: TraceMappingField[],
): SummaryEntry[] {
  if (!details) return [];
  return summaryFields
    .filter(f => f.display)
    .map(f => ({
      label: f.label,
      value: getNestedValue(details, f.key),
      unit: f.unit ?? null,
      type: f.type,
    }));
}

// ── Table rows ────────────────────────────────────────────────────────────────

export interface TableRow {
  /** Display values keyed by column key (for rendering) */
  display: Record<string, string>;
}

/**
 * Constructs row data from items + columns.
 * Handles nested dot-notation keys and formattedKey fallback.
 */
export function buildTableRows(
  items: unknown[],
  columns: TraceMappingField[],
): TableRow[] {
  return items
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(item => {
      const display: Record<string, string> = {};

      for (const col of columns) {
        const rawValue = getNestedValue(item, col.key);

        // Use formattedKey value for display if available
        const displayValue = col.formattedKey
          ? (getNestedValue(item, col.formattedKey) ?? rawValue)
          : rawValue;

        display[col.key] = formatCellValue(displayValue, col);
      }

      return { display };
    });
}

// ── Cell formatting ───────────────────────────────────────────────────────────

/**
 * Formats a value by its declared type and optional unit.
 * Usable without a full TraceMappingField object (e.g. for summary cards).
 */
export function formatValueByType(
  value: unknown,
  type: TraceMappingField['type'],
  unit?: string | null,
): string {
  if (value === null || value === undefined) return '-';

  switch (type) {
    case 'date': {
      if (value === '') return '-';
      if (typeof value !== 'string' && typeof value !== 'number') return '-';
      try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return String(value);
      }
    }
    case 'number': {
      if (typeof value !== 'number' || Number.isNaN(value)) return '-';
      const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2);
      return unit ? `${formatted}${unit}` : formatted;
    }
    case 'boolean':
      return value ? '예' : '아니오';
    case 'string':
      return String(value) || '-';
    default:
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
  }
}

/**
 * Type-aware cell value formatting using a TraceMappingField.
 * Delegates to formatValueByType.
 */
export function formatCellValue(value: unknown, field: TraceMappingField): string {
  return formatValueByType(value, field.type, field.unit);
}

// ── Unified table for TraceDetailModal ────────────────────────────────────────

/** MR general info column definitions. Keys prefixed with __mr_ to avoid collision. */
export const MR_GENERAL_COLUMNS: TraceMappingField[] = [
  { key: '__mr_iid', label: 'IID', type: 'number', display: true },
  { key: '__mr_title', label: '제목', type: 'string', display: true },
  { key: '__mr_projectName', label: '프로젝트', type: 'string', display: true },
  { key: '__mr_branch', label: '브랜치', type: 'string', display: true },
  { key: '__mr_author', label: '작성자', type: 'string', display: true },
];

/** Date column definition for multi-day flattened data. */
export const DATE_COLUMN: TraceMappingField = {
  key: '__date', label: '날짜', type: 'date', display: true,
};

/**
 * Builds unified table columns: optional date + MR general + referenceFields (non-overlapping) + metric-specific.
 * MR general columns are included only when mergeRequests data is available.
 * referenceFields that overlap with MR_GENERAL_COLUMNS (id, repositoryId) are excluded.
 */
export function buildUnifiedColumns(
  referenceFields: TraceMappingField[],
  validItemFields: TraceMappingField[],
  itemType: 'mergeRequest' | 'commit',
  hasMergeRequests: boolean,
  isMultiDay: boolean,
): TraceMappingField[] {
  // Keys already covered by MR_GENERAL_COLUMNS (commit SHA 'id' is NOT covered for commit-type)
  const MR_COVERED_KEYS = itemType === 'mergeRequest'
    ? new Set(['id', 'repositoryId'])
    : new Set(['repositoryId']);

  const cols: TraceMappingField[] = [];
  if (isMultiDay) cols.push(DATE_COLUMN);
  if (hasMergeRequests) cols.push(...MR_GENERAL_COLUMNS);
  // Add referenceFields not already covered by MR general columns
  cols.push(...referenceFields.filter(f => f.display && !(hasMergeRequests && MR_COVERED_KEYS.has(f.key))));
  cols.push(...validItemFields.filter(f => f.display));
  return cols;
}

export interface UnifiedRowInput {
  date?: string;
  item: Record<string, unknown>;
}

/**
 * Builds unified table rows by joining detail items with MergeRequestSummary.
 * Each row contains: date (optional) + MR general info + metric-specific values.
 */
export function buildUnifiedRows(
  inputs: UnifiedRowInput[],
  columns: TraceMappingField[],
  mergeRequests: MergeRequestSummary[] | null,
  itemType: 'mergeRequest' | 'commit',
): TableRow[] {
  // Build MR lookup map: "iid:repositoryId" -> MergeRequestSummary
  const mrMap = new Map<string, MergeRequestSummary>();
  if (mergeRequests) {
    for (const mr of mergeRequests) {
      mrMap.set(`${mr.iid}:${mr.repositoryId}`, mr);
    }
  }

  return inputs.map(({ date, item }) => {
    const display: Record<string, string> = {};

    // Find matching MR
    const idField = itemType === 'commit' ? 'mrId' : 'id';
    const itemId = String(item[idField] ?? '');
    const repoId = String(item.repositoryId ?? '');
    const mr = mrMap.get(`${itemId}:${repoId}`);

    for (const col of columns) {
      if (col.key === '__date') {
        display[col.key] = date ? formatYYYYMMDD(date) : '-';
      } else if (col.key === '__mr_iid') {
        display[col.key] = mr ? `!${mr.iid}` : '-';
      } else if (col.key === '__mr_title') {
        display[col.key] = mr?.title ?? '-';
      } else if (col.key === '__mr_projectName') {
        display[col.key] = mr?.projectName ?? mr?.repositoryName ?? '-';
      } else if (col.key === '__mr_branch') {
        display[col.key] = mr ? `${mr.sourceBranch} -> ${mr.targetBranch}` : '-';
      } else if (col.key === '__mr_author') {
        display[col.key] = mr?.author ?? '-';
      } else {
        // Metric-specific field from traceMapping
        const rawValue = getNestedValue(item, col.key);
        const displayValue = col.formattedKey
          ? (getNestedValue(item, col.formattedKey) ?? rawValue)
          : rawValue;
        display[col.key] = formatCellValue(displayValue, col);
      }
    }

    return { display };
  });
}

/**
 * Flattens items from all days' details into a single array with date metadata.
 */
export function flattenDailyItems(
  rawDailyData: DailyUserMetric[],
  validPath: string,
): UnifiedRowInput[] {
  const result: UnifiedRowInput[] = [];
  for (const day of rawDailyData) {
    if (!day.details) continue;
    const items = extractItems(day.details, validPath);
    for (const item of items) {
      result.push({ date: day.date, item: item as Record<string, unknown> });
    }
  }
  return result;
}

/**
 * Formats a YYYYMMDD date string to MM/DD for compact table display.
 */
export function formatYYYYMMDD(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(6, 8)}`;
}

// ── High-level facade ─────────────────────────────────────────────────────────

export interface UnifiedTableResult {
  columns: TraceMappingField[];
  rows: TableRow[];
  summaryEntries: SummaryEntry[];
  invalidColumns: TraceMappingField[];
  invalidRows: TableRow[];
}

/**
 * Builds all table data for a trace member detail modal from top-level inputs.
 * Hides the internal field structure of TraceMapping from callers.
 */
export function buildUnifiedTable(
  traceMapping: TraceMapping,
  rawDailyData: DailyUserMetric[] | null,
  mergeRequests: MergeRequestSummary[] | null,
  period: 'DAILY' | 'MONTHLY',
): UnifiedTableResult {
  const { referenceFields, validItemFields, invalidItemFields, itemsLocation, summaryFields, itemType } = traceMapping;
  const isMultiDay = period === 'MONTHLY' && (rawDailyData?.length ?? 0) > 1;
  const hasMergeRequests = mergeRequests !== null && mergeRequests.length > 0;

  const columns = buildUnifiedColumns(referenceFields, validItemFields, itemType, hasMergeRequests, isMultiDay);
  const inputs = rawDailyData ? flattenDailyItems(rawDailyData, itemsLocation.validPath) : [];
  const rows = buildUnifiedRows(inputs, columns, mergeRequests, itemType);

  const dayWithData = rawDailyData?.find(d => d.details !== null) ?? null;
  const summaryEntries = extractSummaryValues(dayWithData?.details ?? null, summaryFields);

  const invalidColumns = extractDisplayColumns(referenceFields, invalidItemFields);
  const invalidInputs = rawDailyData ? flattenDailyItems(rawDailyData, itemsLocation.invalidPath) : [];
  const invalidRows = buildTableRows(invalidInputs.map(i => i.item), invalidColumns);

  return { columns, rows, summaryEntries, invalidColumns, invalidRows };
}

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Light runtime validation of a traceMapping value.
 * Returns false if the shape is unexpected (e.g. null, wrong itemType, missing arrays).
 */
export function isTraceMappingValid(mapping: unknown): mapping is TraceMapping {
  if (!mapping || typeof mapping !== 'object') return false;
  const m = mapping as Record<string, unknown>;
  return (
    (m.itemType === 'mergeRequest' || m.itemType === 'commit') &&
    m.itemsLocation !== null &&
    typeof m.itemsLocation === 'object' &&
    Array.isArray(m.referenceFields) &&
    Array.isArray(m.summaryFields) &&
    Array.isArray(m.validItemFields) &&
    Array.isArray(m.invalidItemFields)
  );
}
