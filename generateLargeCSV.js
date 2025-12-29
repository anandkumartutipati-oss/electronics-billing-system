const fs = require('fs');

const shops = ['Alpha Electronics', 'Beta Electricals', 'Gamma Gadgets'];
const categories = ['Fan', 'Switch', 'Wire', 'Mixer', 'Iron', 'AC', 'Fridge', 'Heater', 'MCB', 'Bulb'];
const brands = ['Samsung', 'LG', 'Philips', 'Havells', 'Crompton', 'Bajaj', 'Usha', 'Anchor', 'Legrand'];
const imageUrl = 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800';

// Added supplierName to header
const header = "shopName,itemType,category,brand,productName,modelNumber,skuCode,hsnCode,unit,purchasePrice,sellingPrice,gstPercent,stockQuantity,warrantyMonths,guaranteeMonths,supplierName,images";

let csvContent = header + "\n";

for (let i = 1; i <= 200; i++) {
    const shop = shops[Math.floor(Math.random() * shops.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const itemType = (['Switch', 'Wire', 'MCB', 'Bulb'].includes(category)) ? 'electrical' : 'electronics';

    // Pick a random supplier for this shop (A, B, or C) - matching the seeder logic
    const supplierSuffix = ['Supplier A', 'Supplier B', 'Supplier C'][Math.floor(Math.random() * 3)];
    const supplierName = `${shop} ${supplierSuffix}`;

    // Generate some prices based on category
    let basePrice = 100;
    if (category === 'AC') basePrice = 25000;
    if (category === 'Fridge') basePrice = 15000;
    if (category === 'Fan') basePrice = 1200;
    if (category === 'Switch') basePrice = 50;

    const purchasePrice = Math.floor(basePrice + Math.random() * (basePrice * 0.2));
    const sellingPrice = Math.floor(purchasePrice * 1.3);

    const row = [
        shop,
        itemType,
        category,
        brand,
        `${brand} ${category} ${i}`,
        `MOD-${1000 + i}`,
        `SKU-${10000 + i}`,
        `HSN${8000 + i}`,
        'piece',
        purchasePrice,
        sellingPrice,
        18,
        Math.floor(Math.random() * 50) + 1,
        12,
        0,
        supplierName, // Add supplier name here
        imageUrl
    ];

    csvContent += row.join(',') + "\n";
}

fs.writeFileSync('products_large_import.csv', csvContent);
console.log('products_large_import.csv has been generated with suppliers!');
