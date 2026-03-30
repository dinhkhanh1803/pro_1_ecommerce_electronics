import User from "../models/User.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let filter = {};
    if (role && role !== "all") filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    
    // We map over users to add a mock "orders" count for simplicity since we don't have an extensive order history built out yet.
    const mappedUsers = users.map(u => {
      const uObj = u.toObject();
      uObj.orders = Math.floor(Math.random() * 20); // mock orders
      return uObj;
    });

    res.json(mappedUsers);
  } catch (err) { next(err); }
};

export const toggleUserLock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = user.status === "active" ? "locked" : "active";
    await user.save();
    res.json(user);
  } catch (err) { next(err); }
};
