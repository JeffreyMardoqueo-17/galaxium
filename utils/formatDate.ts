export function formatDate(rawDate: string): string {
  // Verificar si rawDate es undefined o null
  if (!rawDate) {
    return "Fecha no proporcionada";
  }
  // Forzar zona UTC agregando 'Z' si no existe
  const dateStr = rawDate.endsWith("Z") ? rawDate : rawDate + "Z";
  const dateObj = new Date(dateStr);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return "Fecha inválida";
}
