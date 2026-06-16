import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const formatCart = (cartDoc) => {
  if (!cartDoc || !Array.isArray(cartDoc.items)) return [];
  return cartDoc.items
    .map(item => {
      if (!item.product) return null;
      const variantObj = item.product.variants?.find(v => v.name === item.variantName);
      const finalPrice = item.product.price + (variantObj?.priceAdd || 0);
      return {
        id: item.product._id.toString(),
        name: item.product.name,
        price: finalPrice,
        quantity: item.quantity,
        image: item.product.images?.[0] || 'https://via.placeholder.com/500',
        variantName: item.variantName,
        color: item.color,
        size: item.size,
        seller: item.product.seller ? item.product.seller.toString() : ""
      };
    })
    .filter(Boolean);
};

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name price images variants seller"
    });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(formatCart(cart));
  } catch (error) { next(error); }
};

export const addToCart = async (req, res, next) => {
  try {
    const { product, quantity = 1, variantName = "Default", color = "Default", size = "Default" } = req.body;
    if (!product) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === product &&
              item.variantName === variantName &&
              item.color === color &&
              item.size === size
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        product,
        variantName,
        color,
        size,
        quantity: Number(quantity)
      });
    }

    await cart.save();
    const populated = await cart.populate({
      path: "items.product",
      select: "name price images variants seller"
    });
    res.json(formatCart(populated));
  } catch (error) { next(error); }
};

export const updateCartQuantity = async (req, res, next) => {
  try {
    const { product, change, color = "Default", size = "Default" } = req.body;
    if (!product || change === undefined) {
      return res.status(400).json({ message: "Product ID and change value are required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === product &&
              item.color === color &&
              item.size === size
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + Number(change);
      if (newQty <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = newQty;
      }
      await cart.save();
    }

    const populated = await cart.populate({
      path: "items.product",
      select: "name price images variants seller"
    });
    res.json(formatCart(populated));
  } catch (error) { next(error); }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { product, color = "Default", size = "Default" } = req.query;
    if (!product) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(
        item => !(item.product.toString() === product &&
                  item.color === color &&
                  item.size === size)
      );
      await cart.save();
    } else {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const populated = await cart.populate({
      path: "items.product",
      select: "name price images variants seller"
    });
    res.json(formatCart(populated));
  } catch (error) { next(error); }
};

export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    } else {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json([]);
  } catch (error) { next(error); }
};

export const mergeCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    items.forEach(guestItem => {
      const existingIndex = cart.items.findIndex(
        item => item.product.toString() === guestItem.id &&
                item.variantName === (guestItem.variantName || "Default") &&
                item.color === (guestItem.color || "Default") &&
                item.size === (guestItem.size || "Default")
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += Number(guestItem.quantity || 1);
      } else {
        cart.items.push({
          product: guestItem.id,
          variantName: guestItem.variantName || "Default",
          color: guestItem.color || "Default",
          size: guestItem.size || "Default",
          quantity: Number(guestItem.quantity || 1)
        });
      }
    });

    await cart.save();
    const populated = await cart.populate({
      path: "items.product",
      select: "name price images variants seller"
    });
    res.json(formatCart(populated));
  } catch (error) { next(error); }
};
