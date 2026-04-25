export type DeploymentStatus =
  | "idle"
  | "queued"
  | "building"
  | "uploading"
  | "deploying"
  | "completed"
  | "failed";

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "default";
}

export interface Deployment {
  id: string;
  slug?: string;
  repoUrl: string;
  status: DeploymentStatus;
  logs: LogEntry[];
  deployedUrl?: string;
  errorMessage?: string;
  startTime: Date | null;
  endTime: Date | null;
}
