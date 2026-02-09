import toast from "react-hot-toast";

type ToastType = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

interface ShowToastParams {
  title?: string;
  description: string;
  color?: ToastType;
}

export function showToast({
  title = "Notificación",
  description,
  color = "default",
}: ShowToastParams) {
  // Formatear el mensaje con título y descripción
  const fullMessage = title ? (
    <div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm mt-1">{description}</div>
    </div>
  ) : description;

  switch (color) {
    case "success":
      toast.success(fullMessage, {
        duration: 4000,
        position: "bottom-right",
        style: {
          background: "#10b981",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
          minWidth: "300px",
        },
      });
      break;
    case "danger":
      toast.error(fullMessage, {
        duration: 6000,
        position: "bottom-right",
        style: {
          background: "#ef4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
          minWidth: "300px",
        },
      });
      break;
    case "warning":
      toast(fullMessage, {
        duration: 5000,
        position: "bottom-right",
        icon: "⚠️",
        style: {
          background: "#f59e0b",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
          minWidth: "300px",
        },
      });
      break;
    default:
      toast(fullMessage, {
        duration: 4000,
        position: "bottom-right",
        style: {
          background: "#3b82f6",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
          minWidth: "300px",
        },
      });
  }
}
