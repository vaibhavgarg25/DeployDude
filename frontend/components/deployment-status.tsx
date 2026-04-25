"use client";

import { motion } from "framer-motion";
import { GitBranch, Clock, ExternalLink } from "lucide-react";
import { DeploymentStatus as DeploymentStatusType, LogEntry } from "@/lib/types";
import { StatusTimeline } from "./status-timeline";
import { LogsTerminal } from "./logs-terminal";

interface DeploymentStatusProps {
  repoUrl: string;
  status: DeploymentStatusType;
  logs: LogEntry[];
  startTime: Date | null;
}

export function DeploymentStatus({
  repoUrl,
  status,
  logs,
  startTime,
}: DeploymentStatusProps) {
  const getElapsedTime = () => {
    if (!startTime) return "0s";
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const getStatusBadge = () => {
    switch (status) {
      case "queued":
        return (
          <span className="px-3 py-1 rounded-full bg-info/20 text-info text-xs font-medium border border-info/30">
            Queued
          </span>
        );
      case "building":
        return (
          <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-medium border border-warning/30">
            Building
          </span>
        );
      case "uploading":
        return (
          <span className="px-3 py-1 rounded-full bg-info/20 text-info text-xs font-medium border border-info/30">
            Uploading
          </span>
        );
      case "deploying":
        return (
          <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium border border-accent/30">
            Deploying
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium border border-accent/30">
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium border border-destructive/30">
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const extractRepoName = (url: string) => {
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
    return match ? match[1] : url;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* Repository Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary border border-border">
              <GitBranch className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {extractRepoName(repoUrl)}
              </h3>
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
              >
                {repoUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">{getElapsedTime()}</span>
            </div>
            {getStatusBadge()}
          </div>
        </div>
      </motion.div>

      {/* Status Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8"
      >
        <StatusTimeline currentStatus={status} hasError={status === "failed"} />
      </motion.div>

      {/* Logs Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <LogsTerminal logs={logs} />
      </motion.div>
    </motion.div>
  );
}
