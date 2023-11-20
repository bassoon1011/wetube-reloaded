import mongoose from "mongoose"

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,

    // 니코가 쓰는거랑 버젼 차이 때문에 일어났을거야.
    // useFindAndModify: false,
    // useCreateIndex: true,
});

const db = mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB")
const handleError = (error) => console.log("❌ DB Error", error);

db.on("error", handleError);
db.once("open", handleOpen);