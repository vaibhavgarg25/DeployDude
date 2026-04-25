"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { GridBackground } from "@/components/grid-background";
import { DeployForm } from "@/components/deploy-form";
import { DeploymentStatus } from "@/components/deployment-status";
import { DeploymentResultCard } from "@/components/deployment-result-card";
import { useDeployment } from "@/hooks/use-deployment";

export default function Home() {
  const {
    deployment,
    startDeployment,
    retryDeployment,
    resetDeployment,
    isDeploying,
  } = useDeployment();

  const showForm = deployment.status === "idle";
  const showProgress = deployment.status !== "idle";

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <GridBackground />
      <Navbar />

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {showForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-16"
              >
                <Hero />

                <DeployForm
                  onDeploy={startDeployment}
                  isDeploying={isDeploying}
                />

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24"
                >
                  <FeatureCard
                    title="Git Integration"
                    description="Paste your Git repository URL and deploy your frontend instantly."
                    icon="🔗"
                  />
                  <FeatureCard
                    title="Live Build Logs"
                    description="Watch every build step in real time using Socket.IO logs."
                    icon="⚡"
                  />
                  <FeatureCard
                    title="Deployment Preview"
                    description="Get a final deployment link once the build is completed."
                    icon="🚀"
                  />
                </motion.div>
              </motion.div>
            )}

            {showProgress && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-8 space-y-10"
              >
                <div className="text-center">
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
                  >
                    Deploying your project
                  </motion.h2>

                  <p className="text-muted-foreground">
                    Deployment has been queued. Live logs will appear here as
                    soon as the build container starts.
                  </p>
                </div>

                <DeploymentStatus
                  repoUrl={deployment.repoUrl}
                  status={deployment.status}
                  logs={deployment.logs}
                  startTime={deployment.startTime}
                  // deployedUrl={deployment.deployedUrl}
                />

                {(deployment.status === "completed" ||
                  deployment.status === "failed") && (
                  <DeploymentResultCard
                    success={deployment.status === "completed"}
                    deployedUrl={deployment.deployedUrl}
                    errorMessage={deployment.errorMessage}
                    onRetry={retryDeployment}
                    onNewDeploy={resetDeployment}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer className="relative z-10 border-t border-border/50 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 DeployDude. Built with ❤️ for developers.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-info/20 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
      <div className="relative bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 h-full">
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}