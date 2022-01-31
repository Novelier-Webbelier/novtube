import express from "express";
import morgan from "morgan";
import flash from "express-flash";

import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";

import session, { Store } from "express-session";
import MongoStore from "connect-mongo";
import { localsMiddleware } from "./middlewares";

const app = express();

app.use(morgan("dev"));
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session ({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 604800000,
    },
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    })
  })
)

app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

app.use(flash());
app.use(localsMiddleware)
app.use("/", rootRouter);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"), express.static("node_modules/@ffmpeg/core/dist"));
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app
