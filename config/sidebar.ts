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
    label: "Clientes",
    href: "/customer",
    icon: Users,
  },
  {
    label: "Ventas",
    href: "/sale",
    icon: ShoppingCart,
  },
  {
    label: "Entradas de Stock",
    href: "/stock-entry",
    icon: ShoppingCart,
  },
  {
    label: "Categorías",
    href: "/category",
    icon: Tags,
  },
  {
    label: "Productos",
    href: "/product",
    icon: ShoppingCart,
  }
];
