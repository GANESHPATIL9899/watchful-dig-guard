import { useQuery } from "@tanstack/react-query";
import {
  workerRepo,
  machineRepo,
  incidentRepo,
  alertRepo,
  evidenceRepo,
  dashboardRepo,
} from "@/services/repositories";

export const useWorkers = () =>
  useQuery({ queryKey: ["workers"], queryFn: () => workerRepo.getAll() });
export const useWorker = (id: string) =>
  useQuery({ queryKey: ["workers", id], queryFn: () => workerRepo.getById(id), enabled: !!id });

export const useMachines = () =>
  useQuery({ queryKey: ["machines"], queryFn: () => machineRepo.getAll() });
export const useMachine = (id: string) =>
  useQuery({ queryKey: ["machines", id], queryFn: () => machineRepo.getById(id), enabled: !!id });

export const useIncidents = () =>
  useQuery({ queryKey: ["incidents"], queryFn: () => incidentRepo.getAll() });

export const useAlerts = () =>
  useQuery({ queryKey: ["alerts"], queryFn: () => alertRepo.getAll() });

export const useEvidence = () =>
  useQuery({ queryKey: ["evidence"], queryFn: () => evidenceRepo.getAll() });

export const useDashboardKpis = () =>
  useQuery({ queryKey: ["dashboard", "kpis"], queryFn: () => dashboardRepo.getKpis() });

export const useDashboardTrend = () =>
  useQuery({ queryKey: ["dashboard", "trend"], queryFn: () => dashboardRepo.getTrend() });
