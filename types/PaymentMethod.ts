//  public record PaymentMethodResponseDto(
//         int Id,
//         string Name,
//         string? Description,
//         bool IsActive,
//         DateTime CreatedAt
//     );

export interface PaymentMethodResponse{

    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}