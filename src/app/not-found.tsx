"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background p-4">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10"
        >
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </motion.div>

        <h1 className="mb-2 text-5xl font-bold tracking-tight">404</h1>
        <p className="mb-2 text-xl font-semibold">Page not found</p>
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
