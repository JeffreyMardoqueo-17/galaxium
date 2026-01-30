"use client";

import { useEffect, useState } from "react";
import { getCategories, createCategory } from "@/services/category.service";
import { CategoryRead } from "@/types/category";
import { formatDate } from "@/utils/formatDate";

export default function CategoryPage() {
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setError("No se pudo cargar las categorías");
      });
  }, []);

  const handleCreateCategory = async () => {
    setError(null);
    if (!newCategoryName.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }
    try {
      const created = await createCategory({ name: newCategoryName.trim() });
      setCategories((prev) => [...prev, created]);
      setNewCategoryName("");
      setModalOpen(false);
    } catch (err) {
      console.error("Error creando categoría:", err);
      setError("Error al crear la categoría");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Categorías</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>
      )}

      {/* Tabla */}
      <table className="w-full border-collapse border border-gray-500 mb-6">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="border border-gray-300 p-3 text-left">ID</th>
            <th className="border border-gray-300 p-3 text-left">Nombre</th>
            <th className="border border-gray-300 p-3 text-left">Creada</th>
          </tr>
        </thead>
    <tbody>
  {categories.map((cat) => (
    <tr key={cat.id} className="hover:bg-gray-50 text-gray-500">
      <td className="border border-gray-300 p-3">{cat.id}</td>
      <td className="border border-gray-300 p-3">{cat.name}</td>
      <td className="border border-gray-300 p-3">
        {formatDate(cat.createdAt)}
      </td>
    </tr>
  ))}
</tbody>

      </table>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Crear Categoría
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-96 max-w-full">
            <h2 className="text-xl font-semibold mb-4">Nueva Categoría</h2>

            {error && (
              <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>
            )}

            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-blue-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setError(null);
                  setNewCategoryName("");
                }}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
