import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { NeuralHexagon } from "@/components/NeuralHexagon";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Tandem AI Labs — Coming Soon" },
      {
        name: "description",
        content:
          "Tandem AI Labs is launching soon. A new generation of intelligent systems, built in tandem.",
      },
      { property: "og:title", content: "Tandem AI Labs — Coming Soon" },
      {
        property: "og:description",
        content:
          "Tandem AI Labs is launching soon. A new generation of intelligent systems, built in tandem.",
      },
    ],
  }),
});

function Index() {
  const [assembled, setAssembled] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, oklch(0.04 0 0 / 0.6) 70%, oklch(0.02 0 0) 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 py-10 sm:px-10 sm:py-14">
        {/* Top brand mark */}
        <header className="flex w-full items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span>Tandem</span>
          <span className="hidden sm:inline">est. 2026</span>
        </header>

        {/* Center stage */}
        <section className="relative flex w-full flex-1 items-center justify-center">
          <div className="relative aspect-square w-full max-w-[640px]">
            <NeuralHexagon onAssembled={() => setAssembled(true)} />

            {/* Center text overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {!assembled ? (
                  <motion.h2
                    key="coming"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.4, filter: "blur(8px)" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="animate-breathe text-center text-2xl font-light tracking-[0.35em] text-foreground sm:text-3xl"
                  >
                    COMING&nbsp;SOON
                  </motion.h2>
                ) : (
                  <motion.h1
                    key="brand"
                    initial={{ opacity: 0, scale: 0.4, filter: "blur(14px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center"
                  >
                    <span className="block text-2xl font-semibold tracking-tight text-foreground sm:text-4xl glow-text">
                      Tandem AI Labs
                    </span>
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="mt-3 block text-[10px] uppercase tracking-[0.4em] text-muted-foreground sm:text-xs"
                    >
                      Intelligence · In Tandem
                    </motion.span>
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Contact panel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: assembled ? 1 : 0.4, y: assembled ? 0 : 20 }}
          transition={{ duration: 0.8, delay: assembled ? 0.4 : 0 }}
          className="w-full max-w-xl"
        >
          <div className="glass-panel rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Contact
              </h3>
              <span className="h-px flex-1 ml-4 bg-border" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="tel:+917359563504"
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-white/[0.02] px-4 py-3 transition-all hover:border-white/30 hover:bg-white/[0.05]"
              >
                <Phone className="h-4 w-4 text-foreground/70 transition-colors group-hover:text-foreground" />
                <span className="glow-text text-sm font-light tracking-wide text-foreground">
                  +91 73595 63504
                </span>
              </a>
              <a
                href="mailto:Aryan@tandem-ai.tech"
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-white/[0.02] px-4 py-3 transition-all hover:border-white/30 hover:bg-white/[0.05]"
              >
                <Mail className="h-4 w-4 text-foreground/70 transition-colors group-hover:text-foreground" />
                <span className="glow-text text-sm font-light tracking-wide text-foreground">
                  Aryan@tandem-ai.tech
                </span>
              </a>
            </div>
          </div>
          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            © 2026 Tandem AI Labs · All Rights Reserved
          </p>
        </motion.section>
      </div>
    </main>
  );
}
