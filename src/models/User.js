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
    /** video의 owner은 1명이지만 owner은 여러 영상을 가질수 있어서 [] array로 만들어준다 */
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});
// 비밀번호를 보내고저장하면 이 함수가 비밀번호를 hash해줌
userSchema.pre("save", async function () {
    // 여기서 this는 userController에서 create되는 user를 가리킴.
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5);
    }    
});

const User = mongoose.model(`User`, userSchema);
export default User;