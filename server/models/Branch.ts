import mongoose, { Schema, Document } from "mongoose";

export interface IBranch extends Document {
  name: string;
  location: string;
  managerName: string;
  contact: string;
  createdAt: Date;
}

const BranchSchema = new Schema<IBranch>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  managerName: { type: String, required: true },
  contact: { type: String, required: true },
}, {
  timestamps: true
});

export const Branch = mongoose.model<IBranch>("Branch", BranchSchema);
