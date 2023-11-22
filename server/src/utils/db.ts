import mongoose from "mongoose";
require("dotenv").config();

const dbUrl = process.env.MONGO_URL || "";
const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl).then((conn: any) => {
            console.log(`Database connected with ${conn.connection.host}`);
        })
    } catch (error: any) {
        console.log(error);
        setTimeout(connectDB, 5000)
    }
}

export default connectDB;