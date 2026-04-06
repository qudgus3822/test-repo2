import type { TraceQuery } from "@/types/traceability.types";

export const traceabilityKeys = {
  all: ["traceability"] as const,
  byQuery: (query: TraceQuery) => [...traceabilityKeys.all, query] as const,
};
