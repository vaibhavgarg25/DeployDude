"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Rocket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeployFormProps {
  onDeploy: (repoUrl: string) => void;
  isDeploying: boolean;
}

export function DeployForm({ onDeploy, isDeploying }: DeployFormProps) {
  const [repoUrl, setRepoUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onDeploy(repoUrl.trim());
    }
  };

  const isValidUrl = repoUrl.includes("github.com") || repoUrl.includes("gitlab.com");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/30 via-info/20 to-accent/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

        {/* Card */}
        <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
              <GitBranch className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Import Git Repository
              </h3>
              <p className="text-sm text-muted-foreground">
                Enter your repository URL to start deployment
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <GitBranch className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full pl-12 pr-4 py-4 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-200 font-mono text-sm"
                disabled={isDeploying}
              />
              {repoUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                    isValidUrl ? "bg-accent" : "bg-warning"
                  }`}
                />
              )}
            </div>

            <Button
              type="submit"
              disabled={!repoUrl.trim() || isDeploying}
              className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeploying ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deploying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Deploy
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              Supports GitHub, GitLab, and Bitbucket repositories
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
