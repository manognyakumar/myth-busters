import { DISCLAIMER } from "@/lib/site";
import { Icon } from "./Icon";

/** Figma Medical Disclaimer (6:266). */
export function MedicalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <aside className={`flex items-start gap-4 rounded-ui bg-lavender p-5 text-ink ${className}`} aria-label="Medical disclaimer">
      <Icon name="shield" className="mt-0.5 text-plum" />
      <p className="flex-1 text-body">{DISCLAIMER}</p>
    </aside>
  );
}
