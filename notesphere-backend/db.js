import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const connectToMongo = async ()=> {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to mongoDB successfully!");

    }
    catch (error) {
        console.error("Error connecting to mongoDB: ", error.message);
        process.exit(1);
    }
}

export default connectToMongo;