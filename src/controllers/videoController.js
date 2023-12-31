import Video from "../models/Video";
import User from "../models/User";


/** video.pug를 home.pug에서 끌어와서 이 controller로 home화면을 만드는것.
 * 대문자 Video는 Model이고 소문자 video는 데이터베이스에서 검색한 영상 object.
 */
export const home = async (req, res) => {
    const videos = await Video.find({}).sort({ createdAt: "desc" });
    return res.render("home", { pageTitle: "Home", videos });
};
export const watch = async (req, res) => {
    // router에있는 id가 req.params를 통해 전송됨
    const { id } = req.params;
    /** populate를 이용해서 owner라는 관계를 부여하면 User 객체 전체를 값으로 가지게됨 */
    const video = await Video.findById(id).populate("owner");
    if(!video) {
        /**  return을 여기에 꼭 넣어야하는게 return을 안넣어놓으면 밑에까지 가지 
             말아야할때 밑에의 return까지 작동시켜버림. */
        return res.status(404).render("404", { pageTitle:"Video not found." });
    }
    return res.render("watch", { pageTitle: video.title, video }); 
};

export const getEdit = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    /** 여기엔 exists보다 finsByID가 더울린다 - edit 템플릿에 video object를 
     * 보내야하기 때문 */
    const video = await Video.findById(id);
    if(!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};

/** req.body는 edit.pug에있는 form 안에있는 value의 javascript representation이다.
 * 이걸로 유저가 input에 작성한 data를 얻을 수 있다.(input에 name 줘야함) 
 * 근데 이걸 가능하게 하려면 server에 urlencoded라는 middleware를 작성해야함.
*/
export const postEdit = async (req, res) => {
    const {
        user: { _id },
    } = req.session;
    const { id } = req.params;
    const {title, description, hashtags} = req.body;
    const video = await Video.exists({ _id: id });
    if(!video) {
        return res.render("404", { pageTitle: "Video not found." });
    }
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title, 
        description, 
        hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video" });
};

/** upload.pug에 name으로 title을 줬기때문에 req.body로 그 이름의 데이터를 받을수 있음 */
export const postUpload = async (req, res) => {
    const {
        user: { _id },
    } = req.session;
    const { path: fileUrl } = req.file;
    const { title, description, hashtags } = req.body;
    try {
        const newVideo = await Video.create({
        /** 바로위에 title 적어놔서 그냥 title, 이거나 title: title 이거랑 같다 */
        title,
        description,
        fileUrl,
        owner: _id,
        hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    }   catch (error) {
        console.log(error);
        return res.status(400).render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
}; 
    /** save가 promise를 return해줌. await를 넣는 이유는 비디오를 서버에 저장하는데 시간이 걸리기 때문 */
export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const video = await Video.findById(id);
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
};

export const search = async (req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(`${keyword}$`, "i"),
            },
        });
    }
    return res.render("search", { pageTitle: "Search", videos });
};