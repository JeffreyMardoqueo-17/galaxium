"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Boxes,
  DollarSign,
  Eye,
  Filter,
  ImageIcon,
  LayoutGrid,
  LoaderCircle,
  Pencil,
  Plus,
  ScanLine,
  Table2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

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

import { CreateProductModal } from "@/components/features/products/ProductForm";
import { PriceFormModal } from "@/components/features/products/PriceForm";
import { ProductDetailModal } from "@/components/features/products/ProductVerMas";

import { getCategories } from "@/services/category.service";
import { createProduct, getProductsByFilter, getProductsWithPhotos, updateProductPrice } from "@/services/product.service";

import type { CategoryRead } from "@/types/category";
import type { ProductPhoto } from "@/types/product-photo";
import type {
  ProductCreateRequest,
  ProductFilterRequest,
  ProductResponse,
} from "@/types/product";

type ComboboxOption = {
  id: string;
  label: string;
};

const money = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function getStockTone(product: ProductResponse): string {
  const stock = product.stock ?? 0;

  if (stock <= 0) {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }

  if (stock <= product.minimumStock) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function getPrimaryPhotoUrl(photos: ProductPhoto[] | undefined): string | null {
  const primaryPhoto = photos?.find((photo) => photo.isPrimary) ?? photos?.[0];
  return primaryPhoto?.photoUrl?.trim() || null;
}

type LazyProductImageProps = {
  productName: string;
  photos?: ProductPhoto[];
  isLoading: boolean;
};

function LazyProductImage({
  productName,
  photos,
  isLoading,
}: LazyProductImageProps) {
  const primaryPhotoUrl = getPrimaryPhotoUrl(photos);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted/40">
      {primaryPhotoUrl ? (
        <img
          src={primaryPhotoUrl}
          alt={productName}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : isLoading ? (
        <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Cargando foto...
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <span className="text-sm">Sin foto</span>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();

  const [viewMode, setViewMode] = React.useState<"table" | "cards">("table");
  const [products, setProducts] = React.useState<ProductResponse[]>([]);
  const [categories, setCategories] = React.useState<CategoryRead[]>([]);
  const [cardPhotos, setCardPhotos] = React.useState<Record<number, ProductPhoto[]>>({});
  const [loadingCardPhotos, setLoadingCardPhotos] = React.useState(false);
  const [hasLoadedCardPhotos, setHasLoadedCardPhotos] = React.useState(false);

  const [loadingProducts, setLoadingProducts] = React.useState(false);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [priceModalOpen, setPriceModalOpen] = React.useState(false);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<ProductResponse | null>(null);

  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);

  const [filters, setFilters] = React.useState<ProductFilterRequest>({
    page: 1,
    pageSize: 20,
  });

  const [debouncedFilters, setDebouncedFilters] = React.useState<ProductFilterRequest>(filters);

  React.useEffect(() => {
    void (async () => {
      try {
        const response = await getCategories();
        setCategories(response || []);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar las categorías");
      }
    })();
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedFilters(filters), 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  React.useEffect(() => {
    void loadProducts(debouncedFilters);
  }, [debouncedFilters]);

  React.useEffect(() => {
    if (viewMode !== "cards" || products.length === 0 || hasLoadedCardPhotos || loadingCardPhotos) {
      return;
    }

    void loadCardPhotos();
  }, [hasLoadedCardPhotos, loadingCardPhotos, products.length, viewMode]);

  async function loadProducts(filter: ProductFilterRequest) {
    setLoadingProducts(true);
    try {
      const response = await getProductsByFilter(filter);
      setProducts(response || []);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar los productos");
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleProductCreate(product: ProductCreateRequest) {
    try {
      const created = await createProduct(product);
      setHasLoadedCardPhotos(false);
      setCardPhotos({});
      await loadProducts(debouncedFilters);
      return created?.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function handlePriceUpdate(productId: number, salePrice: number) {
    const updatedProduct = await updateProductPrice({
      productId,
      newPrice: salePrice,
    });

    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, ...updatedProduct } : product,
      ),
    );
  }

  async function loadCardPhotos() {
    setLoadingCardPhotos(true);

    try {
      const response = await getProductsWithPhotos();
      const nextPhotos = response.reduce<Record<number, ProductPhoto[]>>((acc, product) => {
        acc[product.id] = product.photos ?? [];
        return acc;
      }, {});

      setCardPhotos(nextPhotos);
      setHasLoadedCardPhotos(true);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las fotos de los productos");
    } finally {
      setLoadingCardPhotos(false);
    }
  }

  const categoryOptions = React.useMemo<ComboboxOption[]>(
    () => [
      { id: "", label: "Todas las categorías" },
      ...categories.map((category) => ({
        id: String(category.id),
        label: category.name,
      })),
    ],
    [categories],
  );

  const stateOptions: ComboboxOption[] = [
    { id: "", label: "Todos los estados" },
    { id: "true", label: "Solo activos" },
    { id: "false", label: "Solo inactivos" },
  ];

  const orderByOptions: ComboboxOption[] = [
    { id: "", label: "Sin orden específico" },
    { id: "Name", label: "Nombre" },
    { id: "SalePrice", label: "Precio" },
    { id: "Stock", label: "Stock" },
  ];

  const orderDirectionOptions: ComboboxOption[] = [
    { id: "", label: "Orden por defecto" },
    { id: "false", label: "Ascendente" },
    { id: "true", label: "Descendente" },
  ];

  const selectedCategory =
    categoryOptions.find((option) => option.id === String(filters.categoryId ?? "")) ??
    categoryOptions[0] ??
    null;

  const selectedState =
    stateOptions.find((option) => option.id === String(filters.isActive ?? "")) ??
    stateOptions[0] ??
    null;

  const selectedOrderBy =
    orderByOptions.find((option) => option.id === String(filters.orderBy ?? "")) ??
    orderByOptions[0] ??
    null;

  const selectedOrderDirection =
    orderDirectionOptions.find((option) => option.id === String(filters.orderDescending ?? "")) ??
    orderDirectionOptions[0] ??
    null;

  const activeCount = products.filter((product) => product.isActive).length;

  return (
    <div className="min-h-full bg-background px-4 py-5 md:px-6 xl:px-8 2xl:px-10">
      <div className="w-full space-y-6">
        <section className="rounded-[26px] border border-border bg-card px-5 py-6 shadow-xs md:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-end">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <Boxes className="h-3.5 w-3.5" />
                Inventario de productos
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Catálogo de productos</h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                Gestiona existencias, precios y estados de forma clara, con filtros operativos y acciones consistentes.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Resultados</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{products.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Activos</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{activeCount}</p>
              </div>
              <div className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Vista</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{viewMode === "table" ? "Tabla" : "Cards"}</p>
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
            <CardDescription>Controles del catálogo con diseño unificado para cualquier tema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Input
                placeholder="Buscar por nombre"
                value={filters.name ?? ""}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    name: event.target.value || undefined,
                    page: 1,
                  }))
                }
              />

              <Combobox
                items={categoryOptions}
                value={selectedCategory}
                onValueChange={(option: ComboboxOption | null) =>
                  setFilters((prev) => ({
                    ...prev,
                    categoryId: option?.id ? Number(option.id) : undefined,
                    page: 1,
                  }))
                }
                itemToStringLabel={(option) => option?.label ?? ""}
                itemToStringValue={(option) => option?.id ?? ""}
              >
                <ComboboxInput placeholder="Categoría" showClear />
                <ComboboxContent className="z-50">
                  <ComboboxEmpty>Sin resultados</ComboboxEmpty>
                  <ComboboxList>
                    {(option: ComboboxOption) => <ComboboxItem key={option.id || "all"} value={option}>{option.label}</ComboboxItem>}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <Input
                type="number"
                placeholder="Stock mínimo"
                value={filters.minStock ?? ""}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    minStock: event.target.value ? Number(event.target.value) : undefined,
                    page: 1,
                  }))
                }
              />

              <Combobox
                items={stateOptions}
                value={selectedState}
                onValueChange={(option: ComboboxOption | null) =>
                  setFilters((prev) => ({
                    ...prev,
                    isActive: option?.id === "" ? undefined : option?.id === "true",
                    page: 1,
                  }))
                }
                itemToStringLabel={(option) => option?.label ?? ""}
                itemToStringValue={(option) => option?.id ?? ""}
              >
                <ComboboxInput placeholder="Estado" showClear />
                <ComboboxContent className="z-50">
                  <ComboboxEmpty>Sin resultados</ComboboxEmpty>
                  <ComboboxList>
                    {(option: ComboboxOption) => <ComboboxItem key={option.id || "all-state"} value={option}>{option.label}</ComboboxItem>}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {showAdvancedFilters ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Input
                  type="number"
                  placeholder="Precio mínimo"
                  value={filters.minPrice ?? ""}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: event.target.value ? Number(event.target.value) : undefined,
                      page: 1,
                    }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Precio máximo"
                  value={filters.maxPrice ?? ""}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxPrice: event.target.value ? Number(event.target.value) : undefined,
                      page: 1,
                    }))
                  }
                />

                <Combobox
                  items={orderByOptions}
                  value={selectedOrderBy}
                  onValueChange={(option: ComboboxOption | null) =>
                    setFilters((prev) => ({
                      ...prev,
                      orderBy: option?.id || undefined,
                    }))
                  }
                  itemToStringLabel={(option) => option?.label ?? ""}
                  itemToStringValue={(option) => option?.id ?? ""}
                >
                  <ComboboxInput placeholder="Ordenar por" showClear />
                  <ComboboxContent className="z-50">
                    <ComboboxEmpty>Sin resultados</ComboboxEmpty>
                    <ComboboxList>
                      {(option: ComboboxOption) => <ComboboxItem key={option.id || "order-none"} value={option}>{option.label}</ComboboxItem>}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                <Combobox
                  items={orderDirectionOptions}
                  value={selectedOrderDirection}
                  onValueChange={(option: ComboboxOption | null) =>
                    setFilters((prev) => ({
                      ...prev,
                      orderDescending: option?.id === "" ? undefined : option?.id === "true",
                    }))
                  }
                  itemToStringLabel={(option) => option?.label ?? ""}
                  itemToStringValue={(option) => option?.id ?? ""}
                >
                  <ComboboxInput placeholder="Dirección" showClear />
                  <ComboboxContent className="z-50">
                    <ComboboxEmpty>Sin resultados</ComboboxEmpty>
                    <ComboboxList>
                      {(option: ComboboxOption) => <ComboboxItem key={option.id || "direction-none"} value={option}>{option.label}</ComboboxItem>}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setShowAdvancedFilters((prev) => !prev)}>
                <Filter className="h-4 w-4" />
                {showAdvancedFilters ? "Ocultar avanzados" : "Mostrar avanzados"}
              </Button>

              <Button
                variant="outline"
                onClick={() => setViewMode((prev) => (prev === "table" ? "cards" : "table"))}
              >
                {viewMode === "table" ? <LayoutGrid className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
                {viewMode === "table" ? "Vista tarjetas" : "Vista tabla"}
              </Button>

              <Button variant="outline" onClick={() => router.push("/product/add")}> 
                <ScanLine className="h-4 w-4" />
                Escanear producto
              </Button>

              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Nuevo producto
              </Button>

              <Button
                variant="ghost"
                onClick={() =>
                  setFilters({
                    page: 1,
                    pageSize: 20,
                  })
                }
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {loadingProducts ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-border bg-card">
                <CardContent className="space-y-2 pt-6">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === "table" ? (
          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-foreground">Listado de productos</CardTitle>
              <CardDescription>Vista operacional con acciones de detalle y precio.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        No hay productos para mostrar con los filtros actuales.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const noPrice = !product.salePrice || product.salePrice <= 0;
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">Creado por {product.createdByUserName}</p>
                          </TableCell>
                          <TableCell>{product.categoryName ?? "Sin categoría"}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.barcode ?? "Sin código"}</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${getStockTone(product)}`}>
                              {product.stock ?? 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            {noPrice ? (
                              <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Sin precio
                              </span>
                            ) : (
                              money.format(product.salePrice ?? 0)
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={product.isActive ? "text-emerald-600" : "text-rose-600"}>
                              {product.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => { setSelectedProduct(product); setDetailModalOpen(true); }}>
                                <Eye className="h-4 w-4" />
                                Ver
                              </Button>
                              {noPrice ? (
                                <Button size="sm" onClick={() => { setSelectedProduct(product); setPriceModalOpen(true); }}>
                                  <DollarSign className="h-4 w-4" />
                                  Precio
                                </Button>
                              ) : null}
                              <Button size="sm" variant="outline" onClick={() => toast("Edición visual pendiente")}>
                                <Pencil className="h-4 w-4" />
                                Editar
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => toast("Eliminación pendiente")}>
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.length === 0 ? (
              <Card className="border-border bg-card md:col-span-2 xl:col-span-3">
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay productos para mostrar con los filtros actuales.
                </CardContent>
              </Card>
            ) : (
              products.map((product) => {
                const noPrice = !product.salePrice || product.salePrice <= 0;
                return (
                  <Card key={product.id} className="border-border bg-card shadow-xs">
                    <CardContent className="space-y-4 pt-6">
                      <LazyProductImage
                        productName={product.name}
                        photos={cardPhotos[product.id]}
                        isLoading={loadingCardPhotos && !hasLoadedCardPhotos}
                      />

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.categoryName ?? "Sin categoría"}</p>
                        </div>
                        <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${getStockTone(product)}`}>
                          Stock {product.stock ?? 0}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>SKU: {product.sku}</p>
                        <p>Código: {product.barcode ?? "Sin código"}</p>
                        <p>Precio: {noPrice ? "Sin precio" : money.format(product.salePrice ?? 0)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedProduct(product); setDetailModalOpen(true); }}>
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                        {noPrice ? (
                          <Button size="sm" onClick={() => { setSelectedProduct(product); setPriceModalOpen(true); }}>
                            <DollarSign className="h-4 w-4" />
                            Asignar precio
                          </Button>
                        ) : null}
                        <Button size="sm" variant="outline" onClick={() => toast("Edición visual pendiente")}>
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {modalOpen ? (
          <CreateProductModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            categories={categories}
            onProductCreate={handleProductCreate}
          />
        ) : null}

        {priceModalOpen ? (
          <PriceFormModal
            open={priceModalOpen}
            onOpenChange={setPriceModalOpen}
            product={selectedProduct}
            onPriceUpdate={handlePriceUpdate}
          />
        ) : null}

        {detailModalOpen ? (
          <ProductDetailModal
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
            product={selectedProduct}
          />
        ) : null}
      </div>
    </div>
  );
}
