//  public record CustomerCreateRequestDTO(
//         string FullName,
//         string? Phone,
//         string? Email
//     ); public record CustomerResponseDTO(
//        int Id,
//        string FullName,
//        string? Phone,
//        string? Email,
//        DateTime CreatedAt
//    ); public record CustomerUpdateRequestDTO(
//         int Id,
//         string FullName,
//         string? Phone,
//         string? Email
//     );

export interface CustomerCreateRequestDTO {
    fullName: string;
    phone?: string | null;
    email?: string | null;
}
export interface CustomerResponseDTO {
    id: number;
    fullName: string;
    phone?: string | null;
    email?: string | null;
    createdAt: string;
}
export interface CustomerUpdateRequestDTO {
    id: number;
    fullName: string;
    phone?: string | null;
    email?: string | null;
}