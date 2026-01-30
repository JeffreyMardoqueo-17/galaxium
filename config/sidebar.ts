// config/sidebar.ts
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Tags,
} from "lucide-react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Usuarios",
    href: "/users",
    icon: Users,
  },
  {
    label: "Ventas",
    href: "/ventas",
    icon: ShoppingCart,
  },
  {
    label: "Categorías",
    href: "/category",
    icon: Tags,
  },
];
