
        // public async Task<IActionResult> Upload(
        //     int productId,
        //     IFormFile file,
        //     bool isPrimary = false)
        // {

export interface ProductPhoto {
    productId: number;
    file: File;
    isPrimary: boolean; 
    
}