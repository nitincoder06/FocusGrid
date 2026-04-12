"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
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

        <h1 className="mb-2 text-5xl font-bold tracking-tight">500</h1>
        <p className="mb-2 text-xl font-semibold">Something went wrong</p>
        <p className="mb-8 text-muted-foreground">
          We encountered an unexpected error. Please try again or contact support if the issue
          persists.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 rounded-lg bg-destructive/5 p-4 text-left text-xs text-muted-foreground">
            <summary className="cursor-pointer font-semibold">Error details</summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
