"use client";

import { useEffect, useState } from "react";
import { HeroTable } from "@/components/ui/tables";
import { CreateProductModal } from "@/components/features/products/ProductForm";
import { ProductResponse, ProductCreateRequest } from "@/types/product";
import { getProducts, createProduct } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import type { CategoryRead } from "@/types/category"; // ajusta la ruta si es necesario

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Carga productos
  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos", error);
    } finally {
      setLoadingProducts(false);
    }
  }

  // Carga categorías
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

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Crear producto nuevo
  async function handleProductCreate(product: ProductCreateRequest) {
    try {
      await createProduct(product);
      setModalOpen(false);
      await loadProducts();
    } catch (error) {
      console.error("Error creando producto:", error);
      // Aquí podrías agregar UI de feedback
    }
  }

  if (loadingProducts || loadingCategories) return <p>Cargando...</p>;

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-md shadow"
        >
          Nuevo producto
        </button>
      </div>

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
          { key: "minimumStock", label: "Stock mínimo", align: "end" },
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
          categories={categories}
          onProductCreate={handleProductCreate}
        />
      )}
    </div>
  );
}
