"use client";

import { motion } from "framer-motion";
import { Check, Loader2, Circle, AlertCircle } from "lucide-react";
import { DeploymentStatus } from "@/lib/types";

interface StatusTimelineProps {
  currentStatus: DeploymentStatus;
  hasError: boolean;
}

const stages: { status: DeploymentStatus; label: string }[] = [
  { status: "queued", label: "Queued" },
  { status: "building", label: "Building" },
  { status: "uploading", label: "Uploading" },
  { status: "deploying", label: "Deploying" },
  { status: "completed", label: "Completed" },
];

const statusOrder: Record<DeploymentStatus, number> = {
  idle: -1,
  queued: 0,
  building: 1,
  uploading: 2,
  deploying: 3,
  completed: 4,
  failed: 4,
};

export function StatusTimeline({ currentStatus, hasError }: StatusTimelineProps) {
  const currentIndex = statusOrder[currentStatus];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border/50 mx-6" />

        {/* Progress line filled */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-accent mx-6"
          initial={{ width: "0%" }}
          animate={{
            width: hasError
              ? `${(currentIndex / (stages.length - 1)) * 100}%`
              : `${(currentIndex / (stages.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {stages.map((stage, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;
          const isFailed = hasError && isCurrent;

          return (
            <div
              key={stage.status}
              className="relative flex flex-col items-center z-10"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 border-2
                  ${
                    isFailed
                      ? "bg-destructive/20 border-destructive text-destructive"
                      : isCompleted
                      ? "bg-accent/20 border-accent text-accent"
                      : isCurrent
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-secondary border-border text-muted-foreground"
                  }
                `}
              >
                {isFailed ? (
                  <AlertCircle className="w-5 h-5" />
                ) : isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </motion.div>

              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className={`
                  mt-3 text-xs font-medium whitespace-nowrap
                  ${
                    isFailed
                      ? "text-destructive"
                      : isCompleted || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                `}
              >
                {stage.label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
