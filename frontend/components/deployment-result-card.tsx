"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeploymentResultCardProps {
  success: boolean;
  deployedUrl?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onNewDeploy?: () => void;
}

export function DeploymentResultCard({
  success,
  deployedUrl,
  errorMessage,
  onRetry,
  onNewDeploy,
}: DeploymentResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (deployedUrl) {
      await navigator.clipboard.writeText(deployedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (success && deployedUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="relative group">
          {/* Success glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/40 via-accent/20 to-accent/40 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

          <div className="relative bg-card/90 backdrop-blur-xl border border-accent/30 rounded-2xl p-8 shadow-2xl">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-accent/30 rounded-full blur-xl" />
                <div className="relative p-4 rounded-full bg-accent/20 border border-accent/30">
                  <CheckCircle2 className="w-12 h-12 text-accent" />
                </div>
              </motion.div>
            </div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Deployment Successful!
              </h2>
              <p className="text-muted-foreground">
                Your application is now live and ready to use
              </p>
            </motion.div>

            {/* Deployed URL Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-secondary/50 border border-border rounded-xl p-4 mb-6"
            >
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2 block">
                Deployed URL
              </label>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-sm font-mono text-accent truncate">
                  {deployedUrl}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg hover:bg-border/50 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy URL"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-accent" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                asChild
                className="flex-1 h-12 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-xl"
              >
                <a
                  href={deployedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open Deployment
                </a>
              </Button>
              <Button
                onClick={onNewDeploy}
                variant="outline"
                className="flex-1 h-12 border-border hover:bg-secondary text-foreground font-semibold rounded-xl"
              >
                <Rocket className="w-5 h-5 mr-2" />
                New Deployment
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Error state
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative group">
        {/* Error glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-destructive/30 via-destructive/10 to-destructive/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

        <div className="relative bg-card/90 backdrop-blur-xl border border-destructive/30 rounded-2xl p-8 shadow-2xl">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-destructive/30 rounded-full blur-xl" />
              <div className="relative p-4 rounded-full bg-destructive/20 border border-destructive/30">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
            </motion.div>
          </div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Deployment Failed
            </h2>
            <p className="text-muted-foreground">
              Something went wrong during the deployment process
            </p>
          </motion.div>

          {/* Error Details */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6"
            >
              <label className="text-xs text-destructive uppercase tracking-wider font-medium mb-2 block">
                Error Details
              </label>
              <code className="text-sm font-mono text-destructive/90">
                {errorMessage}
              </code>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              onClick={onRetry}
              className="flex-1 h-12 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-xl"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Retry Deployment
            </Button>
            <Button
              onClick={onNewDeploy}
              variant="outline"
              className="flex-1 h-12 border-border hover:bg-secondary text-foreground font-semibold rounded-xl"
            >
              <Rocket className="w-5 h-5 mr-2" />
              New Repository
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
