import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Branch } from "./models/Branch.js";
import { Product } from "./models/Product.js";

export async function seedDatabase() {
  try {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount === 0) {
      console.log("Seeding default admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const adminUser = new User({
        name: "Super Admin",
        email: "admin@himcream.com",
        password: hashedPassword,
        role: "admin",
      });
      await adminUser.save();
      console.log("Default admin created (admin@himcream.com / admin123)");
    }

    const branchCount = await Branch.countDocuments({ name: "Katargam" });
    if (branchCount === 0) {
      console.log("Seeding Katargam branch...");
      const katargam = new Branch({
        name: "Katargam",
        location: "Katargam, Surat",
        managerName: "Katargam Manager",
        contact: "9876543210"
      });
      await katargam.save();

      const hashedPassword = await bcrypt.hash("katargam123", 10);
      const branchUser = new User({
        name: "Katargam Branch",
        email: "katargam@himcream.com",
        password: hashedPassword,
        role: "branch",
        branchId: katargam._id
      });
      await branchUser.save();

      // Seed 4-5 dummy products
      const dummyProducts = [
        {
          branchId: katargam._id,
          name: "Vanilla Classic Box",
          sku: "VAN-BOX-1L",
          category: "Ice Cream",
          unitType: "L",
          unitSize: 1,
          price: 250,
          currentStock: 10,
          lowStockThreshold: 2,
          imageUrl: "https://images.unsplash.com/photo-1570197781417-0c7f461ea5d7?auto=format&fit=crop&q=80&w=400"
        },
        {
          branchId: katargam._id,
          name: "Chocolate Cone",
          sku: "CHO-CON-100",
          category: "Cone",
          unitType: "mL",
          unitSize: 100,
          price: 60,
          currentStock: 50,
          lowStockThreshold: 10,
          imageUrl: "https://images.unsplash.com/photo-1559703248-dcaaec9fab78?auto=format&fit=crop&q=80&w=400"
        },
        {
          branchId: katargam._id,
          name: "Mango Magic Tub",
          sku: "MAN-TUB-500",
          category: "Ice Cream",
          unitType: "mL",
          unitSize: 500,
          price: 180,
          currentStock: 15,
          lowStockThreshold: 5,
          imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=400"
        },
        {
          branchId: katargam._id,
          name: "Orange Cold Candy",
          sku: "CAN-ORG-PCS",
          category: "Cold Candy",
          unitType: "pcs",
          unitSize: 1,
          price: 15,
          currentStock: 100,
          lowStockThreshold: 20,
          imageUrl: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&q=80&w=400"
        },
        {
          branchId: katargam._id,
          name: "Strawberry Cold Candy",
          sku: "CAN-STR-PCS",
          category: "Cold Candy",
          unitType: "pcs",
          unitSize: 1,
          price: 15,
          currentStock: 85,
          lowStockThreshold: 20,
          imageUrl: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=400"
        }
      ];
      await Product.insertMany(dummyProducts);
      console.log("Katargam branch and dummy products created (katargam@himcream.com / katargam123)");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
