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
  Truck,
  FileText,
  Bell,
} from "lucide-react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  allowedRoles?: string[];
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    allowedRoles: ["Administrador", "Supervisor"],
  },
  {
    label: "Ventas",
    href: "/sale",
    icon: ShoppingBag,
    allowedRoles: ["Administrador", "Supervisor", "Cajero"],
  },
  {
    label: "Historial de Ventas",
    href: "/sale/history",
    icon: History,
    allowedRoles: ["Administrador", "Supervisor"],
  },
  {
    label: "Productos",
    href: "/product",
    icon: Package,
    allowedRoles: ["Administrador", "Supervisor", "Encargado de inventario"],
  },
  
  {
    label: "Proveedores",
    href: "/supplier",
    icon: Truck,
    allowedRoles: ["Administrador", "Supervisor", "Encargado de inventario"],
  },
  {
    label: "Compras",
    href: "/purchase",
    icon: Truck,
    allowedRoles: ["Administrador", "Supervisor", "Encargado de inventario"],
  },
  {
    label: "Reportes",
    href: "/reports",
    icon: FileText,
    allowedRoles: ["Administrador", "Supervisor"],
  },
  {
    label: "Alertas",
    href: "/alerts",
    icon: Bell,
    allowedRoles: ["Administrador", "Supervisor"],
  },
  {
    label: "Categorías",
    href: "/category",
    icon: LayoutGrid,
    allowedRoles: ["Administrador", "Supervisor", "Encargado de inventario"],
  },
  {
    label: "Clientes",
    href: "/customer",
    icon: UserCheck,
    allowedRoles: ["Administrador", "Supervisor", "Cajero"],
  },
  {
    label: "Usuarios",
    href: "/users",
    icon: UserCog,
    allowedRoles: ["Administrador"],
  },
];

