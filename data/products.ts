// 1. Brand Type
export interface Brand {
    id: number;
    name: string;
    logo?: string;
    slug: string;
}

// 2. Category Type
export interface Category {
    id: number;
    name: string;
    slug: string;
    image?: string;
}

// 3. Review Type
export interface Review {
    id: number;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

// 4. Complete Product Type
export interface Product {
    id: number;
    sku: string;
    barcode?: string; // নতুন
    title: string;
    slug: string;
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    discountEndDate?: string;
    // Marketing & Flash Sale
    isFlashSale?: boolean;
    flashSaleStartTime?: string | null;
    flashSaleEndTime?: string | null;
    image: string;
    gallery?: string[];
    description: string;
    shortDescription?: string;
    brand: Brand;
    category: Category;
    weight?: string;
    unit?: string;
    packagingType?: string; // নতুন
    availableSizes?: string[];
    availableColors?: string[]; // নতুন
    availableFlavors?: string[]; // নতুন
    stock: number;
    stockStatus: "In Stock" | "Out of Stock" | "Pre-Order";
    lowStockThreshold?: number; // নতুন
    rating: number;
    reviewCount: number;
    reviews?: Review[];
    isBestSelling?: boolean;
    isNewArrival?: boolean;
    isFeatured?: boolean;
    isFragile?: boolean; // নতুন
    tags?: string[];
    deliveryCharge?: number;
    isFreeShipping?: boolean; // নতুন
    deliveryTime?: string;
    returnPolicy?: string;
    warranty?: string;
    seller?: string;
    countryOfOrigin?: string;
    expiryDate?: string;
    isCodAvailable?: boolean;
    minOrderQuantity?: number;
    maxOrderQuantity?: number;
    taxRate?: number;
    shippingWeight?: string;
    dimensions?: { length: number; width: number; height: number; unit: string }; // নতুন (অবজেক্ট)
    condition?: "New" | "Used" | "Refurbished";
    returnWindow?: string;
    paymentMethods?: string[];
    seo?: { // নতুন
        metaTitle: string;
        metaDescription: string;
        metaKeywords: string[];
    };
}

// 5. Brands (7 brands)
export const MOCK_BRANDS: Brand[] = [
    { id: 1, name: "Ghorer Bazar", slug: "ghorer-bazar", logo: "/images/brands/ghorer-bazar.png" },
    { id: 2, name: "Pran", slug: "pran", logo: "/images/brands/pran.png" },
    { id: 3, name: "Fresh", slug: "fresh", logo: "/images/brands/fresh.png" },
    { id: 4, name: "Aarong", slug: "aarong", logo: "/images/brands/aarong.png" },
    { id: 5, name: "Rupchanda", slug: "rupchanda", logo: "/images/brands/rupchanda.png" },
    { id: 6, name: "Teer", slug: "teer", logo: "/images/brands/teer.png" },
    { id: 7, name: "ACI", slug: "aci", logo: "/images/brands/aci.png" },
];

// 6. Categories (8 categories)
export const MOCK_CATEGORIES: Category[] = [
    { id: 1, name: "Honey", slug: "honey", image: "/images/categories/honey.png" },
    { id: 2, name: "Ghee & Oil", slug: "ghee-oil", image: "/images/categories/ghee.png" },
    { id: 3, name: "Spices", slug: "spices", image: "/images/categories/spices.png" },
    { id: 4, name: "Nuts & Seeds", slug: "nuts-seeds", image: "/images/categories/nuts.png" },
    { id: 5, name: "Rice & Grains", slug: "rice-grains", image: "/images/categories/rice.png" },
    { id: 6, name: "Lentils & Pulses", slug: "lentils-pulses", image: "/images/categories/lentils.png" },
    { id: 7, name: "Tea & Beverage", slug: "tea-beverage", image: "/images/categories/tea.png" },
    { id: 8, name: "Dates & Dry Fruits", slug: "dates-dry-fruits", image: "/images/categories/dates.png" },
];

// 7. 20 Products (US Currency) - সম্পূর্ণ এবং আপডেটেড
export const MOCK_PRODUCTS: Product[] = [
    // ================= HONEY (1-4) =================
    {
        id: 1,
        sku: "GB-HNY-001",
        barcode: "8941234567890",
        title: "Sundarban Honey 1kg",
        slug: "sundarban-honey-1kg",
        price: 24.99,
        originalPrice: 29.99,
        discountPercentage: 17,
        discountEndDate: "2026-12-31",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/nWkrb1793514099-light-1000x1000.jpg",
        gallery: ["https://cdn.ghorerbazar.com/productImages/nWkrb1793514099-light-1000x1000.jpg", "https://cdn.ghorerbazar.com/productImages/YPsni1793513651-light-1000x1000.jpg"],
        description: "100% pure and natural honey collected from the Sundarbans. No preservatives or artificial colors added. Helps boost immunity and improve digestion.",
        shortDescription: "100% pure & natural Sundarban honey.",
        brand: MOCK_BRANDS[0], category: MOCK_CATEGORIES[0],
        weight: "1kg", unit: "jar", packagingType: "Glass Jar",
        availableSizes: ["500g", "1kg", "2kg"],
        availableColors: ["White", "Black", "Red"],
        availableFlavors: ["Original", "Black Seed Infused"],
        stock: 50, stockStatus: "In Stock", lowStockThreshold: 5,
        rating: 4.9, reviewCount: 120,
        reviews: [{ id: 1, userName: "John Doe", rating: 5, comment: "Excellent quality honey!", date: "2026-10-15" }],
        isBestSelling: true, isFeatured: true, isFragile: true,
        tags: ["organic", "natural", "honey", "sundarban"],
        deliveryCharge: 5.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Ghorer Bazar", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-12-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 5,
        taxRate: 0.08, shippingWeight: "1.2 kg", dimensions: { length: 6, width: 6, height: 8, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal", "Apple Pay", "COD"],
        seo: { metaTitle: "Buy 100% Pure Sundarban Honey 1kg Online", metaDescription: "Order pure and natural Sundarban honey 1kg from BazarGhor.", metaKeywords: ["honey", "sundarban honey", "organic food"] }
    },
    {
        id: 2,
        sku: "GB-HNY-002",
        barcode: "8941234567891",
        title: "Black Seed Honey 1kg",
        slug: "black-seed-honey-1kg",
        price: 17.99,
        originalPrice: 21.99,
        discountPercentage: 18,
        discountEndDate: "2026-11-30",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/LH2QX1793595320-light-2000x2000.jpg",
        description: "Pure honey made from black seed flower extract. It has antibacterial properties and helps boost immunity.",
        shortDescription: "Pure black seed flower honey.",
        brand: MOCK_BRANDS[0], category: MOCK_CATEGORIES[0],
        weight: "1kg", unit: "jar", packagingType: "Glass Jar",
        availableSizes: ["500g", "1kg", "2kg"],
        availableColors: [],
        availableFlavors: ["Original"],
        stock: 40, stockStatus: "In Stock", lowStockThreshold: 5,
        rating: 4.8, reviewCount: 45, isBestSelling: true,
        tags: ["honey", "black-seed", "natural", "immunity"],
        deliveryCharge: 5.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Ghorer Bazar", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-12-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 5,
        taxRate: 0.08, shippingWeight: "1.2 kg", dimensions: { length: 6, width: 6, height: 8, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Pure Black Seed Honey 1kg Online", metaDescription: "Order pure black seed flower honey 1kg from BazarGhor.", metaKeywords: ["honey", "black seed honey", "organic food"] }
    },
    {
        id: 3,
        sku: "GB-HNY-003",
        barcode: "8941234567892",
        title: "Litchi Flower Honey 500g",
        slug: "litchi-flower-honey-500g",
        price: 14.50,
        originalPrice: 16.50,
        discountPercentage: 12,
        discountEndDate: "2026-12-20",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/nWkrb1793514099-light-1000x1000.jpg",
        description: "Sweet and aromatic litchi flower honey. Perfect for tea, toast, and desserts.",
        shortDescription: "Aromatic litchi flower honey.",
        brand: MOCK_BRANDS[0], category: MOCK_CATEGORIES[0],
        weight: "500g", unit: "jar", packagingType: "Glass Jar",
        availableSizes: ["250g", "500g", "1kg"],
        availableColors: [],
        availableFlavors: ["Original"],
        stock: 35, stockStatus: "In Stock", lowStockThreshold: 5,
        rating: 4.7, reviewCount: 30, isNewArrival: true,
        tags: ["honey", "litchi", "natural"],
        deliveryCharge: 5.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Ghorer Bazar", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-10-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 5,
        taxRate: 0.08, shippingWeight: "0.7 kg", dimensions: { length: 5, width: 5, height: 7, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Litchi Flower Honey 500g Online", metaDescription: "Order aromatic litchi flower honey 500g from BazarGhor.", metaKeywords: ["honey", "litchi honey", "organic food"] }
    },
    {
        id: 4,
        sku: "PRN-HNY-004",
        barcode: "8941234567893",
        title: "Mustard Flower Honey 500g",
        slug: "mustard-flower-honey-500g",
        price: 12.99,
        image: "https://cdn.ghorerbazar.com/productImages/YPsni1793513651-light-1000x1000.jpg",
        description: "Natural mustard flower honey, rich in flavor and nutrients. Sourced from local beekeepers.",
        shortDescription: "Natural mustard flower honey.",
        brand: MOCK_BRANDS[1], category: MOCK_CATEGORIES[0],
        weight: "500g", unit: "jar", packagingType: "Glass Jar",
        availableSizes: ["250g", "500g", "1kg"],
        availableColors: [],
        availableFlavors: ["Original"],
        stock: 20, stockStatus: "In Stock", lowStockThreshold: 3,
        rating: 4.6, reviewCount: 22,
        tags: ["honey", "mustard", "natural"],
        deliveryCharge: 5.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Pran RFL Group", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-09-30", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 4,
        taxRate: 0.08, shippingWeight: "0.7 kg", dimensions: { length: 5, width: 5, height: 7, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Mustard Flower Honey 500g Online", metaDescription: "Order natural mustard flower honey 500g from BazarGhor.", metaKeywords: ["honey", "mustard honey", "organic food"] }
    },

    // ================= GHEE & OIL (5-8) =================
    {
        id: 5,
        sku: "GB-GHE-005",
        barcode: "8941234567894",
        title: "Gawa Ghee 1kg",
        slug: "gawa-ghee-1kg",
        price: 19.99,
        originalPrice: 22.99,
        discountPercentage: 13,
        discountEndDate: "2026-11-30",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/YPsni1793513651-light-1000x1000.jpg",
        description: "Pure cow ghee made from deshi cow milk. Prepared using traditional methods, it enhances the taste of your cooking and is beneficial for health.",
        shortDescription: "Pure deshi cow ghee.",
        brand: MOCK_BRANDS[0], category: MOCK_CATEGORIES[1],
        weight: "1kg", unit: "jar", packagingType: "Glass Jar",
        availableSizes: ["500g", "1kg", "2kg"],
        availableColors: [],
        availableFlavors: ["Original"],
        stock: 30, stockStatus: "In Stock", lowStockThreshold: 5,
        rating: 4.8, reviewCount: 85, isBestSelling: true,
        tags: ["ghee", "organic", "cow", "deshi"],
        deliveryCharge: 5.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Ghorer Bazar", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-06-30", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 3,
        taxRate: 0.08, shippingWeight: "1.3 kg", dimensions: { length: 6, width: 6, height: 8, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Pure Gawa Ghee 1kg Online", metaDescription: "Order pure deshi cow ghee 1kg from BazarGhor.", metaKeywords: ["ghee", "cow ghee", "organic food"] }
    },
    {
        id: 6,
        sku: "PRN-OIL-006",
        barcode: "8941234567895",
        title: "Deshi Mustard Oil 5 liter",
        slug: "deshi-mustard-oil-5-liter",
        price: 18.50,
        originalPrice: 21.00,
        discountPercentage: 12,
        discountEndDate: "2026-12-15",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/vkVdH1767248022.jpg",
        description: "Cold-pressed mustard oil made from premium mustard seeds. Ideal for cooking and skin care.",
        shortDescription: "Cold-pressed deshi mustard oil.",
        brand: MOCK_BRANDS[1], category: MOCK_CATEGORIES[1],
        weight: "5 liter", unit: "bottle", packagingType: "Plastic Bottle",
        availableSizes: ["1 liter", "2 liter", "5 liter"],
        availableColors: [],
        availableFlavors: [],
        stock: 25, stockStatus: "In Stock", lowStockThreshold: 3,
        rating: 4.7, reviewCount: 60, isBestSelling: true,
        tags: ["oil", "mustard", "cold-pressed", "cooking"],
        deliveryCharge: 7.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Pran RFL Group", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-08-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 2,
        taxRate: 0.08, shippingWeight: "11 kg", dimensions: { length: 10, width: 6, height: 12, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal", "Google Pay"],
        seo: { metaTitle: "Buy Deshi Mustard Oil 5 Liter Online", metaDescription: "Order cold-pressed deshi mustard oil 5 liter from BazarGhor.", metaKeywords: ["mustard oil", "cooking oil", "organic food"] }
    },
    {
        id: 7,
        sku: "RPC-OIL-007",
        barcode: "8941234567896",
        title: "Rupchanda Soybean Oil 2 liter",
        slug: "rupchanda-soybean-oil-2-liter",
        price: 8.99,
        originalPrice: 10.99,
        discountPercentage: 18,
        discountEndDate: "2026-12-31",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/vkVdH1767248022.jpg",
        description: "Refined soybean oil by Rupchanda. Suitable for everyday cooking.",
        shortDescription: "Refined soybean cooking oil.",
        brand: MOCK_BRANDS[4], category: MOCK_CATEGORIES[1],
        weight: "2 liter", unit: "bottle", packagingType: "Plastic Bottle",
        availableSizes: ["1 liter", "2 liter", "5 liter"],
        availableColors: [],
        availableFlavors: [],
        stock: 60, stockStatus: "In Stock", lowStockThreshold: 10,
        rating: 4.5, reviewCount: 40,
        tags: ["oil", "soybean", "cooking"],
        deliveryCharge: 6.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Rupchanda", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-11-30", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 5,
        taxRate: 0.08, shippingWeight: "4.5 kg", dimensions: { length: 8, width: 5, height: 10, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Rupchanda Soybean Oil 2 Liter Online", metaDescription: "Order refined soybean oil 2 liter from BazarGhor.", metaKeywords: ["soybean oil", "cooking oil"] }
    },
    {
        id: 8,
        sku: "TER-OIL-008",
        barcode: "8941234567897",
        title: "Teer Fortified Soybean Oil 5 liter",
        slug: "teer-fortified-soybean-oil-5-liter",
        price: 19.99,
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/vkVdH1767248022.jpg",
        description: "Vitamin A fortified soybean oil by Teer. Ensures healthy cooking.",
        shortDescription: "Vitamin A fortified soybean oil.",
        brand: MOCK_BRANDS[5], category: MOCK_CATEGORIES[1],
        weight: "5 liter", unit: "bottle", packagingType: "Plastic Bottle",
        availableSizes: ["1 liter", "2 liter", "5 liter"],
        availableColors: [],
        availableFlavors: [],
        stock: 15, stockStatus: "In Stock", lowStockThreshold: 3,
        rating: 4.6, reviewCount: 35, isNewArrival: true,
        tags: ["oil", "soybean", "fortified", "teer"],
        deliveryCharge: 8.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Teer", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-10-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 2,
        taxRate: 0.08, shippingWeight: "11 kg", dimensions: { length: 10, width: 6, height: 12, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Teer Fortified Soybean Oil 5 Liter Online", metaDescription: "Order Teer fortified soybean oil 5 liter from BazarGhor.", metaKeywords: ["soybean oil", "cooking oil", "teer"] }
    },

    // ================= SPICES (9-11) =================
    {
        id: 9,
        sku: "GB-SPC-009",
        barcode: "8941234567898",
        title: "Turmeric Powder 500g",
        slug: "turmeric-powder-500g",
        price: 4.99,
        originalPrice: 6.99,
        discountPercentage: 28,
        discountEndDate: "2026-12-15",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500&q=80",
        description: "Pure turmeric powder, freshly ground. Enhances the color and flavor of your dishes.",
        shortDescription: "Pure freshly ground turmeric.",
        brand: MOCK_BRANDS[2], category: MOCK_CATEGORIES[2],
        weight: "500g", unit: "pack", packagingType: "Sealed Pouch",
        availableSizes: ["200g", "500g", "1kg"],
        availableColors: [],
        availableFlavors: [],
        stock: 80, stockStatus: "In Stock", lowStockThreshold: 10,
        rating: 4.7, reviewCount: 50, isBestSelling: true,
        tags: ["spices", "turmeric", "organic"],
        deliveryCharge: 4.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Fresh", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-06-30", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 10,
        taxRate: 0.08, shippingWeight: "1.1 kg", dimensions: { length: 5, width: 4, height: 7, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Pure Turmeric Powder 500g Online", metaDescription: "Order pure freshly ground turmeric powder 500g from BazarGhor.", metaKeywords: ["turmeric", "spices", "organic food"] }
    },
    {
        id: 10,
        sku: "GB-SPC-010",
        barcode: "8941234567899",
        title: "Chili Powder 400g",
        slug: "chili-powder-400g",
        price: 3.99,
        originalPrice: 4.99,
        discountPercentage: 20,
        discountEndDate: "2026-11-20",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/O89WG1793514026-light-1000x1000.jpg",
        description: "Premium quality red chili powder. Adds perfect spice and color to your food.",
        shortDescription: "Premium red chili powder.",
        brand: MOCK_BRANDS[2], category: MOCK_CATEGORIES[2],
        weight: "400g", unit: "pack", packagingType: "Sealed Pouch",
        availableSizes: ["200g", "400g", "1kg"],
        availableColors: [],
        availableFlavors: [],
        stock: 70, stockStatus: "In Stock", lowStockThreshold: 10,
        rating: 4.6, reviewCount: 40,
        tags: ["spices", "chili", "hot"],
        deliveryCharge: 4.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Fresh", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-05-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 10,
        taxRate: 0.08, shippingWeight: "0.9 kg", dimensions: { length: 5, width: 4, height: 7, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Premium Red Chili Powder 400g Online", metaDescription: "Order premium red chili powder 400g from BazarGhor.", metaKeywords: ["chili", "spices", "organic food"] }
    },
    {
        id: 11,
        sku: "ACI-SPC-011",
        barcode: "8941234567800",
        title: "Garam Masala 100g",
        slug: "garam-masala-100g",
        price: 2.99,
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/BVB2a1767100552.jpg",
        description: "Aromatic garam masala blend by ACI. Perfect for rich and flavorful curries.",
        shortDescription: "Aromatic garam masala blend.",
        brand: MOCK_BRANDS[6], category: MOCK_CATEGORIES[2],
        weight: "100g", unit: "pack", packagingType: "Sealed Pouch",
        availableSizes: ["50g", "100g", "200g"],
        availableColors: [],
        availableFlavors: [],
        stock: 90, stockStatus: "In Stock", lowStockThreshold: 10,
        rating: 4.8, reviewCount: 25, isNewArrival: true,
        tags: ["spices", "garam masala", "curry"],
        deliveryCharge: 4.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "ACI", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-12-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 10,
        taxRate: 0.08, shippingWeight: "0.3 kg", dimensions: { length: 4, width: 3, height: 5, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy ACI Garam Masala 100g Online", metaDescription: "Order aromatic garam masala 100g from BazarGhor.", metaKeywords: ["garam masala", "spices", "curry"] }
    },

    // ================= NUTS & SEEDS (12-14) =================
    {
        id: 12,
        sku: "GB-NTS-012",
        barcode: "8941234567801",
        title: "Premium Almonds 500g",
        slug: "premium-almonds-500g",
        price: 12.99,
        originalPrice: 15.99,
        discountPercentage: 19,
        discountEndDate: "2026-12-10",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/IvsiP1767095664.jpg",
        description: "Raw California almonds, rich in protein and healthy fats.",
        shortDescription: "Raw California almonds.",
        brand: MOCK_BRANDS[3], category: MOCK_CATEGORIES[3],
        weight: "500g", unit: "pack", packagingType: "Sealed Pouch",
        availableSizes: ["250g", "500g", "1kg"],
        availableColors: [],
        availableFlavors: [],
        stock: 45, stockStatus: "In Stock", lowStockThreshold: 5,
        rating: 4.9, reviewCount: 70, isBestSelling: true,
        tags: ["nuts", "almonds", "healthy"],
        deliveryCharge: 5.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Aarong", countryOfOrigin: "USA",
        expiryDate: "2027-09-30", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 6,
        taxRate: 0.08, shippingWeight: "1.2 kg", dimensions: { length: 6, width: 5, height: 8, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Premium California Almonds 500g Online", metaDescription: "Order raw California almonds 500g from BazarGhor.", metaKeywords: ["almonds", "nuts", "healthy food"] }
    },
    {
        id: 13,
        sku: "GB-NTS-013",
        barcode: "8941234567802",
        title: "Roasted Cashew Nuts 500g",
        slug: "roasted-cashew-nuts-500g",
        price: 14.99,
        originalPrice: 18.99,
        discountPercentage: 21,
        discountEndDate: "2026-11-25",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/U970T1767096491.jpg",
        description: "Premium roasted cashew nuts. Perfect for snacking.",
        shortDescription: "Premium roasted cashew nuts.",
        brand: MOCK_BRANDS[3], category: MOCK_CATEGORIES[3],
        weight: "500g", unit: "pack", packagingType: "Sealed Pouch",
        availableSizes: ["250g", "500g", "1kg"],
        availableColors: [],
        availableFlavors: [],
        stock: 35, stockStatus: "In Stock", lowStockThreshold: 5,
        rating: 4.8, reviewCount: 55,
        tags: ["nuts", "cashew", "roasted"],
        deliveryCharge: 5.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Aarong", countryOfOrigin: "Vietnam",
        expiryDate: "2027-08-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 6,
        taxRate: 0.08, shippingWeight: "1.2 kg", dimensions: { length: 6, width: 5, height: 8, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Roasted Cashew Nuts 500g Online", metaDescription: "Order premium roasted cashew nuts 500g from BazarGhor.", metaKeywords: ["cashew", "nuts", "healthy food"] }
    },
    {
        id: 14,
        sku: "GB-NTS-014",
        barcode: "8941234567803",
        title: "Chia Seeds 250g",
        slug: "chia-seeds-250g",
        price: 6.99,
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://cdn.ghorerbazar.com/productImages/GitND1767515685.jpg",
        description: "Organic chia seeds, rich in omega-3 and fiber.",
        shortDescription: "Organic chia seeds.",
        brand: MOCK_BRANDS[0], category: MOCK_CATEGORIES[3],
        weight: "250g", unit: "pack", packagingType: "Sealed Pouch",
        availableSizes: ["250g", "500g", "1kg"],
        availableColors: [],
        availableFlavors: [],
        stock: 55, stockStatus: "In Stock", lowStockThreshold: 5,
        rating: 4.7, reviewCount: 32, isNewArrival: true,
        tags: ["seeds", "chia", "organic", "superfood"],
        deliveryCharge: 4.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Ghorer Bazar", countryOfOrigin: "Peru",
        expiryDate: "2027-12-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 8,
        taxRate: 0.08, shippingWeight: "0.6 kg", dimensions: { length: 5, width: 4, height: 6, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Organic Chia Seeds 250g Online", metaDescription: "Order organic chia seeds 250g from BazarGhor.", metaKeywords: ["chia seeds", "superfood", "organic food"] }
    },

    // ================= RICE & GRAINS (15-16) =================
    {
        id: 15,
        sku: "GB-RIC-015",
        barcode: "8941234567804",
        title: "Miniket Rice 5kg",
        slug: "miniket-rice-5kg",
        price: 9.99,
        originalPrice: 11.99,
        discountPercentage: 17,
        discountEndDate: "2026-12-05",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80",
        description: "Premium quality Miniket rice. Perfect for daily meals.",
        shortDescription: "Premium Miniket rice.",
        brand: MOCK_BRANDS[1], category: MOCK_CATEGORIES[4],
        weight: "5kg", unit: "bag", packagingType: "PP Bag",
        availableSizes: ["1kg", "5kg", "10kg"],
        availableColors: [],
        availableFlavors: [],
        stock: 100, stockStatus: "In Stock", lowStockThreshold: 10,
        rating: 4.7, reviewCount: 90, isBestSelling: true,
        tags: ["rice", "miniket", "grain"],
        deliveryCharge: 9.99, isFreeShipping: false, deliveryTime: "5-7 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Pran RFL Group", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-12-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 2,
        taxRate: 0.08, shippingWeight: "11 kg", dimensions: { length: 15, width: 10, height: 5, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Premium Miniket Rice 5kg Online", metaDescription: "Order premium Miniket rice 5kg from BazarGhor.", metaKeywords: ["rice", "miniket rice", "grain"] }
    },
    {
        id: 16,
        sku: "GB-RIC-016",
        barcode: "8941234567805",
        title: "Nazirshail Rice 5kg",
        slug: "nazirshail-rice-5kg",
        price: 11.99,
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80",
        description: "Aromatic Nazirshail rice. Ideal for biryani and polao.",
        shortDescription: "Aromatic Nazirshail rice.",
        brand: MOCK_BRANDS[3], category: MOCK_CATEGORIES[4],
        weight: "5kg", unit: "bag", packagingType: "PP Bag",
        availableSizes: ["1kg", "5kg", "10kg"],
        availableColors: [],
        availableFlavors: [],
        stock: 60, stockStatus: "In Stock", lowStockThreshold: 10,
        rating: 4.8, reviewCount: 65,
        tags: ["rice", "nazirshail", "aromatic"],
        deliveryCharge: 9.99, isFreeShipping: false, deliveryTime: "5-7 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Aarong", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-12-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 2,
        taxRate: 0.08, shippingWeight: "11 kg", dimensions: { length: 15, width: 10, height: 5, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Aromatic Nazirshail Rice 5kg Online", metaDescription: "Order aromatic Nazirshail rice 5kg from BazarGhor.", metaKeywords: ["rice", "nazirshail rice", "grain"] }
    },

    // ================= LENTILS & PULSES (17-18) =================
    {
        id: 17,
        sku: "GB-LEN-017",
        barcode: "8941234567806",
        title: "Red Lentils (Masoor Dal) 1kg",
        slug: "red-lentils-masoor-dal-1kg",
        price: 3.49,
        originalPrice: 4.49,
        discountPercentage: 22,
        discountEndDate: "2026-11-15",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=500&q=80",
        description: "Premium quality red lentils, perfect for dal.",
        shortDescription: "Premium red lentils.",
        brand: MOCK_BRANDS[2], category: MOCK_CATEGORIES[5],
        weight: "1kg", unit: "pack", packagingType: "Sealed Pouch",
        availableSizes: ["500g", "1kg", "2kg"],
        availableColors: [],
        availableFlavors: [],
        stock: 120, stockStatus: "In Stock", lowStockThreshold: 10,
        rating: 4.6, reviewCount: 75, isBestSelling: true,
        tags: ["lentils", "dal", "masoor"],
        deliveryCharge: 4.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Fresh", countryOfOrigin: "Canada",
        expiryDate: "2027-10-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 10,
        taxRate: 0.08, shippingWeight: "2.2 kg", dimensions: { length: 7, width: 5, height: 9, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Premium Red Lentils (Masoor Dal) 1kg Online", metaDescription: "Order premium red lentils 1kg from BazarGhor.", metaKeywords: ["lentils", "masoor dal", "organic food"] }
    },
    {
        id: 18,
        sku: "GB-LEN-018",
        barcode: "8941234567807",
        title: "Chickpeas (Chola) 1kg",
        slug: "chickpeas-chola-1kg",
        price: 2.99,
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=500&q=80",
        description: "High-quality chickpeas, rich in protein and fiber.",
        shortDescription: "High-quality chickpeas.",
        brand: MOCK_BRANDS[2], category: MOCK_CATEGORIES[5],
        weight: "1kg", unit: "pack", packagingType: "Sealed Pouch",
        availableSizes: ["500g", "1kg", "2kg"],
        availableColors: [],
        availableFlavors: [],
        stock: 90, stockStatus: "In Stock", lowStockThreshold: 10,
        rating: 4.5, reviewCount: 40,
        tags: ["lentils", "chickpeas", "chola"],
        deliveryCharge: 4.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Fresh", countryOfOrigin: "India",
        expiryDate: "2027-09-30", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 10,
        taxRate: 0.08, shippingWeight: "2.2 kg", dimensions: { length: 7, width: 5, height: 9, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy High-Quality Chickpeas (Chola) 1kg Online", metaDescription: "Order high-quality chickpeas 1kg from BazarGhor.", metaKeywords: ["chickpeas", "chola", "organic food"] }
    },

    // ================= TEA & BEVERAGE (19-20) =================
    {
        id: 19,
        sku: "GB-TEA-019",
        barcode: "8941234567808",
        title: "Premium Black Tea 400g",
        slug: "premium-black-tea-400g",
        price: 5.99,
        originalPrice: 7.99,
        discountPercentage: 25,
        discountEndDate: "2026-12-01",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80",
        description: "Premium black tea leaves, perfect for a strong cup of tea.",
        shortDescription: "Premium black tea leaves.",
        brand: MOCK_BRANDS[6], category: MOCK_CATEGORIES[6],
        weight: "400g", unit: "pack", packagingType: "Sealed Pouch",
        availableSizes: ["200g", "400g", "1kg"],
        availableColors: [],
        availableFlavors: [],
        stock: 75, stockStatus: "In Stock", lowStockThreshold: 10,
        rating: 4.8, reviewCount: 50, isNewArrival: true,
        tags: ["tea", "black tea", "beverage"],
        deliveryCharge: 4.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "ACI", countryOfOrigin: "Bangladesh",
        expiryDate: "2027-06-30", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 10,
        taxRate: 0.08, shippingWeight: "0.9 kg", dimensions: { length: 5, width: 4, height: 7, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Premium Black Tea 400g Online", metaDescription: "Order premium black tea 400g from BazarGhor.", metaKeywords: ["tea", "black tea", "beverage"] }
    },
    {
        id: 20,
        sku: "GB-DRY-020",
        barcode: "8941234567809",
        title: "Ajwa Dates 500g",
        slug: "ajwa-dates-500g",
        price: 9.99,
        originalPrice: 12.99,
        discountPercentage: 23,
        discountEndDate: "2026-11-10",
        isFlashSale: false,
        flashSaleStartTime: null,
        flashSaleEndTime: null,
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80",
        description: "Premium Ajwa dates from Saudi Arabia. Naturally sweet and nutritious.",
        shortDescription: "Premium Ajwa dates.",
        brand: MOCK_BRANDS[0], category: MOCK_CATEGORIES[7],
        weight: "500g", unit: "pack", packagingType: "Sealed Pouch",
        availableSizes: ["250g", "500g", "1kg"],
        availableColors: [],
        availableFlavors: [],
        stock: 50, stockStatus: "In Stock", lowStockThreshold: 5,
        rating: 4.9, reviewCount: 60, isBestSelling: true,
        tags: ["dates", "ajwa", "dry fruits"],
        deliveryCharge: 5.99, isFreeShipping: false, deliveryTime: "3-5 Business Days", returnPolicy: "30 Days Return",
        warranty: "No Warranty", seller: "Ghorer Bazar", countryOfOrigin: "Saudi Arabia",
        expiryDate: "2027-08-31", isCodAvailable: true, minOrderQuantity: 1, maxOrderQuantity: 6,
        taxRate: 0.08, shippingWeight: "1.2 kg", dimensions: { length: 6, width: 5, height: 8, unit: "inches" },
        condition: "New", returnWindow: "30 Days", paymentMethods: ["Visa", "Mastercard", "PayPal"],
        seo: { metaTitle: "Buy Premium Ajwa Dates 500g Online", metaDescription: "Order premium Ajwa dates 500g from BazarGhor.", metaKeywords: ["dates", "ajwa dates", "dry fruits"] }
    },
];