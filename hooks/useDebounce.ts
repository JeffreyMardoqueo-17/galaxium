import { useEffect, useState } from "react";

/**
 * useDebounce
 * Retrasa la actualización de un valor hasta que el usuario
 * deje de cambiarlo durante X milisegundos.
 *
 * Ideal para búsquedas y filtros.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
