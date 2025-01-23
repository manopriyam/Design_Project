import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`Succesfully Connected to MongoDB Database ${conn.connection.host}`)
    }
    catch (error) {
        console.log(error);
    }
};

export default connectDB;