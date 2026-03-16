import { AlertTriangle } from "lucide-react";
import SalePageClient from "@/components/features/sale/SalePageClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSalePageDataSafe } from "@/services/sale.server";

export default async function SalePage() {
  const { data, error } = await getSalePageDataSafe();

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Error al cargar ventas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {error === "UNAUTHORIZED"
              ? "Tu sesión no está lista todavía. Recarga la página en 2 segundos o vuelve a iniciar sesión si persiste."
              : error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SalePageClient
      initialProducts={data.products}
      initialCustomers={data.customers}
      initialPaymentMethods={data.paymentMethods}
      initialCategories={data.categories}
    />
  );
}
