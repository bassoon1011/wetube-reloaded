import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    avatarUrl: String,
    socialOnly: { type: Boolean, default: false },
    username: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String, required: true },
    location: String,
});

userSchema.pre(`save`, async function() {
    // 여기서 this는 userController에서 create되는 user를 가리킴.
    this.password = await bcrypt.hash(this.password, 5);
});

const User = mongoose.model(`User`, userSchema);
export default User;