// config/sidebar.ts
import {
  LayoutDashboard,
  UserCheck,
  ShoppingBag,
  History,
  Package,
  PackagePlus,
  LayoutGrid,
  UserCog,
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
    label: "Ventas",
    href: "/sale",
    icon: ShoppingBag,
  },
  {
    label: "Historial de Ventas",
    href: "/sale/history",
    icon: History,
  },
  {
    label: "Productos",
    href: "/product",
    icon: Package,
  },
  {
    label: "Entradas de Stock",
    href: "/stock-entry",
    icon: PackagePlus,
  },
  {
    label: "Categorías",
    href: "/category",
    icon: LayoutGrid,
  },
  {
    label: "Clientes",
    href: "/customer",
    icon: UserCheck,
  },
  {
    label: "Usuarios",
    href: "/users",
    icon: UserCog,
  },
];

