import Product from '../models/Product.js';
import fs from 'fs';
import csv from 'csv-parser';
import Shop from '../models/Shop.js';
import Supplier from '../models/Supplier.js';


// @desc    Create a product
// @route   POST /api/products
// @access  Private (Owner/Staff)
const createProduct = async (req, res) => {
    try {
        const {
            itemType,
            category,
            brand,
            productName,
            modelNumber,
            skuCode,
            hsnCode,
            unit,
            purchasePrice,
            sellingPrice,
            gstPercent,
            stockQuantity,
            warrantyMonths,
            guaranteeMonths,
            supplierId, // Optional
            images,
            imageUrl // Optional: single URL from frontend
        } = req.body;

        let finalImages = images ? (typeof images === 'string' ? JSON.parse(images) : images) : [];

        // Handle raw image URL or Base64
        if (imageUrl) {
            finalImages.unshift({ imageUrl: imageUrl });
        }

        // Ensure user belongs to a shop
        if (!req.user.shopId) {
            return res.status(400).json({ message: 'User is not assigned to any shop' });
        }

        const product = new Product({
            shopId: req.user.shopId,
            itemType,
            category,
            brand,
            productName,
            modelNumber,
            skuCode,
            hsnCode,
            unit,
            purchasePrice,
            sellingPrice,
            gstPercent,
            stockQuantity,
            warrantyMonths,
            guaranteeMonths,
            supplierId: supplierId || null,
            images: finalImages
        });

        const createdProduct = await product.save();

        // Update Shop's custom categories if this is a new category
        const shop = await Shop.findById(req.user.shopId);
        if (shop) {
            const catType = itemType === 'electrical' ? 'electrical' : 'electronics';
            if (!shop.customCategories[catType].includes(category)) {
                shop.customCategories[catType].push(category);
                await shop.save();
            }
        }

        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: 'Invalid product data', error: error.message });
    }
};

// @desc    Get all products for a shop (or all for Super Admin)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'superadmin') {
            // Super Admin can filter by shopId provided in query
            if (req.query.shopId) {
                query.shopId = req.query.shopId;
            }
            // If no shopId query, return all products (or paginate later)
        } else {
            // Shop Owner/Staff restricted to their shop
            if (!req.user.shopId) {
                return res.status(400).json({ message: 'User is not assigned to any shop' });
            }
            query.shopId = req.user.shopId;
        }

        const products = await Product.find(query).populate('shopId', 'shopName');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Owner)
