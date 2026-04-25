import Discount from "../module/Discount.Module.js";

export const createDiscount = async (req, res) => {
  try {
    const {
      user_id,
      discount_name_en,
      discount_name_ar,
      discount_code,
      discount_percentage,
      discount_type,
      discount_start_date,
      discount_end_date,
      discount_status,
      discount_max_usage,
      discount_min_order,
      discount_store_id,
    } = req.body;

    if (!discount_name_en || !discount_percentage || !discount_type || !discount_start_date || !discount_store_id || !user_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (discount_type === "percentage" && (discount_percentage < 0 || discount_percentage > 100)) {
      return res.status(400).json({ message: "Percentage must be between 0 and 100" });
    }

    const discount = new Discount({
      discount_name_en,
      discount_name_ar,
      discount_code: discount_code?.toUpperCase(),
      discount_percentage,
      discount_type,
      discount_start_date,
      discount_end_date,
      discount_status: discount_status || "active",
      discount_max_usage,
      discount_min_order: discount_min_order || 0,
      discount_store_id,
      created_by: user_id,
      updated_by: user_id,
    });

    await discount.save();
    res.status(201).json({ message: "Discount created successfully", discount });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Discount code already exists for this store" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllDiscountsByStoreId = async (req, res) => {
  try {
    const { store_id } = req.params;
    const discounts = await Discount.find({ discount_store_id: store_id }).sort({ createdAt: -1 });
    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return res.status(404).json({ message: "Discount not found" });
    res.status(200).json(discount);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const validateDiscountCode = async (req, res) => {
  try {
    const { code, store_id, order_amount } = req.body;

    const discount = await Discount.findOne({
      discount_code: code.toUpperCase(),
      discount_store_id: store_id,
      discount_status: "active",
    });

    if (!discount) return res.status(404).json({ message: "Invalid discount code" });
    if (discount.discount_end_date && new Date() > discount.discount_end_date) {
      return res.status(400).json({ message: "Discount code has expired" });
    }
    if (discount.discount_max_usage && discount.discount_used_count >= discount.discount_max_usage) {
      return res.status(400).json({ message: "Discount usage limit reached" });
    }
    if (order_amount && order_amount < discount.discount_min_order) {
      return res.status(400).json({ message: `Minimum order amount is ${discount.discount_min_order}` });
    }

    const savings = discount.discount_type === "percentage"
      ? ((order_amount || 0) * discount.discount_percentage) / 100
      : discount.discount_percentage;

    res.status(200).json({ valid: true, discount, savings });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDiscount = async (req, res) => {
  try {
    const {id} = req.params;
    const {
      user_id,
      discount_name_en,
      discount_name_ar,
      discount_percentage,
      discount_type,
      discount_start_date,
      discount_end_date,
      discount_status,
      discount_max_usage,
      discount_min_order,
    } = req.body;
    const discount = await Discount.findByIdAndUpdate(id, {
      discount_name_en,
      discount_name_ar,
      discount_code: discount_code?.toUpperCase(),
      discount_percentage,
      discount_type,
      discount_start_date,
      discount_end_date,
      discount_status,
      discount_max_usage,
      discount_min_order,
      updated_by: user_id,
    }, { new: true });
    if (!discount) return res.status(404).json({ message: "Discount not found" });
    res.status(200).json({ message: "Discount updated", discount });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDiscount = async (req, res) => {
  try{
    const {id} = req.params;
    const {user_id} = req.body;
    if(!user_id) return res.status(400).json({message: "Missing required fields"});
    const discount = await Discount.findByIdAndUpdate(
      id,
      { is_deleted: true ,
        updated_by: req.body.user_id,
      },
      { new: true },
    ); 
    if (!discount) return res.status(404).json({ message: "Discount not found" });
    res.status(200).json({ message: "Discount deleted" });
  }catch(error){
    res.status(500).json({ message: "Internal server error" });
  }
};

export const applyDiscountCodeForOrder = async (discount_code , store_id , orderAmount) => {
  const discount = await Discount.findOne({
    discount_code: discount_code.toUpperCase(),
    discount_store_id: store_id,
    discount_status: "active",
  });

  if (!discount) throw new Error("Invalid discount code");
  if (discount.discount_end_date && new Date() > discount.discount_end_date) {
    throw new Error("Discount code has expired");
  }
  if (discount.discount_max_usage && discount.discount_used_count >= discount.discount_max_usage) {
    throw new Error("Discount usage limit reached");
  }
  if (orderAmount && orderAmount < discount.discount_min_order) {
    throw new Error(`Minimum order amount is ${discount.discount_min_order}`);
  }

  const savings = discount.discount_type === "percentage"
    ? ((orderAmount || 0) * discount.discount_percentage) / 100
    : discount.discount_percentage;

  return { discount, savings };
};
