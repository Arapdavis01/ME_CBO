"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Leaf,
  Users,
  Package,
  AlertTriangle,
  Repeat,
  BookOpen,
  Wallet,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/auth/permissions";
import { siteConfig } from "@/config/site";

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
};

const items: Item[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/events", icon: CalendarDays, permission: "events:read" },
  { label: "Impact", href: "/impact", icon: Leaf, permission: "impact:read" },
  { label: "Members", href: "/members", icon: Users, permission: "members:read" },
  { label: "Inventory", href: "/inventory", icon: Package, permission: "inventory:read" },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle, permission: "incidents:read" },
  { label: "Swap shop", href: "/swap-shop", icon: Repeat, permission: "swap:read" },
  { label: "Learning", href: "/learning", icon: BookOpen,
