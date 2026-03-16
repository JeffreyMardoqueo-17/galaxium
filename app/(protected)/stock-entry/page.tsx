"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  Boxes,
  Eye,
  Filter,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { showToast } from "@/components/ui/modales/Toast";

import { CreateStockEntryModal } from "@/components/features/stockEntry/StockEntryForm";
import { StockEntryDetailModal } from "@/components/features/stockEntry/StockEntryVerMas";

import { createStockEntry, getStockEntries } from "@/services/stock-entry.service";
import { getAllProducts } from "@/services/product.service";

import { isUnauthorizedError } from "@/utils/getAddHeaders";
import { formatDate } from "@/utils/formatDate";

import type { ProductResponse } from "@/types/product";
import type { StockEntryCreate, StockEntryResponse } from "@/types/StockEntry";

type ComboboxOption = {
  id: string;
  label: string;
};

function getReferenceTypeLabel(type: string): string {
  switch (type) {
    case "Purchase":
      return "Compra";
    case "Sale":
      return "Venta";
    case "Adjustment":
      return "Ajuste";
    case "Return":
      return "Devolución";
    default:
      return type || "Desconocido";
  }
}

function getReferenceTypeTone(type: string): string {
  switch (type) {
    case "Purchase":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Sale":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "Adjustment":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Return":
      return "bg-sky-100 text-sky-700 border-sky-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

const money = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export default function StockEntryPage() {
  const router = useRouter();

  const [stockEntries, setStockEntries] = React.useState<StockEntryResponse[]>([]);
  const [products, setProducts] = React.useState<ProductResponse[]>([]);

  const [loadingStockEntries, setLoadingStockEntries] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedEntry, setSelectedEntry] = React.useState<StockEntryResponse | null>(null);

  const [search, setSearch] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("");

  const loadStockEntries = React.useCallback(async () => {
    setLoadingStockEntries(true);
    try {
      const data = await getStockEntries();
      setStockEntries(data || []);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        showToast({
          title: "Sesion expirada",
          description: "Inicia sesion nuevamente.",
          color: "danger",
        });
        router.replace("/login");
        return;
      }

      const message = error instanceof Error ? error.message : "No se pudieron cargar las entradas de stock";
      showToast({
        title: "Error al cargar",
        description: message,
        color: "danger",
      });
    } finally {
      setLoadingStockEntries(false);
    }
  }, [router]);

  const loadProducts = React.useCallback(async () => {
    try {
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        showToast({
          title: "Sesion expirada",
          description: "Inicia sesion nuevamente.",
          color: "danger",
        });
        router.replace("/login");
        return;
      }

      const message = error instanceof Error ? error.message : "No se pudieron cargar los productos";
      showToast({
        title: "Error al cargar",
        description: message,
        color: "danger",
      });
    }
  }, [router]);

  React.useEffect(() => {
    void loadProducts();
    void loadStockEntries();
  }, [loadProducts, loadStockEntries]);

  async function handleStockEntryCreate(stockEntry: StockEntryCreate) {
    try {
      await createStockEntry(stockEntry);

      showToast({
        title: "Entrada registrada",
        description: "La entrada fue creada correctamente",
        color: "success",
      });

      setModalOpen(false);
      await loadStockEntries();
      await loadProducts();
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        showToast({
          title: "Sesion expirada",
          description: "Inicia sesion nuevamente.",
          color: "danger",
        });
        router.replace("/login");
        return;
      }

      const message = error instanceof Error ? error.message : "No se pudo registrar la entrada";

      showToast({
        title: "Movimiento rechazado",
        description: message,
        color: "danger",
      });

      throw error;
    }
  }

  const typeOptions: ComboboxOption[] = [
    { id: "", label: "Todos los movimientos" },
    { id: "Purchase", label: "Compras" },
    { id: "Sale", label: "Ventas" },
    { id: "Adjustment", label: "Ajustes" },
    { id: "Return", label: "Devoluciones" },
  ];

  const selectedTypeOption =
    typeOptions.find((option) => option.id === selectedType) ?? typeOptions[0] ?? null;

  const filteredEntries = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return stockEntries.filter((entry) => {
      const byType = selectedType ? entry.referenceType === selectedType : true;
      const bySearch =
        term.length === 0 ||
        [entry.productName, entry.userName, getReferenceTypeLabel(entry.referenceType)]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return byType && bySearch;
    });
  }, [search, selectedType, stockEntries]);

  const purchaseCount = stockEntries.filter((entry) => entry.referenceType === "Purchase").length;
  const saleCount = stockEntries.filter((entry) => entry.referenceType === "Sale").length;

  return (
    <div className="min-h-full bg-background px-4 py-5 md:px-6 xl:px-8 2xl:px-10">
      <div className="w-full space-y-6">
        <section className="rounded-[26px] border border-border bg-card px-5 py-6 shadow-xs md:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-end">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Movimientos de stock
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Entradas de stock</h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                Controla compras, ventas y ajustes del inventario con una vista profesional y trazabilidad completa.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Movimientos</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{stockEntries.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Compras</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{purchaseCount}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Ventas</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{saleCount}</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Filtros y acciones
            </CardTitle>
            <CardDescription>Herramientas rápidas para consultar y registrar movimientos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por producto, usuario o tipo"
                  className="pl-9"
                />
              </div>

              <Combobox
                items={typeOptions}
                value={selectedTypeOption}
                onValueChange={(option: ComboboxOption | null) => setSelectedType(option?.id ?? "")}
                itemToStringLabel={(option) => option?.label ?? ""}
                itemToStringValue={(option) => option?.id ?? ""}
              >
                <ComboboxInput placeholder="Tipo de movimiento" showClear />
                <ComboboxContent className="z-50">
                  <ComboboxEmpty>Sin resultados</ComboboxEmpty>
                  <ComboboxList>
                    {(option: ComboboxOption) => <ComboboxItem key={option.id || "all"} value={option}>{option.label}</ComboboxItem>}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setSearch(""); setSelectedType(""); }}>
                  Limpiar
                </Button>
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Nueva entrada
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Boxes className="h-4 w-4 text-muted-foreground" />
              Registro de movimientos
            </CardTitle>
            <CardDescription>
              Historial operativo de stock con costo unitario, total y responsable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStockEntries ? (
              <div className="py-8 text-sm text-muted-foreground">Cargando entradas de stock...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Costo unitario</TableHead>
                    <TableHead>Costo total</TableHead>
                    <TableHead>Registrado por</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        No hay movimientos para los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => {
                      const isPurchase = entry.referenceType === "Purchase";
                      const isSale = entry.referenceType === "Sale";

                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.productName}</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${getReferenceTypeTone(entry.referenceType)}`}>
                              {getReferenceTypeLabel(entry.referenceType)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={isPurchase ? "inline-flex items-center gap-1 text-emerald-600" : isSale ? "inline-flex items-center gap-1 text-rose-600" : "inline-flex items-center gap-1 text-amber-600"}>
                              {isPurchase ? <TrendingUp className="h-4 w-4" /> : isSale ? <TrendingDown className="h-4 w-4" /> : <ArrowRightLeft className="h-4 w-4" />}
                              {entry.quantity}
                            </span>
                          </TableCell>
                          <TableCell>{money.format(entry.unitCost)}</TableCell>
                          <TableCell className="font-semibold">{money.format(entry.totalCost)}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                              <UserRound className="h-3.5 w-3.5" />
                              {entry.userName}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(entry.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedEntry(entry);
                                setDetailModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {modalOpen ? (
          <CreateStockEntryModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            products={products}
            onStockEntryCreate={handleStockEntryCreate}
          />
        ) : null}

        {detailModalOpen ? (
          <StockEntryDetailModal
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
            stockEntry={selectedEntry}
          />
        ) : null}
      </div>
    </div>
  );
}
