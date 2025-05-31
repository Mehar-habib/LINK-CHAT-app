import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const databaseUrl = process.env.DATABASE_URL;

app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

setupSocket(server);

mongoose
  .connect(databaseUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));
