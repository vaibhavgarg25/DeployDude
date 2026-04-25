"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Minimize2, Maximize2 } from "lucide-react";
import { LogEntry } from "@/lib/types";

interface LogsTerminalProps {
  logs: LogEntry[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function LogsTerminal({
  logs,
  isExpanded = true,
  onToggleExpand,
}: LogsTerminalProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-accent";
      case "error":
        return "text-destructive";
      case "warning":
        return "text-warning";
      case "info":
        return "text-info";
      default:
        return "text-muted-foreground";
    }
  };

  const getLogPrefix = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✗";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "›";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border border-border rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-accent/80" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Terminal className="w-4 h-4" />
            <span className="text-sm font-medium">Deployment Logs</span>
          </div>
        </div>
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg hover:bg-border/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Terminal Body */}
      <div
        className={`
          bg-[#0a0a0f] border-x border-b border-border rounded-b-xl overflow-hidden
          transition-all duration-300
          ${isExpanded ? "h-80" : "h-40"}
        `}
      >
        <div className="h-full overflow-y-auto p-4 font-mono text-sm">
          <AnimatePresence mode="popLayout">
            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="flex items-start gap-3 py-1 group"
              >
                <span className="text-muted-foreground/50 select-none shrink-0 w-40">
                  [{log.timestamp}]
                </span>
                <span className={`shrink-0 ${getLogColor(log.type)}`}>
                  {getLogPrefix(log.type)}
                </span>
                <span
                  className={`${
                    log.type === "error"
                      ? "text-destructive"
                      : log.type === "success"
                      ? "text-accent"
                      : "text-foreground/90"
                  }`}
                >
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {logs.length > 0 && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-2 py-1 text-muted-foreground"
            >
              <span className="w-2 h-4 bg-accent/80" />
            </motion.div>
          )}

          <div ref={logsEndRef} />
        </div>
      </div>
    </motion.div>
  );
}
