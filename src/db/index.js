import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function dataBaseConnection (){
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
        console.log("Database Connection successfull !! : ",connectionInstance.connection.host)
    } catch (error) {
        console.log("Connection Error : ",error);
        process.exit(1);
    } 
}

export {dataBaseConnection}