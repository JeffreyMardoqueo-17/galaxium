"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroUIProvider } from "@heroui/react";

import SidebarMenu from "./Layout/SidebarMenu";
import AppNavBar from "./Layout/NavBar";

import { logout } from "@/services/auth.service";
import { getCurrentUser } from "@/services/user.service";
import { UserResponse } from "@/types/user";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:5213/api/User/logout", {
      method: "POST",
      credentials: "include",
    });

    logout();
    router.push("/login");
  };

  return (
    <HeroUIProvider>
      <div className="flex h-screen bg-[var(--color-body)] overflow-hidden">
        
        {/* SIDEBAR */}
        <SidebarMenu
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* MAIN */}
        <div className="flex flex-col grow">
          {/* HEROUI NAVBAR */}
          <AppNavBar
            user={user}
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
          />

          {/* CONTENT */}
          <main className="flex flex-col grow p-1 overflow-auto">
            <div className="bg-[var(--color-page)] rounded-2xl shadow-card">
              {children}
            </div>
          </main>
        </div>
      </div>
    </HeroUIProvider>
  );
}
