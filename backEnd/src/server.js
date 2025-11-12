import express from "express";
import "dotenv/config";
import authRoutes from "../src/routes/auth.route.js";
import userRoutes from "../src/routes//user.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectDB } from "../src/lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();
app.use(
  cors({
    origin: "https://streamify-video-calls-n7va.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, '../frontEnd/dist')));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontEnd", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running...port ${PORT}`);
  connectDB();
});
