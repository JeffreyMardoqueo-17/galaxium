"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Boxes, PackagePlus, ReceiptText, RefreshCcw, Search, ShoppingCart, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showToast } from "@/components/ui/modales/Toast";
import { createPurchase, getPurchases } from "@/services/purchase.service";
import { getAllProducts } from "@/services/product.service";
import { getSuppliers } from "@/services/supplier.service";
import { PurchaseResponse } from "@/types/purchase";
import { ProductResponse } from "@/types/product";
import { SupplierResponse } from "@/types/supplier";
import { formatDate } from "@/utils/formatDate";
import { isUnauthorizedError } from "@/utils/getAddHeaders";

type ComboboxOption = { id: string; label: string };

const money = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getPurchaseTone(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
    case "completada":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
    case "pendiente":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export default function PurchasePage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = React.useState<SupplierResponse[]>([]);
  const [products, setProducts] = React.useState<ProductResponse[]>([]);
  const [purchases, setPurchases] = React.useState<PurchaseResponse[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  const [supplierId, setSupplierId] = React.useState<number>(0);
  const [productId, setProductId] = React.useState<number>(0);
  const [quantity, setQuantity] = React.useState<number>(1);
  const [unitPrice, setUnitPrice] = React.useState<number>(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [supplierResult, productResult, purchaseResult] = await Promise.all([
        getSuppliers(),
        getAllProducts(),
        getPurchases(),
      ]);

      setSuppliers(supplierResult);
      setProducts(productResult);
      setPurchases(purchaseResult);

      if (!supplierId && supplierResult.length > 0) {
        setSupplierId(supplierResult[0].id);
      }

      if (!productId && productResult.length > 0) {
        setProductId(productResult[0].id);
      }
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        showToast({
          title: "Sesion expirada",
          description: "Inicia sesion nuevamente para continuar.",
          color: "danger",
        });
        router.replace("/login");
        return;
      }

      setError(getErrorMessage(error, "No se pudieron cargar compras, productos o proveedores"));
    } finally {
      setLoading(false);
    }
  }, [productId, router, supplierId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleCreatePurchase() {
    if (!supplierId || !productId || quantity <= 0 || unitPrice <= 0) {
      showToast({
        title: "Datos incompletos",
        description: "Selecciona proveedor, producto y valores validos antes de registrar.",
        color: "warning",
      });
      return;
    }

    setSaving(true);

    try {
      await createPurchase({
        supplierId,
        details: [{ productId, quantity, unitPrice }],
      });

      showToast({
        title: "Compra registrada",
        description: "La compra fue registrada y el stock se actualizo automaticamente.",
        color: "success",
      });

      setQuantity(1);
      setUnitPrice(0);
      await load();
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        showToast({
          title: "Sesion expirada",
          description: "Inicia sesion nuevamente para continuar.",
          color: "danger",
        });
        router.replace("/login");
        return;
      }

      showToast({
        title: "No se pudo registrar la compra",
        description: getErrorMessage(error, "Operacion rechazada por el servidor."),
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  const supplierOptions = React.useMemo<ComboboxOption[]>(() => {
    return suppliers.map((supplier) => ({ id: String(supplier.id), label: supplier.name }));
  }, [suppliers]);

  const productOptions = React.useMemo<ComboboxOption[]>(() => {
    return products.map((product) => ({ id: String(product.id), label: `${product.name} · ${product.sku}` }));
  }, [products]);

  const selectedSupplier = React.useMemo(() => {
    return supplierOptions.find((option) => option.id === String(supplierId)) ?? null;
  }, [supplierId, supplierOptions]);

  const selectedProduct = React.useMemo(() => {
    return products.find((product) => product.id === productId) ?? null;
  }, [productId, products]);

  const selectedProductOption = React.useMemo(() => {
    return productOptions.find((option) => option.id === String(productId)) ?? null;
  }, [productId, productOptions]);

  const filteredPurchases = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return purchases.filter((purchase) => {
      if (!term) {
        return true;
      }

      return [purchase.supplierName, purchase.status, String(purchase.id)]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [purchases, search]);

  const totalSpent = React.useMemo(
    () => purchases.reduce((sum, purchase) => sum + purchase.total, 0),
    [purchases]
  );
  const averageTicket = purchases.length ? totalSpent / purchases.length : 0;
  const estimatedSubtotal = quantity > 0 && unitPrice > 0 ? quantity * unitPrice : 0;

  return (
    <div className="min-h-full bg-background px-4 py-5 md:px-6 xl:px-8 2xl:px-10">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-border bg-card px-5 py-6 shadow-xs md:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-end">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <ShoppingCart className="h-3.5 w-3.5" />
                Abastecimiento y costo
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Compras</h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                Registra ingresos de inventario con proveedor, producto y costo unitario desde una sola vista.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Compras</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{purchases.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Invertido</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{money.format(totalSpent)}</p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Ticket promedio</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{money.format(averageTicket)}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <PackagePlus className="h-4 w-4 text-muted-foreground" />
                Registrar compra
              </CardTitle>
              <CardDescription>Selecciona proveedor y producto. El sistema actualiza inventario al confirmar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Proveedor</label>
                <Combobox
                  items={supplierOptions}
                  value={selectedSupplier}
                  onValueChange={(option: ComboboxOption | null) => setSupplierId(Number(option?.id ?? 0))}
                  itemToStringLabel={(option) => option?.label ?? ""}
                  itemToStringValue={(option) => option?.id ?? ""}
                >
                  <ComboboxInput placeholder="Selecciona un proveedor" />
                  <ComboboxContent className="z-50">
                    <ComboboxEmpty>Sin resultados</ComboboxEmpty>
                    <ComboboxList>
                      {(option: ComboboxOption) => (
                        <ComboboxItem key={option.id} value={option}>
                          {option.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Producto</label>
                <Combobox
                  items={productOptions}
                  value={selectedProductOption}
                  onValueChange={(option: ComboboxOption | null) => setProductId(Number(option?.id ?? 0))}
                  itemToStringLabel={(option) => option?.label ?? ""}
                  itemToStringValue={(option) => option?.id ?? ""}
                >
                  <ComboboxInput placeholder="Selecciona un producto" />
                  <ComboboxContent className="z-50">
                    <ComboboxEmpty>Sin resultados</ComboboxEmpty>
                    <ComboboxList>
                      {(option: ComboboxOption) => (
                        <ComboboxItem key={option.id} value={option}>
                          {option.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Cantidad</label>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Costo unitario</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={unitPrice}
                    onChange={(event) => setUnitPrice(Number(event.target.value))}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Resumen rapido</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center justify-between gap-4">
                    <span>Producto</span>
                    <span className="text-right font-medium text-foreground">{selectedProduct?.name ?? "Sin seleccionar"}</span>
                  </p>
                  <p className="flex items-center justify-between gap-4">
                    <span>Stock actual</span>
                    <span className="font-medium text-foreground">{selectedProduct?.stock ?? 0}</span>
                  </p>
                  <p className="flex items-center justify-between gap-4">
                    <span>Subtotal estimado</span>
                    <span className="font-semibold text-foreground">{money.format(estimatedSubtotal)}</span>
                  </p>
                </div>
              </div>

              <Button className="w-full" disabled={saving} onClick={() => void handleCreatePurchase()}>
                {saving ? "Registrando..." : "Registrar compra"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ReceiptText className="h-4 w-4 text-muted-foreground" />
                Historial de compras
              </CardTitle>
              <CardDescription>Consulta el flujo de compras registradas y su impacto economico.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar por proveedor, estado o numero"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <Button variant="outline" onClick={() => void load()} disabled={loading}>
                  <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Recargar
                </Button>
              </div>

              {error ? (
                <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Compra</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">#{purchase.id}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(purchase.purchaseDate)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{purchase.supplierName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Boxes className="h-4 w-4" />
                          {purchase.details.length} linea{purchase.details.length === 1 ? "" : "s"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{money.format(purchase.total)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getPurchaseTone(purchase.status)}`}>
                            {purchase.status}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!loading && filteredPurchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No hay compras que coincidan con la busqueda actual.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-xs">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              Inversion total
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">{money.format(totalSpent)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-xs">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <ShoppingCart className="h-3.5 w-3.5" />
              Proveedores activos
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">{suppliers.filter((supplier) => supplier.isActive).length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-xs">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <PackagePlus className="h-3.5 w-3.5" />
              Productos disponibles
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">{products.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
