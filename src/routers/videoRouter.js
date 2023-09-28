import express from "express";
import {watch, edit} from "../controllers/videoController"

const videoRouter = express.Router();


videoRouter.get("/watch", handleWathVideo);
videoRouter.get("/edit", handleEdit);


export default videoRouter;