import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.route.js";

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));

app.use(express.json({
    limit : "16kb"
}))

app.use(express.urlencoded({
    limit:"16kb",
    extended:true
}))

app.use(express.static("public"))

app.use(cookieParser())

app.use('/api1/v1/users',userRouter)

app.get('/',(req,res) => {
    res.send("all is ok")
})

export {app};