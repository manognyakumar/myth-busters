"use client";

import Link from "next/link";
import { useState } from "react";
import { CLUB_FORM } from "@/lib/site";
import { Icon } from "./Icon";
import { NAV } from "@/lib/nav";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="flex size-12 items-center justify-center rounded-ui lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name={open ? "x" : "menu"} />
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="absolute inset-x-0 top-full z-20 border-b border-warm-gray bg-white px-4 pb-4 lg:hidden"
        >
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center text-label font-semibold">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={CLUB_FORM} target="_blank" rel="noopener" className="flex min-h-12 items-center text-label font-semibold text-magenta">
                Join our club
              </a>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
