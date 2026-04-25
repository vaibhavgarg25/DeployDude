"use client";

import { motion } from "framer-motion";
import { Rocket, Zap, Shield, Globe } from "lucide-react";

export function Hero() {
  return (
    <div className="text-center space-y-8">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium"
      >
        <Zap className="w-4 h-4" />
        <span>Lightning-fast deployments</span>
      </motion.div>

      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-4"
      >
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
          <span className="text-foreground">Deploy your</span>
          <br />
          <span className="bg-gradient-to-r from-accent via-info to-accent bg-clip-text text-transparent">
            frontend instantly
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          The modern deployment platform for developers. Connect your Git
          repository and ship to production in seconds.
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-accent" />
          <span>Auto-deploy on push</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          <span>Global edge network</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          <span>Free SSL certificates</span>
        </div>
      </motion.div>
    </div>
  );
}
