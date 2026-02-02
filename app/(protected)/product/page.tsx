"use client";

import { useEffect, useState } from "react";
import { HeroTable } from "@/components/ui/tables";
import { CreateProductModal } from "@/components/features/products/ProductForm";
import {
  ProductResponse,
  ProductCreateRequest,
  ProductFilterRequest,
} from "@/types/product";
import {
  getProductsByFilter,
  createProduct,
  getProducts,
} from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import type { CategoryRead } from "@/types/category";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryRead[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [filters, setFilters] = useState<ProductFilterRequest>({
    page: 1,
    pageSize: 20,
  });

  // ===============================
  // LOAD PRODUCTS (con filtros)
  // ===============================
  async function loadProducts(filter: ProductFilterRequest) {
  setLoadingProducts(true);
  try {
    const data = hasRealFilters(filter)
      ? await getProductsByFilter(filter)
      : await getProducts(); //listado normal

    setProducts(data);
  } catch (error) {
    console.error("Error cargando productos", error);
  } finally {
    setLoadingProducts(false);
  }
}


  function hasRealFilters(filters: ProductFilterRequest) {
  const { page, pageSize, ...rest } = filters;

  return Object.values(rest).some(
    (v) => v !== undefined && v !== null && v !== ""
  );
}


  // ===============================
  // LOAD CATEGORIES (una vez)
  // ===============================
  async function loadCategories() {
    setLoadingCategories(true);
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Error cargando categorías", error);
    } finally {
      setLoadingCategories(false);
    }
  }

  // ⬅️ Cargar categorías SOLO una vez
  useEffect(() => {
    loadCategories();
  }, []);

  // ⬅️ Cargar productos cada vez que cambian filtros
  useEffect(() => {
    loadProducts(filters);
  }, [filters]);

  // ===============================
  // CREATE PRODUCT
  // ===============================
  async function handleProductCreate(product: ProductCreateRequest) {
    try {
      await createProduct(product);
      setModalOpen(false);
      await loadProducts(filters);
    } catch (error) {
      console.error("Error creando producto:", error);
    }
  }

  if (loadingProducts || loadingCategories) {
    return <p className="p-4">Cargando...</p>;
  }

  return (
    <div className="space-y-6 p-2 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Productos</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-md"
        >
          Nuevo producto
        </button>
      </div>

      {/* ===============================
          FILTROS
         =============================== */}
      <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-md">
        <input
          placeholder="Nombre"
          className="border px-2 py-1 rounded"
          onChange={(e) =>
            setFilters((f) => ({ ...f, name: e.target.value || undefined }))
          }
        />

        <select
          className="border px-2 py-1 rounded"
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              categoryId: e.target.value
                ? Number(e.target.value)
                : undefined,
            }))
          }
        >
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Stock mínimo"
          className="border px-2 py-1 rounded"
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              minStock: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />

        <select
          className="border px-2 py-1 rounded"
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              isActive:
                e.target.value === ""
                  ? undefined
                  : e.target.value === "true",
            }))
          }
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>

        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={() => setFilters({ page: 1, pageSize: 20 })}
        >
          Limpiar
        </button>
      </div>

      {/* ===============================
          TABLE
         =============================== */}
     <HeroTable
        data={products}
        columns={[
          { key: "name", label: "Nombre" },
          { key: "sku", label: "SKU" },
          {
            key: "costPrice",
            label: "Precio de costo",
            align: "end",
            render: (item) => `$${item.costPrice.toFixed(2)}`,
          },
          { key: "stock", label: "Stock", align: "end" },
         
          {
            key: "isActive",
            label: "Activo",
            render: (item) => (item.isActive ? "Sí" : "No"),
          },
          {
            key: "createdAt",
            label: "Creado",
            render: (item) => new Date(item.createdAt).toLocaleDateString(),
          },
          { key: "categoryName", label: "Categoría" },
          {
            key: "salePrice",
            label: "Precio de venta",
            align: "end",
            render: (item) => `$${item.salePrice.toFixed(2)}`,
          },
        ]}
        actions={() => (
          <div className="flex gap-2">
            <button className="bg-blue-500 px-3 py-1 text-white rounded-md hover:bg-blue-600 transition">
              Ver
            </button>
            <button className="bg-yellow-500 px-3 py-1 text-white rounded-md hover:bg-yellow-600 transition">
              Editar
            </button>
            <button className="bg-red-500 px-3 py-1 text-white rounded-md hover:bg-red-600 transition">
              Eliminar
            </button>
          </div>
        )}
      />

      {/* Modal para crear producto */}
      {modalOpen && (
       
           <CreateProductModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categories={categories}
        onProductCreate={handleProductCreate}
      />
      )}
    </div>
  );
}
