import { motion } from "framer-motion";
import { Instagram, Linkedin, Mail } from "lucide-react";

const links = [
  {
    label: "LinkedIn",
    ariaLabel: "LinkedIn profile",
    href: "https://www.linkedin.com/in/rajdeepdutta27/",
    icon: Linkedin,
    external: true,
  },
  {
    label: "Instagram",
    ariaLabel: "Instagram profile",
    href: "https://www.instagram.com/outlandish_dude_/",
    icon: Instagram,
    external: true,
  },
  {
    label: "Email",
    ariaLabel: "Email Rajdeep Dutta",
    href: "mailto:rajdeepdutta.rd2004@gmail.com",
    icon: Mail,
    external: false,
  },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-10 w-full max-w-[1560px] px-4 pb-8 md:px-6 xl:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-[28px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-primary)] px-5 py-4 shadow-[0_18px_42px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_42px_rgba(2,6,23,0.22)]"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[color:var(--text-primary)]">
              © 2026 VoltShare. All rights reserved.
            </div>
            <div className="text-sm text-[color:var(--text-secondary)]">
              Made by Rajdeep Dutta
            </div>
            <div className="text-xs text-[color:var(--text-muted)]">
              Simulation platform for EV energy trading.
            </div>
          </div>

          <div className="flex items-center gap-2 md:justify-end">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  aria-label={item.ariaLabel}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative"
                >
                  <span className="btn-icon h-11 w-11 rounded-full">
                    <Icon size={18} />
                  </span>
                  <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-strong)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--text-primary)] opacity-0 shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-opacity duration-200 group-hover:opacity-100">
                    {item.label}
                  </span>
                </motion.a>
              );
            })}
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
