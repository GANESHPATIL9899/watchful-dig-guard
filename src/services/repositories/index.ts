import { env } from "@/config/environment";
import { http } from "@/services/api/httpClient";
import { inMemoryRepo } from "./base";
import { workers } from "@/mock/workers";
import { machines } from "@/mock/machines";
import { incidents } from "@/mock/incidents";
import { alerts } from "@/mock/alerts";
import { evidence } from "@/mock/evidence";
import { kpiSnapshot, trendDaily } from "@/mock/dashboard";
import type { Alert, EvidenceImage, Incident, KpiSnapshot, Machine, TrendPoint, Worker } from "@/types";

/**
 * Repository factory. Each repo here is the SINGLE place to swap from mock
 * to real backend — flip env.USE_MOCK and these factories begin returning
 * http-backed implementations. UI components never call HTTP or mocks directly.
 */

export const workerRepo = env.USE_MOCK
  ? inMemoryRepo<Worker>(workers)
  : {
      getAll: () => http.get<Worker[]>("/workers"),
      getById: (id: string) => http.get<Worker>(`/workers/${id}`),
      create: (w: Omit<Worker, "id">) => http.post<Worker>("/workers", w),
      update: (id: string, p: Partial<Worker>) => http.put<Worker>(`/workers/${id}`, p),
      delete: (id: string) => http.delete(`/workers/${id}`),
    };

export const machineRepo = env.USE_MOCK
  ? inMemoryRepo<Machine>(machines)
  : {
      getAll: () => http.get<Machine[]>("/machines"),
      getById: (id: string) => http.get<Machine>(`/machines/${id}`),
      create: (m: Omit<Machine, "id">) => http.post<Machine>("/machines", m),
      update: (id: string, p: Partial<Machine>) => http.put<Machine>(`/machines/${id}`, p),
      delete: (id: string) => http.delete(`/machines/${id}`),
    };

export const incidentRepo = env.USE_MOCK
  ? inMemoryRepo<Incident>(incidents)
  : {
      getAll: () => http.get<Incident[]>("/incidents"),
      getById: (id: string) => http.get<Incident>(`/incidents/${id}`),
      create: (i: Omit<Incident, "id">) => http.post<Incident>("/incidents", i),
      update: (id: string, p: Partial<Incident>) => http.put<Incident>(`/incidents/${id}`, p),
      delete: (id: string) => http.delete(`/incidents/${id}`),
    };

export const alertRepo = env.USE_MOCK
  ? inMemoryRepo<Alert>(alerts)
  : {
      getAll: () => http.get<Alert[]>("/alerts"),
      getById: (id: string) => http.get<Alert>(`/alerts/${id}`),
      create: (a: Omit<Alert, "id">) => http.post<Alert>("/alerts", a),
      update: (id: string, p: Partial<Alert>) => http.put<Alert>(`/alerts/${id}`, p),
      delete: (id: string) => http.delete(`/alerts/${id}`),
    };

export const evidenceRepo = env.USE_MOCK
  ? inMemoryRepo<EvidenceImage>(evidence)
  : {
      getAll: () => http.get<EvidenceImage[]>("/evidence"),
      getById: (id: string) => http.get<EvidenceImage>(`/evidence/${id}`),
      create: (e: Omit<EvidenceImage, "id">) => http.post<EvidenceImage>("/evidence", e),
      update: (id: string, p: Partial<EvidenceImage>) => http.put<EvidenceImage>(`/evidence/${id}`, p),
      delete: (id: string) => http.delete(`/evidence/${id}`),
    };

export const dashboardRepo = {
  getKpis: async (): Promise<KpiSnapshot> =>
    env.USE_MOCK ? kpiSnapshot : http.get<KpiSnapshot>("/dashboard/kpis"),
  getTrend: async (): Promise<TrendPoint[]> =>
    env.USE_MOCK ? trendDaily : http.get<TrendPoint[]>("/dashboard/trend"),
};
