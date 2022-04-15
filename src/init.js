import "dotenv/config";
import "./db";
import "./models/video";
import app from "./server";
import "./models/User";

const PORT = 4000;

const handleListening = () =>
  console.log(`😛😛😛 Server listening on https://localhost:${PORT} 🤖🤖🤖`);

app.listen(PORT, handleListening);
