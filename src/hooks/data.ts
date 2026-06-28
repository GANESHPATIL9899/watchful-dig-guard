import { useQuery } from "@tanstack/react-query";
import {
  workerRepo,
  machineRepo,
  incidentRepo,
  alertRepo,
  evidenceRepo,
  dashboardRepo,
} from "@/services/repositories";
import { env } from "@/config/environment";

const liveRefetchInterval: number | false = env.USE_MOCK ? false : env.LIVE_REFRESH_MS;

const liveQueryOptions = {
  refetchInterval: liveRefetchInterval,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true,
};

export const useWorkers = () =>
  useQuery({ queryKey: ["workers"], queryFn: () => workerRepo.getAll(), ...liveQueryOptions });
export const useWorker = (id: string) =>
  useQuery({ queryKey: ["workers", id], queryFn: () => workerRepo.getById(id), enabled: !!id, ...liveQueryOptions });

export const useMachines = () =>
  useQuery({ queryKey: ["machines"], queryFn: () => machineRepo.getAll(), ...liveQueryOptions });
export const useMachine = (id: string) =>
  useQuery({ queryKey: ["machines", id], queryFn: () => machineRepo.getById(id), enabled: !!id, ...liveQueryOptions });

export const useIncidents = () =>
  useQuery({ queryKey: ["incidents"], queryFn: () => incidentRepo.getAll(), ...liveQueryOptions });

export const useAlerts = () =>
  useQuery({ queryKey: ["alerts"], queryFn: () => alertRepo.getAll(), ...liveQueryOptions });

export const useEvidence = () =>
  useQuery({ queryKey: ["evidence"], queryFn: () => evidenceRepo.getAll(), ...liveQueryOptions });

export const useDashboardKpis = () =>
  useQuery({ queryKey: ["dashboard", "kpis"], queryFn: () => dashboardRepo.getKpis(), ...liveQueryOptions });

export const useDashboardTrend = () =>
  useQuery({ queryKey: ["dashboard", "trend"], queryFn: () => dashboardRepo.getTrend(), ...liveQueryOptions });
