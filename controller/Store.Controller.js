import Store from "../module/Store.Module.js";

export const createStore = async (req, res) => {
  try {
    const store = new Store(req.body);
    await store.save();
    res.status(201).json({ message: "Store created successfully", store });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Store domain already taken" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.status(200).json({ message: "Store updated", store });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.status(200).json({ message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStoreAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const Order = (await import("../module/Order.Module.js")).default;
    const Product = (await import("../module/Product.Module.js")).default;

    const [
      totalOrders,
      deliveredOrders,
      totalRevenue,
      totalProfit,
      topProducts,
      lowStock,
    ] = await Promise.all([
      Order.countDocuments({ store_id: id }),
      Order.countDocuments({ store_id: id, status: "delivered" }),
      Order.aggregate([
        { $match: { store_id: id, "payment.status": "paid" } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
      Order.aggregate([
        { $match: { store_id: id, "payment.status": "paid" } },
        { $group: { _id: null, total: { $sum: "$analytics.total_profit" } } },
      ]),
      Product.find({ store_id: id, is_deleted: { $ne: true } })
        .sort({ product_quantity_sold: -1 })
        .limit(5)
        .select("product_name_en product_quantity_sold product_price"),
      Product.countDocuments({ store_id: id, product_quantity: { $lte: 5 }, is_deleted: { $ne: true } }),
    ]);

    res.status(200).json({
      totalOrders,
      deliveredOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProfit: totalProfit[0]?.total || 0,
      topProducts,
      lowStockCount: lowStock,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
