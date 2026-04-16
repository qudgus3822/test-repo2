import { vi, it, expect, beforeEach } from "vitest";
import { fetchTraceability } from "@/api/traceability.js";
import { apiGet } from "@/libs/fetch";

vi.mock("@/libs/fetch", () => ({ apiGet: vi.fn() }));

const mockApiGet = vi.mocked(apiGet);

beforeEach(() => {
  mockApiGet.mockReset();
  mockApiGet.mockResolvedValue({} as never);
});

it("MEMBER request uses employeeId param (not memberId)", async () => {
  await fetchTraceability({
    metricName: "review_speed",
    periodKey: "2026-04",
    aggregationLevel: "MEMBER",
    employeeId: "moco.dohyun",
    departmentCode: "3100",
  });
  const url = mockApiGet.mock.calls[0][0] as string;
  // Value passthrough
  expect(url).toContain("employeeId=moco.dohyun");
  // Regression guard: no legacy param name
  expect(url).not.toContain("memberId=");
  // Double-serialization guard: exactly one employeeId=
  expect(url.match(/employeeId=/g)?.length).toBe(1);
  expect(url).toContain("aggregationLevel=MEMBER");
  expect(url).toContain("departmentCode=3100");
});

it("COMPANY request has no employeeId/departmentCode (regression guard)", async () => {
  await fetchTraceability({
    metricName: "x",
    periodKey: "2026-04",
    aggregationLevel: "COMPANY",
  });
  const url = mockApiGet.mock.calls[0][0] as string;
  expect(url).not.toContain("employeeId");
  expect(url).not.toContain("departmentCode");
});

it("DIVISION request has departmentCode but no employeeId", async () => {
  await fetchTraceability({
    metricName: "x",
    periodKey: "2026-04",
    aggregationLevel: "DIVISION",
    departmentCode: "3000",
  });
  const url = mockApiGet.mock.calls[0][0] as string;
  expect(url).toContain("departmentCode=3000");
  expect(url).not.toContain("employeeId");
});
