"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onRefresh?: () => void;
};

export function DashboardRefreshButton({ onRefresh }: Props = {}) {
  const router = useRouter();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh}>
      <RefreshCw className="h-4 w-4" />
      Actualizar
    </Button>
  );
}
