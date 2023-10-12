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
videoRouter.get("/:id(\\d+)", watch);
// .post가 post request를 다뤄줌
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit);
// videoRouter.get("/upload", getUpload); 
// videoRouter.post("/upload", postUpload); 
// 위에꺼 2개를 줄인게 밑에줄 
videoRouter.route("/upload").get(getUpload).post(postUpload);

export default videoRouter; 