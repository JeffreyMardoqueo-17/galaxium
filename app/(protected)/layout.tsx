"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { logout, refreshSession } from "@/services/auth.service";
import { getCurrentUser, UNAUTHORIZED_USER_ERROR } from "@/services/user.service";
import { UserResponse } from "@/types/user";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const hasRefreshedAfterSessionRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        if (!isActive) return;
        setUser(currentUser);
      } catch (error) {
        if (!isActive) return;

        const isUnauthorized = error instanceof Error && error.message === UNAUTHORIZED_USER_ERROR;

        if (isUnauthorized) {
          try {
            await refreshSession();
            const currentUser = await getCurrentUser();
            if (!isActive) return;
            setUser(currentUser);
            if (!hasRefreshedAfterSessionRef.current) {
              hasRefreshedAfterSessionRef.current = true;
              router.refresh();
            }
            return;
          } catch {
            await logout().catch(() => null);
            setUser(null);
            router.replace("/login");
            return;
          }
        }

        // Mantenemos el usuario actual y evitamos expulsar por fallos transitorios de red.
        console.error("No se pudo validar la sesión en este intento", error);
      } finally {
        if (isActive) {
          setIsSessionReady(true);
        }
      }
    }

    loadUser();

    return () => {
      isActive = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await logout().catch(() => null);
    setUser(null);
    router.replace("/login");
    router.refresh();
  };

  return (
    <>
      <Toaster />
      <TooltipProvider delayDuration={150}>
        <SidebarProvider>
          <AppSidebar user={user} onLogout={handleLogout} />
          <SidebarInset className="">
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4 md:px-6 shadow-sm">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1" />
                <div className="hidden sm:flex items-center gap-2">
                  <div className="h-5 w-px bg-border" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {user ? `Hola, ${user.username} 👋` : "Panel"}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Cambiar tema"
              >
                <Sun className="hidden h-4 w-4 dark:block" />
                <Moon className="h-4 w-4 dark:hidden" />
              </Button>
            </header>

            <main className="flex min-h-0 flex-col grow overflow-auto p-2">
              <div className="h-full w-full rounded-2xl bg-(--color-page) shadow-card">
                {isSessionReady ? (
                  children
                ) : (
                  <div className="flex h-full min-h-55 items-center justify-center p-4">
                    <div className="text-sm text-muted-foreground">Validando sesión...</div>
                  </div>
                )}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </>
  );
}