const updateProduct = async (req, res) => {
    const {
        productName,
        sellingPrice,
        stockQuantity,
        imageUrl,
        images,
        // Add other fields as needed
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        // Verify shop ownership
        if (product.shopId.toString() !== req.user.shopId.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this product' });
        }

        const {
            itemType,
            category,
            brand,
            productName,
            modelNumber,
            skuCode,
            hsnCode,
            unit,
            purchasePrice,
            sellingPrice,
            gstPercent,
            stockQuantity,
            warrantyMonths,
            guaranteeMonths,
            supplierId,
            imageUrl,
            images
        } = req.body;

        let updatedImages = images ? (typeof images === 'string' ? JSON.parse(images) : images) : product.images;

        if (imageUrl) {
            updatedImages.unshift({ imageUrl: imageUrl });
        }

        product.itemType = itemType || product.itemType;
        product.category = category || product.category;
        product.brand = brand || product.brand;
        product.productName = productName || product.productName;
        product.modelNumber = modelNumber || product.modelNumber;
        product.skuCode = skuCode || product.skuCode;
        product.hsnCode = hsnCode || product.hsnCode;
        product.unit = unit || product.unit;
        product.purchasePrice = purchasePrice !== undefined ? purchasePrice : product.purchasePrice;
        product.sellingPrice = sellingPrice !== undefined ? sellingPrice : product.sellingPrice;
        product.gstPercent = gstPercent !== undefined ? gstPercent : product.gstPercent;
        product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
        product.warrantyMonths = warrantyMonths !== undefined ? warrantyMonths : product.warrantyMonths;
        product.guaranteeMonths = guaranteeMonths !== undefined ? guaranteeMonths : product.guaranteeMonths;
        product.supplierId = supplierId || product.supplierId;
        product.images = updatedImages;

        const updatedProduct = await product.save();

        // Update Shop's custom categories if this is a new category (for updates)
        const shop = await Shop.findById(req.user.shopId);
        if (shop) {
            const catType = (itemType || product.itemType) === 'electrical' ? 'electrical' : 'electronics';
            const finalCat = category || product.category;
            if (!shop.customCategories[catType].includes(finalCat)) {
                shop.customCategories[catType].push(finalCat);
                await shop.save();
            }
        }

        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Import products from CSV
// @route   POST /api/products/import
// @access  Private (Owner/SuperAdmin)
const importProducts = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    // If not superadmin, ensure user has a shop
    if (req.user.role !== 'superadmin' && !req.user.shopId) {
        return res.status(400).json({ message: 'User is not assigned to any shop' });
    }

    const results = [];
    const errors = [];
    let successCount = 0;

    // Helper to find shop and supplier
    // Helper to find shop and supplier - Imported at top

    fs.createReadStream(req.file.path)
        .pipe(csv({
            mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '') // Strip BOM and whitespace
        }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log(`[Import Log] Total Rows: ${results.length}`);
            if (results.length > 0) {
                console.log('[Import Log] Headers detected:', Object.keys(results[0]));
            }
            for (const row of results) {
                try {
                    let targetShopId = req.user.shopId;

                    // If Super Admin, look up shop by name provided in CSV
                    if (req.user.role === 'superadmin') {
                        if (!row.shopName) {
                            errors.push({ row: row.skuCode || 'Unknown', error: "Shop Name required for Super Admin import" });
                            continue;
                        }
                        const shop = await Shop.findOne({ shopName: row.shopName });
                        if (!shop) {
                            errors.push({ row: row.shopName, error: `Shop '${row.shopName}' not found` });
                            continue;
                        }
                        targetShopId = shop._id;
                    }

                    // Check if SKU exists in this shop
                    const productExists = await Product.findOne({
                        shopId: targetShopId,
                        skuCode: row.skuCode
                    });

                    if (!productExists) {
                        // Resolve Supplier if provided
                        let supplierId = null;
                        if (row.supplierName) {
                            // Find supplier by name AND shopId (suppliers are shop-specific)
                            const supplier = await Supplier.findOne({
                                shopId: targetShopId,
                                supplierName: new RegExp('^' + row.supplierName.trim() + '$', 'i') // Case insensitive match
                            });
                            if (supplier) {
                                supplierId = supplier._id;
                            }
                            // If not found, we just leave it null (optional field as per request)
                        }

                        // Parse Images: Splitting by comma if multiple and mapping to schema
                        const imageArray = row.images
                            ? row.images.split(',').map(url => ({ imageUrl: url.trim() }))
                            : [];

                        await Product.create({
                            shopId: targetShopId,
                            itemType: row.itemType ? row.itemType.toLowerCase() : 'electronics',
                            category: row.category,
                            brand: row.brand,
                            productName: row.productName,
                            modelNumber: row.modelNumber || '',
                            skuCode: row.skuCode,
                            hsnCode: row.hsnCode,
                            unit: row.unit || 'piece',
                            purchasePrice: Number(row.purchasePrice) || 0,
                            sellingPrice: Number(row.sellingPrice) || 0,
                            gstPercent: Number(row.gstPercent) || 18,
                            stockQuantity: Number(row.stockQuantity) || 0,
                            warrantyMonths: Number(row.warrantyMonths) || 0,
                            guaranteeMonths: Number(row.guaranteeMonths) || 0,
                            supplierId,
                            images: imageArray,
                            onSpecialOffer: row.onSpecialOffer === 'true' || row.onSpecialOffer === '1',
                            discountedPrice: Number(row.discountedPrice) || null,
                            isActive: true
                        });

                        // Update Shop's custom categories
                        const shop = await Shop.findById(targetShopId);
                        if (shop) {
                            const catType = (row.itemType ? row.itemType.toLowerCase() : 'electronics') === 'electrical' ? 'electrical' : 'electronics';
                            if (!shop.customCategories[catType].includes(row.category)) {
                                shop.customCategories[catType].push(row.category);
                                await shop.save();
                            }
                        }

                        successCount++;
                    } else {
                        // Optional: Update existing stock? For now, skip duplicates
                        errors.push({ sku: row.skuCode, error: "Duplicate SKU in this shop" });
                    }
                } catch (error) {
                    errors.push({ row: row, error: error.message });
                }
            }

            // Cleanup
            fs.unlinkSync(req.file.path);

            res.status(200).json({
                message: 'Import Processed',
                successCount,
                errors: errors.length > 0 ? errors : null
            });
        });
};


export { createProduct, getProducts, updateProduct, importProducts };
