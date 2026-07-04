import React from "react";
import {
  Mail, Utensils, Phone, Pill, Footprints, Droplets, Accessibility, Heart,
  Users, CalendarDays, Bed, LifeBuoy, FileText, Bandage, AlertCircle, Wind,
  Banknote, Brain, HandHeart, type LucideIcon,
} from "lucide-react";
import type { ArtKey } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

const ICONS: Record<ArtKey, LucideIcon> = {
  mail: Mail,
  meal: Utensils,
  phone: Phone,
  medication: Pill,
  fall: Footprints,
  hygiene: Droplets,
  mobility: Accessibility,
  heart: Heart,
  family: Users,
  calendar: CalendarDays,
  bed: Bed,
  support: LifeBuoy,
  document: FileText,
  wound: Bandage,
  alert: AlertCircle,
  breathing: Wind,
  money: Banknote,
  memory: Brain,
  lifting: HandHeart,
};

// A relatable, gently animated illustration for a scenario.
export function ScenarioArt({ art, size = "md", className }: { art: ArtKey; size?: "sm" | "md"; className?: string }) {
  const Icon = ICONS[art] ?? Heart;
  const box = size === "sm" ? "w-10 h-10" : "w-14 h-14";
  const ic = size === "sm" ? "w-5 h-5" : "w-7 h-7";
  return (
    <span className={cn("relative inline-flex items-center justify-center rounded-full bg-primary/10 text-primary shrink-0", box, className)}>
      <span className="absolute inset-0 rounded-full bg-primary/20 hg-art-pulse" aria-hidden />
      <Icon className={cn(ic, "relative hg-art-float")} strokeWidth={1.75} aria-hidden />
    </span>
  );
}
