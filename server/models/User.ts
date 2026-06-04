import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "branch" | "super_admin";
  branchId?: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "branch", "super_admin"], required: true },
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: false }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>("User", UserSchema);
