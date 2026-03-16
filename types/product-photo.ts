
        // public async Task<IActionResult> Upload(
        //     int productId,
        //     IFormFile file,
        //     bool isPrimary = false)
        // {

export interface ProductPhoto {
    id?: number;
    photoUrl?: string;
    file?: File;
    isPrimary: boolean; 
}