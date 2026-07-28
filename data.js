// ProcurePilot AI – Mock Data (INR Currency & Delivery Graph)

const SELLERS = [
  { id: 's1', name: 'TechNova Supplies', logo: '🏭', rating: 4.9, trustScore: 98, onTimeDelivery: 98, location: 'Bangalore', warehouseNode: 'Bangalore Central Hub', reliabilityBadge: 'Top Rated', categories: ['Electronics', 'IT Accessories'], responseTime: '< 1 hr' },
  { id: 's2', name: 'OfficeZen Pro', logo: '🏢', rating: 4.7, trustScore: 94, onTimeDelivery: 95, location: 'Mumbai', warehouseNode: 'Mumbai Central', reliabilityBadge: 'Verified', categories: ['Office Supplies', 'Furniture'], responseTime: '< 2 hrs' },
  { id: 's3', name: 'IndusCore Industrial', logo: '⚙️', rating: 4.6, trustScore: 91, onTimeDelivery: 93, location: 'Pune', warehouseNode: 'Pune Hub', reliabilityBadge: 'Verified', categories: ['Industrial Equipment', 'Packaging'], responseTime: '< 3 hrs' },
  { id: 's4', name: 'GreenSpace Interiors', logo: '🌿', rating: 4.8, trustScore: 96, onTimeDelivery: 97, location: 'Chennai', warehouseNode: 'Chennai Hub', reliabilityBadge: 'Premium', categories: ['Furniture', 'Office Supplies'], responseTime: '< 1 hr' },
  { id: 's5', name: 'CleanPro Solutions', logo: '✨', rating: 4.5, trustScore: 89, onTimeDelivery: 91, location: 'Hyderabad', warehouseNode: 'Hyderabad Logistics', reliabilityBadge: 'Verified', categories: ['Cleaning Supplies', 'Packaging'], responseTime: '< 4 hrs' },
  { id: 's6', name: 'DataCore Systems', logo: '💻', rating: 4.9, trustScore: 97, onTimeDelivery: 99, location: 'Delhi', warehouseNode: 'Delhi NCR Depot', reliabilityBadge: 'Elite', categories: ['Electronics', 'IT Accessories'], responseTime: '< 30 min' },
  { id: 's7', name: 'PackRight Co.', logo: '📦', rating: 4.4, trustScore: 87, onTimeDelivery: 89, location: 'Kolkata', warehouseNode: 'Hosur Logistics Park', reliabilityBadge: 'Standard', categories: ['Packaging Materials', 'Cleaning'], responseTime: '< 6 hrs' },
  { id: 's8', name: 'ErgoPlus Furniture', logo: '🪑', rating: 4.7, trustScore: 93, onTimeDelivery: 94, location: 'Bangalore', warehouseNode: 'Peenya Industrial Hub', reliabilityBadge: 'Verified', categories: ['Furniture', 'Office Supplies'], responseTime: '< 2 hrs' },
  { id: 's9', name: 'Swift Electro Hub', logo: '⚡', rating: 4.6, trustScore: 92, onTimeDelivery: 95, location: 'Mumbai', warehouseNode: 'Mumbai Central', reliabilityBadge: 'Verified', categories: ['Electronics', 'Industrial Equipment'], responseTime: '< 2 hrs' },
  { id: 's10', name: 'VisionTech Accessories', logo: '🔌', rating: 4.8, trustScore: 95, onTimeDelivery: 96, location: 'Chennai', warehouseNode: 'Chennai Hub', reliabilityBadge: 'Premium', categories: ['IT Accessories', 'Electronics'], responseTime: '< 1 hr' },
];

const CATEGORIES = ['Electronics', 'Office Supplies', 'Industrial Equipment', 'Furniture', 'IT Accessories', 'Cleaning Supplies', 'Packaging Materials'];

