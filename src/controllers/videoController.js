import Video from "../models/Video";

const handleSearch = (error, videos) => {

}

export const home = async (req, res) => {
        const videos = await Video.find({});
        return res.render("home", { pageTitle: "Home", videos });
};
export const watch = (req, res) => {
    const { id } = req.params;
    return res.render("watch", { pageTitle: `Watching` }); 
};
export const getEdit = (req, res) => {
    const { id } = req.params;
    return res.render("edit", { pageTitle: `Editting` });
};

/** req.body는 edit.pug에있는 form 안에있는 value의 javascript representation이다.
 * 이걸로 유저가 input에 작성한 data를 얻을 수 있다.(input에 name 줘야함) 
 * 근데 이걸 가능하게 하려면 server에 urlencoded라는 middleware를 작성해야함.
*/
export const postEdit = (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video" });
};

/** upload.pug에 name으로 title을 줬기때문에 req.body로 그 이름의 데이터를 받을수 있음 */
export const postUpload = (req, res) => {
    const { title } = req.body;
    return res.redirect("/");
}; 