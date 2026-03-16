"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Store, ChevronRight } from "lucide-react";

import { SIDEBAR_ITEMS } from "@/config/sidebar";
import { UserResponse } from "@/types/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type AppSidebarProps = {
  user: UserResponse | null;
  onLogout: () => void;
};

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "G";

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ── CABECERA / LOGO ── */}
      <SidebarHeader className="border-b border-sidebar-border pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Galaxium POS" size="lg">
              <Link href="/" prefetch={false} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-900/35">
                  <Store className="h-5 w-5" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-sm tracking-wide text-sidebar-foreground">
                    Galaxium
                  </span>
                  <span className="text-[11px] text-sidebar-foreground/50 font-medium uppercase tracking-widest">
                    Sistema POS
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── NAVEGACIÓN ── */}
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] font-bold uppercase tracking-widest px-3 mb-1">
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className="rounded-xl h-10 px-3"
                    >
                      <Link href={item.href} prefetch={false} className="flex items-center gap-3 group">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
                            isActive
                              ? "bg-sky-500 text-white shadow-sm shadow-sky-900/35"
                              : "bg-sidebar-foreground/10 text-sidebar-foreground/60 group-hover:bg-sidebar-foreground/18 group-hover:text-sidebar-foreground/90"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className={`font-medium text-sm transition-colors duration-150 ${
                            isActive
                              ? "text-sidebar-foreground"
                              : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground/90"
                          }`}
                        >
                          {item.label}
                        </span>
                        {isActive && (
                          <ChevronRight className="ml-auto h-3.5 w-3.5 text-sky-300/70" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── FOOTER / USUARIO ── */}
      <SidebarFooter className="border-t border-sidebar-border pt-3 space-y-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="cursor-default h-auto py-2 px-3 hover:bg-transparent rounded-xl"
              tooltip={user?.username ?? "Usuario"}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
                {initials}
              </div>
              <div className="flex flex-col leading-tight min-w-0 ml-1">
                <span className="font-semibold text-sm text-sidebar-foreground truncate">
                  {user?.username ?? "Invitado"}
                </span>
                <span className="text-[11px] text-sidebar-foreground/45">
                  {(user as { roleName?: string })?.roleName ?? "Sistema"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              tooltip="Cerrar sesión"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl px-3 transition-colors duration-150"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium text-sm">Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
