import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  FileText,
  FolderKanban,
  Image,
  LayoutDashboard,
  Mail,
  User,
  Wrench,
} from "lucide-react";

export type NavStatus = "ready" | "soon";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  status: NavStatus;
};

// Single source of truth for the admin sidebar. Flip `status` to "ready" and
// build the page when a future feature ships — no shell rework needed.
export const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, status: "ready" },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban, status: "ready" },
  { label: "Contacts", href: "/admin/contacts", icon: Mail, status: "ready" },
  { label: "Posts", href: "/admin/posts", icon: FileText, status: "soon" },
  { label: "Skills", href: "/admin/skills", icon: Wrench, status: "soon" },
  { label: "About", href: "/admin/about", icon: User, status: "soon" },
  { label: "Media", href: "/admin/media", icon: Image, status: "soon" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, status: "soon" },
];
