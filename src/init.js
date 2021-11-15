import "./db";
import "./models/video";
import app from "./server";

const PORT = 4001;

const handleListening = () =>
  console.log(`💖 Server listening on port https://localhost:${PORT} 💥`);

app.listen(PORT, handleListening);
