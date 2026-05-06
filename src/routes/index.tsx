import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone, Send } from "lucide-react";
import { NeuralHexagon } from "@/components/NeuralHexagon";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Tandem AI Labs — Coming Soon" },
      {
        name: "description",
        content:
          "Tandem AI Labs is launching soon. Automate your manual workflows with intelligent systems built in tandem.",
      },
      { property: "og:title", content: "Tandem AI Labs — Coming Soon" },
      {
        property: "og:description",
        content:
          "Tandem AI Labs is launching soon. Automate your manual workflows with intelligent systems built in tandem.",
      },
    ],
  }),
});

const BIZ_EMAIL = "Aryan@tandem-ai.tech";
const PH_NUMBER = "+91 7359563504";

function Index() {
  const [assembled, setAssembled] = useState(false);
  const [automation, setAutomation] = useState("");

  const handleSendMail = () => {
    const subject = encodeURIComponent("Automation Request — Tandem AI Labs");
    const body = encodeURIComponent(
      automation.trim() ||
        "Hi Tandem AI Labs,\n\nI'd like to discuss automating the following workflow:\n\n",
    );
    window.location.href = `mailto:${BIZ_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* radial vignette (behind canvas) */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      {/* Fullscreen canvas — elevated so particles render crisply on top */}
      <div className="pointer-events-none fixed inset-0 z-[5]">
        <NeuralHexagon onAssembled={() => setAssembled(true)} />
      </div>

      {/* Header — fixed at top edge */}
      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-6 text-xs uppercase tracking-[0.3em] text-white/70 sm:px-10">
        <span>Tandem</span>
        <span className="hidden sm:inline">est. 2026</span>
      </header>

      {/* COMING SOON — mathematically centered on viewport (matches canvas center) */}
      <motion.h2
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: assembled ? 0.4 : 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`pointer-events-none fixed left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center text-xl font-light tracking-[0.4em] text-white sm:text-2xl ${assembled ? "" : "animate-breathe"}`}
      >
        COMING&nbsp;SOON
      </motion.h2>

      {/* Tandem AI Labs brand — above the hexagon, after assembly */}
      <div className="pointer-events-none fixed left-1/2 top-1/2 z-10 -translate-x-1/2 flex flex-col items-center" style={{ marginTop: "-340px" }}>
        <AnimatePresence>
          {assembled && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, scale: 0.6, filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <span className="block text-3xl font-bold tracking-tight text-white sm:text-5xl glow-text whitespace-nowrap">
                Tandem AI Labs
              </span>
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-3 block text-[10px] uppercase tracking-[0.4em] text-white/60 sm:text-xs whitespace-nowrap"
              >
                Intelligence · In Tandem
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-6 pb-10 pt-24 sm:px-10">
        {/* spacer reserves the hexagon's vertical area so the panel sits BELOW it */}
        <div className="flex-1" style={{ minHeight: "min(640px, 80vh)" }} />

        {/* Automation + Contact panel — below hexagon */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: assembled ? 1 : 0.3, y: assembled ? 0 : 20 }}
          transition={{ duration: 0.8, delay: assembled ? 0.4 : 0 }}
          className="mx-auto w-full max-w-3xl"
        >
          <div className="rounded-2xl border border-white/30 bg-black/70 p-5 backdrop-blur-md sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-[0.3em] text-white/70">
                Request Automation
              </h3>
              <span className="ml-4 h-px flex-1 bg-white/20" />
            </div>

            <label
              htmlFor="automation"
              className="mb-2 block text-sm font-medium text-white"
            >
              What do you want to automate?
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                id="automation"
                value={automation}
                onChange={(e) => setAutomation(e.target.value)}
                placeholder="Tell us about your manual workflows..."
                rows={3}
                className="flex-1 resize-none rounded-xl border border-white/30 bg-black px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-white focus:shadow-[0_0_20px_rgba(255,255,255,0.25)]"
              />
              <button
                type="button"
                onClick={handleSendMail}
                className="group flex items-center justify-center gap-2 self-stretch rounded-xl border border-white bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-all hover:bg-black hover:text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] sm:self-auto"
              >
                <Send className="h-4 w-4" />
                Send Mail
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={`tel:${PH_NUMBER.replace(/\s/g, "")}`}
                className="group flex items-center gap-3 rounded-xl border border-white/30 bg-black px-4 py-3 transition-all hover:border-white hover:shadow-[0_0_18px_rgba(255,255,255,0.35)]"
              >
                <Phone className="h-4 w-4 text-white" />
                <span className="text-sm font-light tracking-wide text-white group-hover:glow-text">
                  {PH_NUMBER}
                </span>
              </a>
              <a
                href={`mailto:${BIZ_EMAIL}`}
                className="group flex items-center gap-3 rounded-xl border border-white/30 bg-black px-4 py-3 transition-all hover:border-white hover:shadow-[0_0_18px_rgba(255,255,255,0.35)]"
              >
                <Mail className="h-4 w-4 text-white" />
                <span className="text-sm font-light tracking-wide text-white group-hover:glow-text">
                  {BIZ_EMAIL}
                </span>
              </a>
            </div>
          </div>
          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/50">
            © 2026 Tandem AI Labs · All Rights Reserved
          </p>
        </motion.section>
      </div>
    </main>
  );
}
