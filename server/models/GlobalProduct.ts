import mongoose, { Schema, Document } from "mongoose";

export interface IGlobalProduct extends Document {
  name: string;
  sku: string;
  category: string;
  unitType: "L" | "mL" | "pcs";
  unitSize: number;
  purchaseRate: number;
  sellRate: number;
  globalStock: number;
  imageUrl: string;
  createdAt: Date;
}

const GlobalProductSchema = new Schema<IGlobalProduct>({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  unitType: { type: String, enum: ["L", "mL", "pcs"], required: true },
  unitSize: { type: Number, required: true },
  purchaseRate: { type: Number, required: true },
  sellRate: { type: Number, required: true },
  globalStock: { type: Number, required: true, default: 0 },
  imageUrl: { type: String, default: "" },
}, {
  timestamps: true
});

export const GlobalProduct = mongoose.model<IGlobalProduct>("GlobalProduct", GlobalProductSchema);
