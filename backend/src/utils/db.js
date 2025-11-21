import mongoose from 'mongoose';
import { ENV } from './Env.js';

const connectDB = async()=> {
    try {
        const connection = mongoose.connect(`${ENV.MONGODB_URL}`);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("Failed to connect mongoDB");
        process.exit(1);
    }
}

export {connectDB};