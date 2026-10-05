require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const Repair = require('../models/Repair');
const Settings = require('../models/Settings');
const ActivityLog = require('../models/ActivityLog');

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    console.log('--- Starting Data Seeding for MobileMate ---');

    // 1. Clear existing non-user collections
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Supplier.deleteMany({}),
      Purchase.deleteMany({}),
      Sale.deleteMany({}),
      Repair.deleteMany({}),
      Settings.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);
    console.log('Cleared previous database collections.');

    // 2. Seed Users
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('Admin@123', salt);

    const admin = await User.create({
      name: 'MobileMate Admin',
      email: 'admin@mobilemate.com',
      password,
      role: 'admin',
      isActive: true,
    });

    const manager = await User.create({
      name: 'Tariq Manager',
      email: 'manager@mobilemate.com',
      password,
      role: 'manager',
      isActive: true,
    });

    const cashier = await User.create({
      name: 'Bilal Cashier',
      email: 'cashier@mobilemate.com',
      password,
      role: 'cashier',
      isActive: true,
    });

    console.log('Seeded Users: Admin, Manager, Cashier');

    // 3. Seed Settings
    await Settings.create({
      shopName: 'MobileMate Store',
      address: 'Shop #14, Main Electronics Market, Liberty Road, Lahore',
      phone: '+92 300 1234567',
      logoUrl: '',
      currency: 'PKR',
      invoiceFooterText: 'Thank you for choosing MobileMate! Warranty valid for 7 days with invoice.',
      productCategories: ['phone', 'accessory'],
    });
    console.log('Seeded Settings');

    // 4. Seed Suppliers
    const suppliers = await Supplier.create([
      {
        name: 'Apex Cellular Distributors',
        contact: '+92 321 9876543',
        email: 'sales@apexcellular.com',
        address: 'Plaza #4, Hall Road, Lahore',
      },
      {
        name: 'Galaxy Accessories Hub',
        contact: '+92 333 4567890',
        email: 'orders@galaxyacc.pk',
        address: 'Shop 12, Hafeez Center, Gulberg, Lahore',
      },
      {
        name: 'Prime Parts & Tech Imports',
        contact: '+92 301 2345678',
        email: 'support@primepartstech.com',
        address: 'Electronics Market, Saddar, Karachi',
      },
      {
        name: 'Anker Official Wholesale PK',
        contact: '+92 345 6789012',
        email: 'b2b@ankerpk.com',
        address: 'Blue Area, Islamabad',
      },
    ]);
    console.log(`Seeded ${suppliers.length} Suppliers`);

    // 5. Seed Customers
    const customers = await Customer.create([
      { name: 'Ali Raza', phone: '03001122334', email: 'ali.raza@gmail.com', address: 'DHA Phase 5, Lahore' },
      { name: 'Usman Farooq', phone: '03214455667', email: 'usman.f@yahoo.com', address: 'Model Town, Lahore' },
      { name: 'Zainab Bibi', phone: '03337788990', email: 'zainab.b@gmail.com', address: 'Johar Town, Lahore' },
      { name: 'Hamza Sheikh', phone: '03129988776', email: 'hamza.s@outlook.com', address: 'Gulberg III, Lahore' },
      { name: 'Fatima Noor', phone: '03451239874', email: 'fatima.noor@hotmail.com', address: 'Bahria Town, Lahore' },
      { name: 'Kamran Akmal', phone: '03025566778', email: 'kamran.a@gmail.com', address: 'Wapda Town, Lahore' },
      { name: 'Sara Khan', phone: '03248899001', email: 'sara.k@gmail.com', address: 'Cantt, Lahore' },
      { name: 'Bilal Ahmed', phone: '03312233445', email: 'bilal.ahmed@yahoo.com', address: 'Garden Town, Lahore' },
    ]);
    console.log(`Seeded ${customers.length} Customers`);

    // 6. Seed Products
    const products = await Product.create([
      {
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        model: '256GB Natural Titanium',
        imeiOrSku: 'IMEI-864920061234561',
        category: 'phone',
        subCategory: 'Flagship Smartphone',
        costPrice: 420000,
        salePrice: 475000,
        stockQty: 8,
        lowStockThreshold: 3,
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        model: '512GB Titanium Gray',
        imeiOrSku: 'IMEI-358912061234562',
        category: 'phone',
        subCategory: 'Flagship Smartphone',
        costPrice: 380000,
        salePrice: 425000,
        stockQty: 6,
        lowStockThreshold: 2,
        imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Xiaomi Redmi Note 13 Pro+',
        brand: 'Xiaomi',
        model: '256GB Midnight Black',
        imeiOrSku: 'IMEI-869912061234563',
        category: 'phone',
        subCategory: 'Mid-Range Smartphone',
        costPrice: 95000,
        salePrice: 112000,
        stockQty: 14,
        lowStockThreshold: 4,
        imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Infinix Note 40 Pro',
        brand: 'Infinix',
        model: '256GB Vintage Green',
        imeiOrSku: 'IMEI-352912061234564',
        category: 'phone',
        subCategory: 'Budget Smartphone',
        costPrice: 58000,
        salePrice: 69999,
        stockQty: 18,
        lowStockThreshold: 5,
        imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Google Pixel 8 Pro',
        brand: 'Google',
        model: '128GB Obsidian',
        imeiOrSku: 'IMEI-356912061234565',
        category: 'phone',
        subCategory: 'Flagship Smartphone',
        costPrice: 220000,
        salePrice: 255000,
        stockQty: 4,
        lowStockThreshold: 2,
        imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Tecno Spark 20 Pro+',
        brand: 'Tecno',
        model: '256GB Lunar Frost',
        imeiOrSku: 'IMEI-351912061234566',
        category: 'phone',
        subCategory: 'Budget Smartphone',
        costPrice: 42000,
        salePrice: 51999,
        stockQty: 2,
        lowStockThreshold: 5,
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'OnePlus 12',
        brand: 'OnePlus',
        model: '256GB Silky Black',
        imeiOrSku: 'IMEI-867912061234567',
        category: 'phone',
        subCategory: 'Flagship Smartphone',
        costPrice: 210000,
        salePrice: 245000,
        stockQty: 5,
        lowStockThreshold: 2,
        imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Apple AirPods Pro (2nd Gen, USB-C)',
        brand: 'Apple',
        model: 'MagSafe USB-C',
        imeiOrSku: 'SKU-APP-AIRPODSPRO2-USBC',
        category: 'accessory',
        subCategory: 'Earbuds',
        costPrice: 62000,
        salePrice: 74500,
        stockQty: 12,
        lowStockThreshold: 3,
        imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Samsung 45W Super Fast Power Adapter',
        brand: 'Samsung',
        model: 'EP-T4510',
        imeiOrSku: 'SKU-SAM-45W-CHG',
        category: 'accessory',
        subCategory: 'Charger',
        costPrice: 9500,
        salePrice: 13500,
        stockQty: 25,
        lowStockThreshold: 6,
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Anker 322 Braided USB-C to Lightning Cable',
        brand: 'Anker',
        model: '0.9m Black',
        imeiOrSku: 'SKU-ANK-C2L-09M',
        category: 'accessory',
        subCategory: 'Cable',
        costPrice: 3200,
        salePrice: 4800,
        stockQty: 40,
        lowStockThreshold: 10,
        imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Baseus 20000mAh 65W Power Bank',
        brand: 'Baseus',
        model: 'Blade HD Digital Display',
        imeiOrSku: 'SKU-BAS-PB-65W-20K',
        category: 'accessory',
        subCategory: 'Power Bank',
        costPrice: 16500,
        salePrice: 22000,
        stockQty: 9,
        lowStockThreshold: 3,
        imageUrl: 'https://images.unsplash.com/photo-1609592807664-874249a56767?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Torras Shockproof Magnetic Case (iPhone 15 Pro)',
        brand: 'Torras',
        model: 'Guardian Series MagSafe',
        imeiOrSku: 'SKU-TOR-CASE-IP15P-BLK',
        category: 'accessory',
        subCategory: 'Case & Cover',
        costPrice: 5500,
        salePrice: 8500,
        stockQty: 3,
        lowStockThreshold: 5,
        imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Joyroom JR-T03S Pro TWS Earbuds',
        brand: 'Joyroom',
        model: 'T03S Pro ANC',
        imeiOrSku: 'SKU-JOY-T03SPRO-WHT',
        category: 'accessory',
        subCategory: 'Earbuds',
        costPrice: 5800,
        salePrice: 8200,
        stockQty: 22,
        lowStockThreshold: 5,
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Apple 20W USB-C Power Adapter',
        brand: 'Apple',
        model: 'MHJE3ZM/A',
        imeiOrSku: 'SKU-APP-20W-CHG',
        category: 'accessory',
        subCategory: 'Charger',
        costPrice: 11000,
        salePrice: 14500,
        stockQty: 18,
        lowStockThreshold: 5,
        imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: '9D Tempered Glass Screen Protector',
        brand: 'Generic',
        model: '9D Glass',
        imeiOrSku: 'SKU-GLASS-9D-UNIV',
        category: 'accessory',
        subCategory: 'Screen Protector',
        costPrice: 300,
        salePrice: 800,
        stockQty: 100,
        lowStockThreshold: 20,
        imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
    ]);
    console.log(`Seeded ${products.length} Products`);

    // 7. Seed Purchases
    const purchases = await Purchase.create([
      {
        supplier: suppliers[0]._id,
        items: [
          { product: products[0]._id, quantity: 10, costPrice: 420000 },
          { product: products[1]._id, quantity: 8, costPrice: 380000 },
        ],
        totalCost: 10 * 420000 + 8 * 380000,
        purchaseDate: new Date(Date.now() - 25 * 86400000),
        recordedBy: admin._id,
      },
      {
        supplier: suppliers[1]._id,
        items: [
          { product: products[7]._id, quantity: 20, costPrice: 62000 },
          { product: products[8]._id, quantity: 30, costPrice: 9500 },
          { product: products[9]._id, quantity: 50, costPrice: 3200 },
        ],
        totalCost: 20 * 62000 + 30 * 9500 + 50 * 3200,
        purchaseDate: new Date(Date.now() - 15 * 86400000),
        recordedBy: manager._id,
      },
      {
        supplier: suppliers[3]._id,
        items: [
          { product: products[11]._id, quantity: 10, costPrice: 31000 },
          { product: products[13]._id, quantity: 20, costPrice: 11000 },
        ],
        totalCost: 10 * 31000 + 20 * 11000,
        purchaseDate: new Date(Date.now() - 5 * 86400000),
        recordedBy: admin._id,
      },
    ]);
    console.log(`Seeded ${purchases.length} Purchases`);

    // 8. Seed Sales across past 30 days
    const paymentMethods = ['cash', 'card', 'bank_transfer', 'mobile_wallet'];
    const salesData = [];
    let invoiceCounter = 1001;

    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const salesCountToday = Math.floor(Math.random() * 3) + 1;
      for (let s = 0; s < salesCountToday; s++) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const randomProd1 = products[Math.floor(Math.random() * products.length)];
        const randomProd2 = products[Math.floor(Math.random() * products.length)];

        const items = [
          {\n            product: randomProd1._id,
            name: randomProd1.name,
            quantity: Math.floor(Math.random() * 2) + 1,
            salePrice: randomProd1.salePrice,
          },
        ];

        if (randomProd1._id.toString() !== randomProd2._id.toString() && Math.random() > 0.5) {
          items.push({
            product: randomProd2._id,
            name: randomProd2.name,
            quantity: Math.floor(Math.random() * 2) + 1,
            salePrice: randomProd2.salePrice,
          });
        }

        const subtotal = items.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
        const tax = 0;
        const total = subtotal;

        const saleDate = new Date();
        saleDate.setDate(saleDate.getDate() - dayOffset);
        saleDate.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

        salesData.push({
          invoiceNo: `INV-${invoiceCounter++}`,
          items,
          customer: randomCustomer._id,
          subtotal,
          tax,
          total,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          cashier: cashier._id,
          saleDate,
        });
      }
    }

    const sales = await Sale.create(salesData);
    console.log(`Seeded ${sales.length} Sales invoices across past 30 days.`);

    // 9. Seed Repairs
    const repairs = await Repair.create([
      {
        customer: customers[0]._id,
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 13',
        issueDescription: 'Cracked OLED screen and battery replacement',
        status: 'in-progress',
        estimatedCost: 35000,
        finalCost: 35000,
        technicianNotes: 'New screen panel assigned, testing battery calibration.',
        receivedBy: manager._id,
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        customer: customers[1]._id,
        deviceBrand: 'Samsung',
        deviceModel: 'Galaxy S22 Ultra',
        issueDescription: 'Charging port not responding (Water damage)',
        status: 'received',
        estimatedCost: 18000,
        technicianNotes: 'Sub-board replacement required.',
        receivedBy: cashier._id,
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        customer: customers[2]._id,
        deviceBrand: 'Xiaomi',
        deviceModel: 'Poco X3 Pro',
        issueDescription: 'Dead motherboard (PMIC issue / restart loop)',
        status: 'completed',
        estimatedCost: 15000,
        finalCost: 15000,
        technicianNotes: 'PMIC reballed successfully. Tested OK.',
        receivedBy: manager._id,
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        customer: customers[3]._id,
        deviceBrand: 'OnePlus',
        deviceModel: 'OnePlus 9 Pro',
        issueDescription: 'Back glass repair and camera lens glass replacement',
        status: 'delivered',
        estimatedCost: 12000,
        finalCost: 12000,
        technicianNotes: 'Customer picked up device.',
        receivedBy: cashier._id,
        createdAt: new Date(Date.now() - 7 * 86400000),
      },
      {
        customer: customers[4]._id,
        deviceBrand: 'Google',
        deviceModel: 'Pixel 7',
        issueDescription: 'Speaker distortion during calls',
        status: 'in-progress',
        estimatedCost: 8500,
        technicianNotes: 'Ear speaker module replacement in progress.',
        receivedBy: manager._id,
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        customer: customers[5]._id,
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 14',
        issueDescription: 'Camera optical stabilization vibration issue',
        status: 'received',
        estimatedCost: 24000,
        technicianNotes: 'Awaiting rear camera module delivery from supplier.',
        receivedBy: admin._id,
        createdAt: new Date(),
      },
    ]);
    console.log(`Seeded ${repairs.length} Repair job tickets.`);

    // 10. Seed Activity Logs
    await ActivityLog.create([
      {\n        user: admin._id,
        action: 'System Initialized',
        entityType: 'Settings',
        details: 'Initial shop setup & configuration completed.',
      },
      {
        user: manager._id,
        action: 'Purchase Order Created',
        entityType: 'Purchase',
        entityId: purchases[0]._id,
        details: `Recorded purchase order from ${suppliers[0].name}`,
      },
      {
        user: cashier._id,
        action: 'POS Checkout',
        entityType: 'Sale',
        entityId: sales[sales.length - 1]._id,
        details: `Completed sale invoice ${sales[sales.length - 1].invoiceNo}`,
      },
      {
        user: manager._id,
        action: 'Repair Status Updated',
        entityType: 'Repair',
        entityId: repairs[0]._id,
        details: 'Updated repair ticket status to in-progress',
      },
    ]);
    console.log('Seeded Activity Logs.');

    console.log('--- Data Seeding Successfully Completed! ---');
  } catch (err) {
    console.error('Error during seeding:', err);
    throw err;
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))\n    .catch(() => process.exit(1));
}

module.exports = seedDatabase;
