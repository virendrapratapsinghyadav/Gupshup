import mongoose from 'mongoose';
import {DB_NAME} from '../utils/constant.js'
import {ENV} from '../utils/env.js';

export const connectDB = async()=>{
    try {
        await mongoose.connect(`${ENV.MONGODBURL}/${DB_NAME}`);
        console.log("DB connected!!")
    } catch (error) {
        console.error("Error connecting DB", error);
        process.exit(1);
    }
}