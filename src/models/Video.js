import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxLength: 80 },
    fileUrl: { type: String, required: true},
    description: { type: String, required: true, trim: true, minLength: 20 },
    createdAt: { type: Date, required: true, default: Date.now },
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, default: 0, required: true },
    },
    /** 비디오에 owner를 추가했고 그 이름은 objectId. 그리고 그 objectId는 User model에서 온다고 알려주는것 */
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

/**  */
videoSchema.static(`formatHashtags`, function(hashtags) {
    return hashtags
        .split(",")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));
});



/** 모델이 완성되기 전에 middleware를 작성해야함 */
const Video = mongoose.model("Video", videoSchema);
export default Video;  