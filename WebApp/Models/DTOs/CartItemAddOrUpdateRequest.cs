namespace WebApp.Models.DTOs
{
    public class CartItemAddOrUpdateRequest
    {
        public int InventoryId { get; set; }
        public int Quantity { get; set; }
    }
} 