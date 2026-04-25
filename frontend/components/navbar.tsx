"use client";

import { motion } from "framer-motion";
import { Rocket, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-6 py-3 bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
              <Rocket className="w-5 h-5 text-accent" />
            </div>
            <span className="text-lg font-bold text-foreground">DeployDude</span>
          </div>

          {/* Links */}
          <div className="hidden sm:flex items-center gap-8">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <GitBranch className="w-4 h-4" />
              GitHub
            </Button>
            {/* <Button
              size="sm"
              className="bg-foreground hover:bg-foreground/90 text-background font-medium rounded-lg"
            >
              Sign In
            </Button> */}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
