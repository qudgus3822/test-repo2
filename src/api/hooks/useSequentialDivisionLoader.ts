import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchTraceability } from "@/api/traceability";
import { traceabilityKeys } from "./traceabilityKeys";
import type { TraceResult, TraceQuery, DivisionTraceNode } from "@/types/traceability.types";

export type DivisionLoadState = "pending" | "loading" | "loaded" | "error";

export interface DivisionLoadStatus {
  departmentCode: string;
  departmentName: string;
  state: DivisionLoadState;
  data?: TraceResult;
  error?: string;
}

/**
 * Sequential division loading hook.
 *
 * After company-level data arrives (with shallow division summaries),
 * this hook auto-loads each division's details one-by-one in sequence,
 * NOT in parallel.
 *
 * Each division transitions through states:
 *   'pending' -> 'loading' -> 'loaded' | 'error'
 *
 * Race condition protection:
 * - A `generationRef` counter increments on every context change (divisions/metricName/periodKey).
 * - Each fetch captures the current generation; `.then()` checks if it still matches before updating state.
 * - AbortSignal is passed to `fetchTraceability` to cancel in-flight HTTP requests on cleanup.
 *
 * @param divisions - Division nodes from the company-level trace response
 * @param metricName - API metric name (lower_snake_case)
 * @param periodKey - Period key (YYYYMMDD or YYYY-MM)
 * @param enabled - Whether to start loading
 */
export const useSequentialDivisionLoader = (
  divisions: DivisionTraceNode[],
  metricName: string,
  periodKey: string,
  enabled: boolean,
) => {
  const queryClient = useQueryClient();
  const [divisionStates, setDivisionStates] = useState<Map<string, DivisionLoadStatus>>(
    new Map(),
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generation counter -- increments on every context change to invalidate stale callbacks
  const generationRef = useRef(0);

  // Mounted ref -- prevents setState after unmount (used by retryDivision)
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initialize states when divisions / context change
  useEffect(() => {
    if (!enabled || divisions.length === 0) return;

    // Increment generation to invalidate any in-flight fetches from previous context
    generationRef.current += 1;

    const initial = new Map<string, DivisionLoadStatus>();
    divisions.forEach(div => {
      initial.set(div.departmentCode, {
        departmentCode: div.departmentCode,
        departmentName: div.departmentName,
        state: "pending",
      });
    });
    setDivisionStates(initial);
    setCurrentIndex(0);
  }, [divisions, enabled, metricName, periodKey]);

  // Sequential loader effect
  useEffect(() => {
    if (!enabled || currentIndex >= divisions.length) return;

    const division = divisions[currentIndex];
    const deptCode = division.departmentCode;

    // Capture the current generation for stale-closure guard
    const thisGeneration = generationRef.current;

    // Set current division to 'loading'
    setDivisionStates(prev => {
      const next = new Map(prev);
      const existing = next.get(deptCode);
      if (existing) {
        next.set(deptCode, { ...existing, state: "loading" });
      }
      return next;
    });

    const query: TraceQuery = {
      metricName,
      periodKey,
      aggregationLevel: "DIVISION",
      departmentCode: deptCode,
    };

    const abortController = new AbortController();

    fetchTraceability(query, abortController.signal)
      .then(data => {
        // Guard: discard if generation changed (context switched) or aborted
        if (thisGeneration !== generationRef.current) return;
        if (abortController.signal.aborted) return;

        // Cache in React Query
        queryClient.setQueryData(traceabilityKeys.byQuery(query), data);

        setDivisionStates(prev => {
          const next = new Map(prev);
          next.set(deptCode, {
            departmentCode: deptCode,
            departmentName: division.departmentName,
            state: "loaded",
            data,
          });
          return next;
        });

        // Move to next division
        setCurrentIndex(i => i + 1);
      })
      .catch(err => {
        // Guard: discard if generation changed or aborted
        if (thisGeneration !== generationRef.current) return;
        if (abortController.signal.aborted) return;

        setDivisionStates(prev => {
          const next = new Map(prev);
          next.set(deptCode, {
            departmentCode: deptCode,
            departmentName: division.departmentName,
            state: "error",
            error: (err as Error).message,
          });
          return next;
        });

        // Move to next even on error (don't block the queue)
        setCurrentIndex(i => i + 1);
      });

    return () => abortController.abort();
  }, [enabled, currentIndex, divisions, metricName, periodKey, queryClient]);

  // Track per-department retry AbortControllers to prevent concurrent retries for the same division
  const retryAbortRef = useRef<Map<string, AbortController>>(new Map());

  // Clean up all retry controllers on unmount
  useEffect(() => {
    const ref = retryAbortRef.current;
    return () => {
      ref.forEach(controller => controller.abort());
      ref.clear();
    };
  }, []);

  // Retry a specific division
  const retryDivision = useCallback(
    (deptCode: string) => {
      const divIndex = divisions.findIndex(d => d.departmentCode === deptCode);
      if (divIndex === -1) return;

      // Capture generation at retry start to guard against context switches
      const thisGeneration = generationRef.current;

      // Abort any previous retry for this department
      const prevController = retryAbortRef.current.get(deptCode);
      if (prevController) {
        prevController.abort();
      }

      // Reset that division to 'loading'
      setDivisionStates(prev => {
        const next = new Map(prev);
        next.set(deptCode, {
          departmentCode: deptCode,
          departmentName: divisions[divIndex].departmentName,
          state: "loading",
        });
        return next;
      });

      const query: TraceQuery = {
        metricName,
        periodKey,
        aggregationLevel: "DIVISION",
        departmentCode: deptCode,
      };

      const abortController = new AbortController();
      retryAbortRef.current.set(deptCode, abortController);

      fetchTraceability(query, abortController.signal)
        .then(data => {
          // Guard: discard if generation changed (context switched), unmounted, or aborted
          if (thisGeneration !== generationRef.current) return;
          if (!mountedRef.current) return;
          if (abortController.signal.aborted) return;

          // Clean up the controller reference
          retryAbortRef.current.delete(deptCode);

          queryClient.setQueryData(traceabilityKeys.byQuery(query), data);
          setDivisionStates(prev => {
            const next = new Map(prev);
            next.set(deptCode, {
              departmentCode: deptCode,
              departmentName: divisions[divIndex].departmentName,
              state: "loaded",
              data,
            });
            return next;
          });
        })
        .catch(err => {
          // Guard: discard if generation changed (context switched), unmounted, or aborted
          if (thisGeneration !== generationRef.current) return;
          if (!mountedRef.current) return;
          if (abortController.signal.aborted) return;

          // Clean up the controller reference
          retryAbortRef.current.delete(deptCode);

          setDivisionStates(prev => {
            const next = new Map(prev);
            next.set(deptCode, {
              departmentCode: deptCode,
              departmentName: divisions[divIndex].departmentName,
              state: "error",
              error: (err as Error).message,
            });
            return next;
          });
        });
    },
    [divisions, metricName, periodKey, queryClient],
  );

  // allSettled: true only when all divisions have reached a terminal state (loaded or error).
  // size === 0 guard prevents vacuous true on an empty map (non-COMPANY flow or before init).
  const allSettled =
    divisionStates.size > 0 &&
    Array.from(divisionStates.values()).every(
      (s) => s.state === "loaded" || s.state === "error",
    );

  return { divisionStates, retryDivision, allSettled };
};
