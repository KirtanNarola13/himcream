import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { Branch } from "../models/Branch.js";
import { GlobalProduct } from "../models/GlobalProduct.js";
import { BranchProduct } from "../models/BranchProduct.js";
import { StockTransfer } from "../models/StockTransfer.js";
import { Sale } from "../models/Sale.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

const router = Router();
router.use(authenticate);
router.use(requireAdmin);

// BRANCHES
router.get("/branches", async (req, res) => {
  try {
    const branches = await Branch.find().lean();
    const branchesWithUsers = await Promise.all(
      branches.map(async (b) => {
        const hasUser = await User.exists({ branchId: b._id });
        return { ...b, hasUser: !!hasUser };
      })
    );
    res.json(branchesWithUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching branches" });
  }
});

router.post("/branches", async (req, res) => {
  try {
    const branch = new Branch(req.body);
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ message: "Error creating branch", error });
  }
});

router.put("/branches/:id", async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: "Error updating branch" });
  }
});

router.delete("/branches/:id", async (req, res) => {
  try {
    await Branch.findByIdAndDelete(req.params.id);
    await User.deleteMany({ branchId: req.params.id }); 
    res.json({ message: "Branch deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting branch" });
  }
});

// GLOBAL PRODUCTS
router.get("/products", async (req, res) => {
  try {
    const products = await GlobalProduct.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching global products" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const product = new GlobalProduct(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creating global product", error });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    // If adding stock, you might just do currentStock += extra
    if (req.body.addStock) {
       const product = await GlobalProduct.findById(req.params.id);
       if (!product) return res.status(404).json({ message: "Not found" });
       product.globalStock += Number(req.body.addStock);
       await product.save();
       return res.json(product);
    }
    const product = await GlobalProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error updating global product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    await GlobalProduct.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

// STOCK TRANSFERS
router.post("/transfer", async (req: any, res) => {
  try {
    const { globalProductId, branchId, quantity, transferRate } = req.body;
    const product = await GlobalProduct.findById(globalProductId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.globalStock < quantity) {
      return res.status(400).json({ message: "Insufficient global stock" });
    }

    product.globalStock -= quantity;
    await product.save();

    const transfer = new StockTransfer({
      globalProductId,
      branchId,
      quantity,
      transferRate,
      status: "pending",
      transferredBy: req.user.userId
    });
    
    await transfer.save();
    res.status(201).json({ message: "Stock transferred successfully", transfer });
  } catch (error) {
    res.status(500).json({ message: "Error transferring stock" });
  }
});

router.get("/transfer-logs", async (req, res) => {
  try {
    const logs = await StockTransfer.find()
      .populate("globalProductId")
      .populate("branchId")
      .populate("transferredBy")
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transfer logs" });
  }
});

// BRANCH DETAILS
router.get("/branches/:id/details", async (req, res) => {
  try {
    const branchId = req.params.id;
    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const products = await BranchProduct.find({ branchId }).populate('globalProductId');
    const { from, to } = req.query;
    
    let saleQuery: any = { branchId };
    if (from && to) {
      saleQuery.createdAt = {
        $gte: new Date(from as string),
        $lte: new Date(to as string)
      };
    }
    
    const sales = await Sale.find(saleQuery).populate('globalProductId').populate('soldBy').sort({ createdAt: -1 });

    res.json({
      branch,
      products,
      sales
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching branch details" });
  }
});

// REPORTS
router.get("/reports/all-branches", async (req, res) => {
  try {
    const branches = await Branch.find();
    
    const products = await BranchProduct.find().populate('globalProductId');
    let totalStockValue = 0;
    let lowStockCount = 0;
    
    products.forEach((p: any) => {
       totalStockValue += (p.currentStock * p.transferRate);
       if (p.currentStock <= p.lowStockThreshold) {
         lowStockCount++;
       }
    });

    // Today's Sales
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const todaySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }
    ]);
    
    const salesTotal = todaySales.length > 0 ? todaySales[0].totalAmount : 0;

    res.json({
      totalBranches: branches.length,
      totalStockValue,
      todaySales: salesTotal,
      lowStockAlerts: lowStockCount,
      allInventory: products
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating reports" });
  }
});

router.get("/reports/transfers", async (req, res) => {
  try {
    const { from, to, branchId } = req.query;
    let query: any = {};
    if (branchId) query.branchId = branchId;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from as string);
      if (to) query.createdAt.$lte = new Date(to as string);
    }
    const transfers = await StockTransfer.find(query).populate('branchId').populate('globalProductId').sort({ createdAt: -1 });
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transfers" });
  }
});

// Create Branch User (Admin helper)
router.post("/branch-users", async (req, res) => {
  try {
    const { branchId, name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name, email, password: hashedPassword, role: "branch", branchId
    });
    await user.save();
    res.json({ message: "Branch user created" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// Reset Branch User Password
router.put("/branch-users/reset-password", async (req, res) => {
  try {
    const { branchId, password } = req.body;
    const user = await User.findOne({ branchId });
    if (!user) return res.status(404).json({ message: "No user found for this branch" });
    
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
});

export default router;
