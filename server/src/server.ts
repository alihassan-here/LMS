import { app } from './app';
import connectDB from "./utils/db";
require("dotenv").config();


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server listening on ${PORT}`);
});