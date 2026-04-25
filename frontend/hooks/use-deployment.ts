"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { DeploymentStatus, LogEntry, Deployment } from "@/lib/types";

const formatTimestamp = () => {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace("T", " ");
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const getSocketUrl = () => process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:9001";

const classifyLogType = (message: string): LogEntry["type"] => {
  const lower = message.toLowerCase();
  if (lower.includes("error") || lower.includes("failed")) return "error";
  if (lower.includes("warning")) return "warning";
  if (lower.includes("success") || lower.includes("done")) return "success";
  if (lower.includes("build") || lower.includes("upload") || lower.includes("deploy")) return "info";
  return "default";
};

const parseSocketMessage = (payload: unknown): string => {
  if (typeof payload !== "string") return "";
  try {
    const parsed = JSON.parse(payload) as { log?: unknown };
    if (typeof parsed.log === "string") {
      return parsed.log;
    }
    return payload;
  } catch {
    return payload;
  }
};

export function useDeployment() {
  const [deployment, setDeployment] = useState<Deployment>({
    id: "",
    slug: undefined,
    repoUrl: "",
    status: "idle",
    logs: [],
    deployedUrl: undefined,
    errorMessage: undefined,
    startTime: null,
    endTime: null,
  });

  const socketRef = useRef<Socket | null>(null);
  const addLog = useCallback((message: string, type: LogEntry["type"] = "default") => {
    const newLog: LogEntry = {
      id: generateId(),
      timestamp: formatTimestamp(),
      message,
      type,
    };
    setDeployment((prev) => ({
      ...prev,
      logs: [...prev.logs, newLog],
    }));
  }, []);

  const setStatus = useCallback((status: DeploymentStatus) => {
    setDeployment((prev) => ({ ...prev, status }));
  }, []);

  const startDeployment = useCallback(
    async (repoUrl: string) => {
      socketRef.current?.disconnect();

      setDeployment({
        id: generateId(),
        slug: undefined,
        repoUrl,
        status: "queued",
        logs: [],
        deployedUrl: undefined,
        errorMessage: undefined,
        startTime: new Date(),
        endTime: null,
      });

      try {
        const response = await fetch(`${getApiUrl()}/project`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gitURL: repoUrl }),
        });

        const responseJson = (await response.json()) as {
          data?: { slug?: string; projectSlug?: string; url?: string };
          slug?: string;
          projectSlug?: string;
          url?: string;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(responseJson.message || "Failed to start deployment");
        }

        const payload = responseJson.data ?? responseJson;
        const slug = payload.slug ?? payload.projectSlug;
        const deployedUrl = payload.url;

        if (!slug || !deployedUrl) {
          throw new Error("API response missing slug or url");
        }

        setDeployment((prev) => ({
          ...prev,
          slug,
          deployedUrl,
        }));

        addLog(`Deployment queued for ${slug}`, "info");

        socketRef.current = io(getSocketUrl(), {
          transports: ["websocket", "polling"],
          timeout: 5000,
        });

        socketRef.current.on("connect", () => {
          socketRef.current?.emit("subscribe", `logs:${slug}`);
          addLog(`Subscribed to logs:${slug}`, "info");
        });

        socketRef.current.on("message", (payloadMessage: unknown) => {
          const message = parseSocketMessage(payloadMessage).trim();
          if (!message) return;

          if (message.startsWith("joined ")) {
            return;
          }

          addLog(message, classifyLogType(message));

          const lower = message.toLowerCase();
          if (lower.includes("build started")) {
            setStatus("building");
          } else if (lower.includes("uploading file") || lower.includes("uploaded file")) {
            setStatus("uploading");
          } else if (lower.includes("all files uploaded")) {
            setStatus("deploying");
          } else if (lower.includes("done")) {
            setDeployment((prev) => ({
              ...prev,
              status: "completed",
              endTime: new Date(),
            }));
          }

          if (lower.includes("error") || lower.includes("failed")) {
            setDeployment((prev) => ({
              ...prev,
              status: "failed",
              errorMessage: message,
              endTime: new Date(),
            }));
          }
        });

        socketRef.current.on("connect_error", (error) => {
          setDeployment((prev) => ({
            ...prev,
            status: "failed",
            errorMessage: error.message || "Socket connection failed",
            endTime: new Date(),
          }));
        });

        socketRef.current.on("disconnect", () => {
          setDeployment((prev) => {
            if (prev.status === "completed" || prev.status === "failed") {
              return prev;
            }
            return {
              ...prev,
              status: "deploying",
            };
          });
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to start deployment";
        setDeployment((prev) => ({
          ...prev,
          status: "failed",
          errorMessage: message,
          endTime: new Date(),
        }));
        addLog(message, "error");
      }
    },
    [addLog, setStatus]
  );

  const retryDeployment = useCallback(() => {
    if (deployment.repoUrl) {
      startDeployment(deployment.repoUrl);
    }
  }, [deployment.repoUrl, startDeployment]);

  const resetDeployment = useCallback(() => {
    socketRef.current?.disconnect();
    setDeployment({
      id: "",
      slug: undefined,
      repoUrl: "",
      status: "idle",
      logs: [],
      deployedUrl: undefined,
      errorMessage: undefined,
      startTime: null,
      endTime: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return {
    deployment,
    startDeployment,
    retryDeployment,
    resetDeployment,
    isDeploying: !["idle", "completed", "failed"].includes(deployment.status),
  };
}
