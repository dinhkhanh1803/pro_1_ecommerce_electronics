import Product from "../models/Product.js";

const getProductId = (item) => item.product?._id || item.product;

const createInventoryError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

export const applyOrderInventory = async (order) => {
  if (!order || order.inventoryApplied) return;

  const updates = [];

  for (const item of order.products || []) {
    const productId = getProductId(item);
    const product = await Product.findById(productId);
    if (!product) {
      throw createInventoryError("Product not found while applying inventory.");
    }

    const variantName = String(item.variantName || "Default");
    const variantIndex = Array.isArray(product.variants)
      ? product.variants.findIndex((variant) => String(variant.name) === variantName)
      : -1;

    if (variantIndex < 0) {
      throw createInventoryError(`Variant '${variantName}' not found for product ${product.name}.`);
    }

    const available = Math.max(0, Number(product.variants[variantIndex].stock) || 0);
    const requested = Math.max(1, Number(item.quantity) || 1);

    if (requested > available) {
      throw createInventoryError(
        `Insufficient stock for ${product.name} - ${variantName}. Available: ${available}`,
      );
    }

    updates.push({ product, variantIndex, available, requested });
  }

  for (const update of updates) {
    update.product.variants[update.variantIndex].stock = update.available - update.requested;
    update.product.sales = (update.product.sales || 0) + update.requested;
    await update.product.save();
  }

  order.inventoryApplied = true;
};

export const restoreOrderInventory = async (order) => {
  if (!order || !order.inventoryApplied) return;

  for (const item of order.products || []) {
    const productId = getProductId(item);
    const product = await Product.findById(productId);
    if (!product) continue;

    const variantName = String(item.variantName || "Default");
    const variantIndex = Array.isArray(product.variants)
      ? product.variants.findIndex((variant) => String(variant.name) === variantName)
      : -1;

    if (variantIndex < 0) continue;

    const quantity = Math.max(1, Number(item.quantity) || 1);
    product.variants[variantIndex].stock = (Number(product.variants[variantIndex].stock) || 0) + quantity;
    product.sales = Math.max(0, (Number(product.sales) || 0) - quantity);
    await product.save();
  }

  order.inventoryApplied = false;
};
