import { getAuthHeaders } from "@/utils/getAddHeaders";
import { PaymentMethodResponse } from "@/types/PaymentMethod";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";

const API_URL = () => getApiBaseUrl();


export async function getPaymentMethods(): Promise<PaymentMethodResponse[]> { 
    const res = await fetch(`${API_URL()}/PaymentMethod`, {
        method: "GET",
        headers: getAuthHeaders(),
    credentials: 'include',
    });
    if(!res.ok)
        throw new Error("Error al obtener métodos de pago");
    
    return res.json();
}