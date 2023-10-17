import express from "express";
import {
    watch, 
    getUpload, 
    getEdit, 
    postEdit,
    postUpload,
} from "../controllers/videoController";

const videoRouter = express.Router();

/** /:id(\\d+ 이게 params임 */
videoRouter.get("/:id([0-9a-f]{24})", watch);
// .post가 post request를 다뤄줌
videoRouter.route("/:id([0-9a-f]{24})/edit").get(getEdit).post(postEdit);
// videoRouter.get("/upload", getUpload); 
// videoRouter.post("/upload", postUpload); 
// 위에꺼 2개를 줄인게 밑에줄 
/** upload를 맨위로 안올리면 express가 upload를 id로 착각해서 애러가 뜸.
 * 혹은 regualr expression(hexadecimal) --> ([0-9a-f]{24}이거를 넣어 
 * upload를 밑에 내릴수 있게 한다*/
videoRouter.route("/:id([0-9a-f]{24})/delete").get(deleteVideo);

videoRouter.route("/upload").get(getUpload).post(postUpload);


export default videoRouter; 