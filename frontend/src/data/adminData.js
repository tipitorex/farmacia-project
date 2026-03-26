export const dashboardKpis = [
  { label: "Ventas hoy", value: "Bs 12.430", trend: "+8.2%" },
  { label: "Pedidos pendientes", value: "24", trend: "-3.1%" },
  { label: "Stock critico", value: "17", trend: "+2 alertas" },
  { label: "Clientes activos", value: "1.284", trend: "+5.4%" },
];

export const recentOrders = [
  { id: "ORD-3021", customer: "Ana Rojas", total: "Bs 188.50", status: "Preparando" },
  { id: "ORD-3020", customer: "Carlos Tola", total: "Bs 76.00", status: "Despachado" },
  { id: "ORD-3019", customer: "Lucia Perez", total: "Bs 240.20", status: "Pendiente" },
  { id: "ORD-3018", customer: "Marta Ruiz", total: "Bs 98.30", status: "Entregado" },
];

export const adminProducts = [
  { sku: "MED-001", name: "Ibuprofeno 400mg x20", category: "Medicamentos", stock: 112, price: "Bs 18.50", status: "Activo" },
  { sku: "VIT-010", name: "Multivitaminico x60", category: "Vitaminas", stock: 43, price: "Bs 79.90", status: "Activo" },
  { sku: "DER-027", name: "Protector solar FPS 50", category: "Dermocosmetica", stock: 9, price: "Bs 92.00", status: "Stock bajo" },
  { sku: "HIG-212", name: "Jabon antibacterial 500ml", category: "Higiene", stock: 67, price: "Bs 26.40", status: "Activo" },
  { sku: "BEB-055", name: "Panal talla M x40", category: "Mama y Bebe", stock: 0, price: "Bs 58.90", status: "Sin stock" },
];

export const adminSections = [
  { id: "overview", label: "Resumen", icon: "dashboard" },
  { id: "users", label: "Usuarios", icon: "users" },
  { id: "inventory", label: "Inventario", icon: "inventory" },
  { id: "customers", label: "Clientes", icon: "customers" },
  { id: "settings", label: "Configuracion", icon: "settings" },
];
