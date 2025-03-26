import mongoose from "mongoose";
import bcrypt from "bcrypt";
const personSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Hash password before saving
personSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
personSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const person = mongoose.model("Person", personSchema);
export default  person;
