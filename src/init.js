import "regenerator-runtime";
import "dotenv/config";
import "./db";
import app from "./server";
import "./models/Video";
import "./models/User";
import "./models/Comment";

const PORT = 4000;

const handleListening = () =>
  console.log(`😛😛😛 Server listening on https://localhost:${PORT} 🤖🤖🤖`);

app.listen(PORT, handleListening);
