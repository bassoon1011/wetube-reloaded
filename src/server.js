
import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";

const app = express();

const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true}));

/** 브라우저가 백앤드와 상호작용할때마다  session이라는 middleware가 브라우저에 cookie를
 * 전송함. */
app.use(
    session({
        secret: process.env.COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    }) 
);

app.use(flash());
// localMiddleware가 session에 접근할수 있는 이유는 session middleware다음에 
// 오기때문에 가능
app.use(localsMiddleware);
/** 브라우저에다가 폴더를 노출시키는 방법 (Express한테 사람들이 이 폴더 안에 있는 파일들을 볼 수 있게 해달라고 요청하는 것) */
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
app.use("/", rootRouter); 
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;