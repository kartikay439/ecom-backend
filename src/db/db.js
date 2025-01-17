import { DB_NAME } from "../../constants.js";
import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
       const connectionInstance =  await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
       console.log(`\n MongoDB connected Succesfully !!! DB Host ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Mongo db connection error", error);
        process.exit(1)
    }
}

export default connectDB