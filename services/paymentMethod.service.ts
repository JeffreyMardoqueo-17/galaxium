import { getAuthHeaders } from "@/utils/getAddHeaders";
import { PaymentMethodResponse } from "@/types/PaymentMethod";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213/api";


export async function getPaymentMethods(): Promise<PaymentMethodResponse[]> { 
    const res = await fetch(`${API_URL}/PaymentMethod`, {
        method: "GET",
        headers: getAuthHeaders(),
    });
    if(!res.ok)
        throw new Error("Error al obtener métodos de pago");
    
    return res.json();
}