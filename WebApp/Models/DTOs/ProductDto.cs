﻿using System.ComponentModel.DataAnnotations;

namespace WebApp.Models.DTOs
{
    public class ProductDto
    {
        public string Id { get; set; } = null!;
        [Required(ErrorMessage = "Tên không được để trống!")]
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        [Range(0, 100000000)]
        public double Price { get; set; }
        
        [Obsolete("SalePrice is deprecated. Use PromotionPrice instead. This field will be removed in future versions.")]
        [Range(0, 100000000)]
        public double? SalePrice { get; set; }
        
        public string? MainImage { get; set; }
        public List<string>? Images { get; set; }
        public int LikeCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Category and Brand information
        public string? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? BrandId { get; set; }
        public string? BrandName { get; set; }

        // Stock information
        public int TotalQuantity { get; set; }

        public IEnumerable<InventoryDto>? Inventories { get; set; }

        // Promotion information (preferred over SalePrice)
        public double? PromotionPrice { get; set; }
        public double? PromotionDiscount { get; set; }
        public string? PromotionName { get; set; }
        public bool HasActivePromotion { get; set; }
    }
}
