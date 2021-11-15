import Mongoose from "mongoose";

Mongoose.connect("mongodb://127.0.0.1:27017/youtube", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = Mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB ✅");
const handleError = (error) => console.log("❌❌DB Error", error);

db.on("error", handleError);
db.once("open", handleOpen);