const PRODUCTS = [
  // Electronics
  { id: 'p1', name: 'Industrial Laptop Pro X1', category: 'Electronics', price: 68000, originalPrice: 76000, discount: 10, brand: 'TechForce', sellerId: 's1', stock: 48, safetyStock: 25, leadTimeDays: 3, dailySalesVelocity: 4, minOrder: 5, image: '💻', specs: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Intel i7-12th Gen', Display: '15.6" FHD', Battery: '8hrs', Weight: '1.8kg' }, deliveryDays: 2, confidenceScore: 98, rating: 4.8, reviews: 124, warranty: '3 years', bulkDiscount: '5% on 10+', ecoRating: 'B+', sustainabilityScore: 78, returnRate: 2 },
  { id: 'p2', name: 'UltraBook Business 14"', category: 'Electronics', price: 57600, originalPrice: 64000, discount: 10, brand: 'SlimTech', sellerId: 's6', stock: 12, safetyStock: 20, leadTimeDays: 2, dailySalesVelocity: 5, minOrder: 3, image: '💻', specs: { RAM: '8GB', Storage: '256GB SSD', Processor: 'AMD Ryzen 5', Display: '14" FHD', Battery: '10hrs', Weight: '1.4kg' }, deliveryDays: 1, confidenceScore: 95, rating: 4.7, reviews: 89, warranty: '2 years', bulkDiscount: '8% on 20+', ecoRating: 'A', sustainabilityScore: 85, returnRate: 3 },
  { id: 'p3', name: 'Corporate Desktop Tower', category: 'Electronics', price: 88000, originalPrice: 96000, discount: 8, brand: 'CoreMax', sellerId: 's9', stock: 180, safetyStock: 30, leadTimeDays: 4, dailySalesVelocity: 2, minOrder: 2, image: '🖥️', specs: { RAM: '32GB', Storage: '1TB SSD', Processor: 'Intel i9', Display: 'External', Ports: 'USB-C, HDMI' }, deliveryDays: 3, confidenceScore: 93, rating: 4.6, reviews: 67, warranty: '3 years', bulkDiscount: '6% on 5+', ecoRating: 'B', sustainabilityScore: 72, returnRate: 4 },
  { id: 'p4', name: '4K Curved Monitor 32"', category: 'Electronics', price: 33600, originalPrice: 40000, discount: 16, brand: 'VisionX', sellerId: 's6', stock: 75, safetyStock: 20, leadTimeDays: 2, dailySalesVelocity: 6, minOrder: 1, image: '🖥️', specs: { Resolution: '3840x2160', Panel: 'IPS', Refresh: '144Hz', Ports: 'HDMI 2.1, DP 1.4', Stand: 'Height Adjustable' }, deliveryDays: 2, confidenceScore: 96, rating: 4.9, reviews: 203, warranty: '3 years', bulkDiscount: '10% on 10+', ecoRating: 'A+', sustainabilityScore: 90, returnRate: 1 },
  { id: 'p5', name: 'Wireless Ergonomic Keyboard', category: 'Electronics', price: 6800, originalPrice: 8000, discount: 15, brand: 'TypeEase', sellerId: 's1', stock: 200, safetyStock: 40, leadTimeDays: 2, dailySalesVelocity: 15, minOrder: 10, image: '⌨️', specs: { Layout: 'Full Size', Connection: 'Bluetooth 5.0 + 2.4GHz', Battery: '24 months', Backlit: 'RGB', OS: 'Win/Mac' }, deliveryDays: 1, confidenceScore: 94, rating: 4.7, reviews: 312, warranty: '2 years', bulkDiscount: '12% on 50+', ecoRating: 'B+', sustainabilityScore: 76, returnRate: 2 },
  { id: 'p6', name: 'Enterprise WiFi Router 6E', category: 'Electronics', price: 27200, originalPrice: 30400, discount: 11, brand: 'NetSpeed Pro', sellerId: 's6', stock: 55, safetyStock: 15, leadTimeDays: 3, dailySalesVelocity: 3, minOrder: 1, image: '📡', specs: { Speed: '10 Gbps', Band: 'Tri-Band', Coverage: '5000 sq.ft', Ports: '4x Gigabit LAN', VPN: 'Built-in' }, deliveryDays: 2, confidenceScore: 97, rating: 4.8, reviews: 156, warranty: '3 years', bulkDiscount: '5% on 5+', ecoRating: 'B', sustainabilityScore: 74, returnRate: 1 },
  { id: 'p7', name: 'UPS Power Backup 1500VA', category: 'Electronics', price: 14400, originalPrice: 16800, discount: 14, brand: 'PowerSafe', sellerId: 's9', stock: 88, safetyStock: 25, leadTimeDays: 3, dailySalesVelocity: 4, minOrder: 2, image: '🔋', specs: { Capacity: '1500VA/900W', Backup: '45 min', Outlets: '8', Display: 'LCD', Protection: 'AVR' }, deliveryDays: 2, confidenceScore: 91, rating: 4.5, reviews: 98, warranty: '2 years', bulkDiscount: '8% on 10+', ecoRating: 'C', sustainabilityScore: 60, returnRate: 3 },
  { id: 'p8', name: 'Industrial Barcode Scanner', category: 'Electronics', price: 17600, originalPrice: 20000, discount: 12, brand: 'ScanTech', sellerId: 's1', stock: 8, safetyStock: 15, leadTimeDays: 4, dailySalesVelocity: 3, minOrder: 5, image: '📲', specs: { Type: '2D/1D', Range: '5m', Interface: 'USB/Bluetooth', IP: 'IP65', Drops: '1.8m' }, deliveryDays: 3, confidenceScore: 92, rating: 4.6, reviews: 74, warranty: '2 years', bulkDiscount: '10% on 20+', ecoRating: 'B', sustainabilityScore: 70, returnRate: 2 },
  { id: 'p9', name: 'Video Conferencing Camera 4K', category: 'Electronics', price: 24800, originalPrice: 28800, discount: 14, brand: 'MeetPro', sellerId: 's10', stock: 62, safetyStock: 20, leadTimeDays: 2, dailySalesVelocity: 4, minOrder: 1, image: '📷', specs: { Resolution: '4K 30fps', FOV: '120°', Zoom: '5x Digital', Mic: 'Built-in Array', Compat: 'Zoom, Teams, Meet' }, deliveryDays: 2, confidenceScore: 95, rating: 4.8, reviews: 187, warranty: '2 years', bulkDiscount: '7% on 5+', ecoRating: 'A', sustainabilityScore: 82, returnRate: 2 },
  { id: 'p10', name: 'Smart Projector 4500 Lumens', category: 'Electronics', price: 54400, originalPrice: 60000, discount: 9, brand: 'BrightCast', sellerId: 's9', stock: 18, safetyStock: 10, leadTimeDays: 5, dailySalesVelocity: 1, minOrder: 1, image: '📽️', specs: { Lumens: '4500', Resolution: 'Full HD 1080p', Throw: '1.3:1', Lamp: '20000hrs', HDMI: '2x' }, deliveryDays: 3, confidenceScore: 89, rating: 4.5, reviews: 52, warranty: '3 years', bulkDiscount: '5% on 3+', ecoRating: 'B', sustainabilityScore: 68, returnRate: 4 },

  // Office Supplies
  { id: 'p11', name: 'Premium A4 Copy Paper (Box)', category: 'Office Supplies', price: 3600, originalPrice: 4160, discount: 13, brand: 'PaperPlus', sellerId: 's2', stock: 500, safetyStock: 100, leadTimeDays: 1, dailySalesVelocity: 50, minOrder: 20, image: '📄', specs: { Weight: '80 GSM', Brightness: '102', Reams: '5 per box', Size: 'A4', Sheets: 500 }, deliveryDays: 1, confidenceScore: 96, rating: 4.8, reviews: 890, warranty: '—', bulkDiscount: '15% on 100+', ecoRating: 'A+', sustainabilityScore: 92, returnRate: 1 },
  { id: 'p12', name: 'Executive Ball Pen Set (50pk)', category: 'Office Supplies', price: 2240, originalPrice: 2800, discount: 20, brand: 'WriteFlow', sellerId: 's2', stock: 1000, safetyStock: 200, leadTimeDays: 1, dailySalesVelocity: 80, minOrder: 50, image: '✒️', specs: { Ink: 'Blue/Black/Red', Tip: '0.7mm', Type: 'Ballpoint', Grip: 'Rubber' }, deliveryDays: 1, confidenceScore: 93, rating: 4.6, reviews: 542, warranty: '—', bulkDiscount: '20% on 500+', ecoRating: 'B', sustainabilityScore: 65, returnRate: 1 },
  { id: 'p13', name: 'Laser Printer Toner HP Compatible', category: 'Office Supplies', price: 4960, originalPrice: 6000, discount: 17, brand: 'TonerKing', sellerId: 's2', stock: 340, safetyStock: 50, leadTimeDays: 2, dailySalesVelocity: 15, minOrder: 10, image: '🖨️', specs: { Yield: '2500 pages', Color: 'Black', Compat: 'HP LaserJet Series', OEM: 'Compatible' }, deliveryDays: 1, confidenceScore: 91, rating: 4.5, reviews: 328, warranty: '1 year', bulkDiscount: '18% on 50+', ecoRating: 'B+', sustainabilityScore: 74, returnRate: 3 },
  { id: 'p14', name: 'Professional Stapler Heavy Duty', category: 'Office Supplies', price: 3040, originalPrice: 3600, discount: 16, brand: 'StapleMax', sellerId: 's2', stock: 280, safetyStock: 40, leadTimeDays: 2, dailySalesVelocity: 10, minOrder: 5, image: '📎', specs: { Capacity: '100 sheets', Staples: 'Standard', Throat: '180mm', Type: 'Desktop' }, deliveryDays: 1, confidenceScore: 94, rating: 4.7, reviews: 234, warranty: '2 years', bulkDiscount: '10% on 20+', ecoRating: 'B', sustainabilityScore: 70, returnRate: 1 },
  { id: 'p15', name: 'Whiteboard Magnetic 120x90cm', category: 'Office Supplies', price: 7600, originalPrice: 8800, discount: 14, brand: 'BoardPro', sellerId: 's2', stock: 85, safetyStock: 20, leadTimeDays: 3, dailySalesVelocity: 4, minOrder: 2, image: '📋', specs: { Size: '120x90cm', Surface: 'Magnetic', Frame: 'Aluminium', Mounting: 'Wall/Stand' }, deliveryDays: 2, confidenceScore: 92, rating: 4.6, reviews: 156, warranty: '5 years', bulkDiscount: '8% on 10+', ecoRating: 'B+', sustainabilityScore: 75, returnRate: 2 },

  // Industrial Equipment
  { id: 'p21', name: 'Heavy Duty Pallet Jack 3T', category: 'Industrial Equipment', price: 30400, originalPrice: 33600, discount: 10, brand: 'LiftMaster', sellerId: 's3', stock: 15, safetyStock: 5, leadTimeDays: 5, dailySalesVelocity: 1, minOrder: 1, image: '🏗️', specs: { Capacity: '3000 kg', ForkLength: '1200mm', LiftHeight: '200mm', Material: 'Steel', Wheels: 'Polyurethane' }, deliveryDays: 5, confidenceScore: 88, rating: 4.5, reviews: 67, warranty: '3 years', bulkDiscount: '5% on 3+', ecoRating: 'C', sustainabilityScore: 55, returnRate: 3 },
  { id: 'p22', name: 'Industrial Air Compressor 50L', category: 'Industrial Equipment', price: 41600, originalPrice: 46400, discount: 10, brand: 'AirTech Pro', sellerId: 's3', stock: 8, safetyStock: 4, leadTimeDays: 7, dailySalesVelocity: 1, minOrder: 1, image: '⚙️', specs: { Tank: '50L', Pressure: '10 bar', Power: '2.5HP', Voltage: '230V', Noise: '68 dB' }, deliveryDays: 7, confidenceScore: 87, rating: 4.4, reviews: 43, warranty: '2 years', bulkDiscount: '3% on 2+', ecoRating: 'C+', sustainabilityScore: 58, returnRate: 4 },
  { id: 'p23', name: 'Warehouse Shelving Unit 5-Tier', category: 'Industrial Equipment', price: 16800, originalPrice: 19200, discount: 13, brand: 'ShelfMax', sellerId: 's3', stock: 60, safetyStock: 15, leadTimeDays: 4, dailySalesVelocity: 3, minOrder: 5, image: '🏭', specs: { Tiers: 5, LoadPerShelf: '200kg', Height: '1800mm', Width: '900mm', Material: 'Steel' }, deliveryDays: 4, confidenceScore: 90, rating: 4.6, reviews: 112, warranty: '5 years', bulkDiscount: '10% on 10+', ecoRating: 'B', sustainabilityScore: 70, returnRate: 2 },
  { id: 'p24', name: 'Electric Forklift 1.5T', category: 'Industrial Equipment', price: 680000, originalPrice: 736000, discount: 8, brand: 'LiftElec', sellerId: 's3', stock: 3, safetyStock: 2, leadTimeDays: 14, dailySalesVelocity: 0.2, minOrder: 1, image: '🚜', specs: { Capacity: '1500 kg', Battery: '48V/500Ah', Speed: '15 km/h', Height: '5.5m', Charge: '8 hrs' }, deliveryDays: 14, confidenceScore: 85, rating: 4.3, reviews: 22, warranty: '5 years', bulkDiscount: '3% on 2+', ecoRating: 'A+', sustainabilityScore: 88, returnRate: 5 },

  // Furniture
  { id: 'p31', name: 'Executive Ergonomic Chair', category: 'Furniture', price: 15600, originalPrice: 19200, discount: 19, brand: 'SpineComfort', sellerId: 's4', stock: 120, safetyStock: 30, leadTimeDays: 3, dailySalesVelocity: 8, minOrder: 5, image: '🪑', specs: { Adjustable: 'Height, Arms, Lumbar', Material: 'Mesh Back', Weight: '135 kg capacity', Recline: '135°', Wheels: '5-star nylon' }, deliveryDays: 2, confidenceScore: 97, rating: 4.9, reviews: 567, warranty: '5 years', bulkDiscount: '15% on 20+', ecoRating: 'B+', sustainabilityScore: 76, returnRate: 2 },
  { id: 'p32', name: 'Height-Adjustable Standing Desk', category: 'Furniture', price: 28000, originalPrice: 33600, discount: 17, brand: 'DeskUp Pro', sellerId: 's8', stock: 65, safetyStock: 15, leadTimeDays: 3, dailySalesVelocity: 4, minOrder: 2, image: '🪑', specs: { Height: '60-125cm', Surface: '140x70cm', Motor: 'Dual', Memory: '4 settings', Load: '80kg' }, deliveryDays: 3, confidenceScore: 94, rating: 4.8, reviews: 234, warranty: '5 years', bulkDiscount: '12% on 10+', ecoRating: 'A', sustainabilityScore: 85, returnRate: 3 },
  { id: 'p33', name: 'Conference Table 10-Seater', category: 'Furniture', price: 96000, originalPrice: 112000, discount: 14, brand: 'ConfRoom Pro', sellerId: 's4', stock: 8, safetyStock: 3, leadTimeDays: 7, dailySalesVelocity: 0.5, minOrder: 1, image: '🪑', specs: { Seats: 10, Size: '3000x1200mm', Material: 'Engineered Wood', Finish: 'Walnut Veneer', Cables: 'Cable management tray' }, deliveryDays: 7, confidenceScore: 91, rating: 4.7, reviews: 89, warranty: '10 years', bulkDiscount: '5% on 2+', ecoRating: 'B+', sustainabilityScore: 78, returnRate: 2 },

  // IT Accessories
  { id: 'p41', name: 'USB-C Docking Station 12-in-1', category: 'IT Accessories', price: 10000, originalPrice: 12000, discount: 17, brand: 'DockMaster', sellerId: 's10', stock: 180, safetyStock: 40, leadTimeDays: 2, dailySalesVelocity: 12, minOrder: 5, image: '🔌', specs: { Ports: '12', USB3: '4x', HDMI: '2x 4K', Ethernet: '1 Gbps', PD: '100W', SD: 'UHS-II' }, deliveryDays: 1, confidenceScore: 96, rating: 4.8, reviews: 456, warranty: '3 years', bulkDiscount: '12% on 20+', ecoRating: 'B+', sustainabilityScore: 76, returnRate: 2 },
  { id: 'p42', name: 'Optical Wireless Mouse Bulk (20pk)', category: 'IT Accessories', price: 14400, originalPrice: 17600, discount: 18, brand: 'ClickPro', sellerId: 's10', stock: 400, safetyStock: 80, leadTimeDays: 1, dailySalesVelocity: 25, minOrder: 20, image: '🖱️', specs: { DPI: '1600', Connection: '2.4GHz', Battery: 'AA x1', Buttons: 6, Compat: 'Win/Mac/Linux' }, deliveryDays: 1, confidenceScore: 94, rating: 4.7, reviews: 789, warranty: '2 years', bulkDiscount: '15% on 100+', ecoRating: 'B', sustainabilityScore: 68, returnRate: 1 },
  { id: 'p43', name: 'Network Switch 24-Port Gigabit', category: 'IT Accessories', price: 15600, originalPrice: 18400, discount: 15, brand: 'NetLink Pro', sellerId: 's6', stock: 42, safetyStock: 10, leadTimeDays: 2, dailySalesVelocity: 3, minOrder: 1, image: '🔌', specs: { Ports: '24 + 2 SFP', Speed: '1 Gbps', VLAN: 'Yes', PoE: 'Optional', Rack: '1U 19"' }, deliveryDays: 2, confidenceScore: 95, rating: 4.8, reviews: 234, warranty: '3 years', bulkDiscount: '8% on 5+', ecoRating: 'B+', sustainabilityScore: 74, returnRate: 1 },
  { id: 'p44', name: 'Surge Protector Power Strip 6-Way', category: 'IT Accessories', price: 2800, originalPrice: 3360, discount: 17, brand: 'SafeBoard', sellerId: 's10', stock: 600, safetyStock: 100, leadTimeDays: 1, dailySalesVelocity: 40, minOrder: 20, image: '🔌', specs: { Outlets: '6 + 3 USB', Joules: '2500J', Cord: '2m', Protection: 'Fire, Surge, Spike', Amps: '15A' }, deliveryDays: 1, confidenceScore: 93, rating: 4.7, reviews: 1234, warranty: '1 year', bulkDiscount: '20% on 100+', ecoRating: 'B', sustainabilityScore: 66, returnRate: 1 },

  // Cleaning Supplies
  { id: 'p51', name: 'Industrial Floor Cleaner 5L Concentrate', category: 'Cleaning Supplies', price: 3360, originalPrice: 4000, discount: 16, brand: 'CleanMax Pro', sellerId: 's5', stock: 800, safetyStock: 150, leadTimeDays: 1, dailySalesVelocity: 45, minOrder: 50, image: '🧹', specs: { Type: 'Concentrate', Dilution: '1:50', Volume: '5L', Fragrance: 'Pine', Surface: 'All hard floors' }, deliveryDays: 1, confidenceScore: 91, rating: 4.5, reviews: 456, warranty: '—', bulkDiscount: '20% on 200+', ecoRating: 'A+', sustainabilityScore: 88, returnRate: 1 },
  { id: 'p52', name: 'Microfibre Cleaning Cloth (100pk)', category: 'Cleaning Supplies', price: 4400, originalPrice: 5200, discount: 15, brand: 'FibreCare', sellerId: 's5', stock: 2000, safetyStock: 300, leadTimeDays: 1, dailySalesVelocity: 100, minOrder: 100, image: '🧽', specs: { Size: '40x40cm', GSM: 380, Colors: 'Assorted', Washable: '500+ times', Pack: 100 }, deliveryDays: 1, confidenceScore: 94, rating: 4.7, reviews: 678, warranty: '—', bulkDiscount: '25% on 500+', ecoRating: 'A+', sustainabilityScore: 95, returnRate: 0 },

  // Packaging Materials
  { id: 'p61', name: 'Corrugated Box Single Wall (50pk)', category: 'Packaging Materials', price: 3040, originalPrice: 3600, discount: 16, brand: 'BoxWorld', sellerId: 's7', stock: 5000, safetyStock: 1000, leadTimeDays: 1, dailySalesVelocity: 300, minOrder: 200, image: '📦', specs: { Size: '300x200x100mm', Wall: 'Single', Burst: '10 kg', Recyclable: 'Yes', Layers: 3 }, deliveryDays: 1, confidenceScore: 93, rating: 4.6, reviews: 345, warranty: '—', bulkDiscount: '25% on 1000+', ecoRating: 'A+', sustainabilityScore: 92, returnRate: 1 },
  { id: 'p62', name: 'Bubble Wrap Roll 50m x 50cm', category: 'Packaging Materials', price: 3840, originalPrice: 4640, discount: 17, brand: 'BubbleSafe', sellerId: 's7', stock: 800, safetyStock: 150, leadTimeDays: 1, dailySalesVelocity: 50, minOrder: 50, image: '📦', specs: { Length: '50m', Width: '50cm', Bubble: '10mm diameter', Type: 'Large Bubble', Material: 'LDPE' }, deliveryDays: 1, confidenceScore: 91, rating: 4.5, reviews: 234, warranty: '—', bulkDiscount: '20% on 200+', ecoRating: 'B', sustainabilityScore: 65, returnRate: 1 },
];

const ORDERS = [
  { id: 'ORD-2025-101', product: 'Industrial Laptop Pro X1', productId: 'p1', qty: 20, amount: 1360000, status: 'Delivered', date: '2025-06-15', seller: 'TechNova Supplies', stage: 4, approvalStatus: 'Approved', tracking: 'delivered' },
  { id: 'ORD-2025-102', product: 'Executive Ergonomic Chair', productId: 'p31', qty: 50, amount: 780000, status: 'In Transit', date: '2025-07-20', seller: 'GreenSpace Interiors', stage: 3, approvalStatus: 'Approved', tracking: 'in_transit' },
  { id: 'ORD-2025-103', product: '4K Curved Monitor 32"', productId: 'p4', qty: 10, amount: 336000, status: 'Pending Approval', date: '2025-07-28', seller: 'DataCore Systems', stage: 1, approvalStatus: 'Manager Review', tracking: 'pending' },
  { id: 'ORD-2025-104', product: 'USB-C Docking Station 12-in-1', productId: 'p41', qty: 30, amount: 300000, status: 'Processing', date: '2025-07-29', seller: 'VisionTech Accessories', stage: 2, approvalStatus: 'Finance Review', tracking: 'processing' },
  { id: 'ORD-2025-105', product: 'Premium A4 Copy Paper (Box)', productId: 'p11', qty: 200, amount: 720000, status: 'Delivered', date: '2025-05-10', seller: 'OfficeZen Pro', stage: 4, approvalStatus: 'Approved', tracking: 'delivered' },
];

const AI_RESPONSES = {
  'best supplier': 'Based on your purchase history and current data, **TechNova Supplies** is your best match for electronics — 98% on-time delivery, 98 Trust Score, and your negotiated contract pricing saves ~12% vs market rate.',
  'cheaper alternative': 'I found 3 cheaper alternatives! **UltraBook Business 14"** at ₹57,600 (vs ₹68,000) has similar specs with 95 Trust Score. Want me to do a side-by-side comparison?',
  'compare supplier': 'Here\'s a quick comparison:\n\n| Metric | TechNova | DataCore |\n|--------|----------|----------|\n| Price | ₹68,000 | ₹57,600 |\n| Trust | 98% | 97% |\n| Delivery | 2 days | 1 day |\n\nRecommendation: DataCore for faster delivery, TechNova for reliability.',
  'nearby': 'Found 3 suppliers within 50km of Bangalore via Dijkstra optimal routing:\n1. **TechNova Supplies** – 12km away (0.5 hrs), 48 units in stock\n2. **ErgoPlus Furniture** – 28km away (1.1 hrs)\n3. **GreenSpace Interiors** – 35km away (1.4 hrs)\nAll can deliver within 24-48 hours.',
  'tomorrow': 'Yes! **DataCore Systems** and **VisionTech Accessories** can deliver by tomorrow. Both have stock in local warehouses near Bangalore. Estimated delivery: before 6 PM tomorrow.',
  'budget': 'Based on your Q3 budget of ₹40,00,000 and current spend of ₹25,92,000, you have **₹14,08,000 remaining**. I recommend stocking up on IT accessories (prices up 8% next month) and office chairs (bulk discount expires Friday).',
  'trust score': 'Highest trust scores right now:\n1. **TechNova Supplies** – 98%\n2. **DataCore Systems** – 97%\n3. **GreenSpace Interiors** – 96%\n\nAll three have 95%+ on-time delivery. TechNova is your current preferred supplier.',
  'default': 'I\'m analyzing your procurement data... Based on your buying patterns and current market conditions, I recommend checking the **Recommended** tab for personalized suggestions. You can also ask me about specific products, suppliers, or delivery timelines!'
};

const BUYER = {
  name: 'Rahul Sharma',
  role: 'Procurement Manager',
  company: 'RetailCorp India Ltd.',
  email: 'rahul.sharma@retailcorp.in',
  budget: 4000000,
  spent: 2592000,
  avatar: 'RS',
  location: 'Bangalore Central Hub',
  preferredSellers: ['s1', 's4', 's6'],
  pendingOrders: 3,
  pendingApprovals: 2,
  priceAlerts: 4,
  savedSuppliers: 7,
};

const SELLER_USER = {
  name: 'Priya Mehta',
  role: 'Sales Manager',
  company: 'TechNova Supplies',
  email: 'priya@technova.in',
  avatar: 'PM',
  sellerId: 's1',
  monthlyRevenue: 22720000,
  totalOrders: 1247,
  pendingRFQs: 18,
  lowStockItems: 5,
};

// Delivery Logistics Network Graph for Dijkstra Algorithm
const DELIVERY_GRAPH = {
  nodes: [
    { id: 'Bangalore Central Hub', label: 'Bangalore Central Hub', type: 'buyer_loc', coords: { top: '62%', left: '35%' } },
    { id: 'Whitefield Whse', label: 'Whitefield Warehouse', type: 'warehouse', coords: { top: '60%', left: '38%' } },
    { id: 'Peenya Industrial Hub', label: 'Peenya Industrial Hub', type: 'warehouse', coords: { top: '65%', left: '32%' } },
    { id: 'Electronic City Whse', label: 'Electronic City Hub', type: 'warehouse', coords: { top: '66%', left: '36%' } },
    { id: 'Hosur Logistics Park', label: 'Hosur Logistics Park', type: 'hub', coords: { top: '70%', left: '37%' } },
    { id: 'Chennai Hub', label: 'Chennai Hub', type: 'hub', coords: { top: '72%', left: '42%' } },
    { id: 'Mumbai Central', label: 'Mumbai Central', type: 'hub', coords: { top: '40%', left: '22%' } },
    { id: 'Pune Hub', label: 'Pune Hub', type: 'hub', coords: { top: '42%', left: '25%' } },
    { id: 'Hyderabad Logistics', label: 'Hyderabad Logistics', type: 'hub', coords: { top: '55%', left: '38%' } },
    { id: 'Delhi NCR Depot', label: 'Delhi NCR Depot', type: 'hub', coords: { top: '18%', left: '40%' } },
  ],
  // Edges: [from, to, distanceKm, travelHours]
  edges: [
    ['Bangalore Central Hub', 'Whitefield Whse', 18, 0.6],
    ['Bangalore Central Hub', 'Peenya Industrial Hub', 14, 0.5],
    ['Bangalore Central Hub', 'Electronic City Whse', 22, 0.7],
    ['Whitefield Whse', 'Hosur Logistics Park', 28, 0.9],
    ['Electronic City Whse', 'Hosur Logistics Park', 15, 0.4],
    ['Hosur Logistics Park', 'Chennai Hub', 310, 5.5],
    ['Bangalore Central Hub', 'Chennai Hub', 345, 6.0],
    ['Bangalore Central Hub', 'Hyderabad Logistics', 570, 9.5],
    ['Bangalore Central Hub', 'Pune Hub', 840, 14.0],
    ['Pune Hub', 'Mumbai Central', 150, 2.5],
    ['Hyderabad Logistics', 'Delhi NCR Depot', 1250, 20.0],
    ['Mumbai Central', 'Delhi NCR Depot', 1400, 22.0],
  ]
};

// Expose globally
if (typeof window !== 'undefined') {
  window.APP_DATA = { SELLERS, PRODUCTS, ORDERS, AI_RESPONSES, BUYER, SELLER_USER, CATEGORIES, DELIVERY_GRAPH };
}
