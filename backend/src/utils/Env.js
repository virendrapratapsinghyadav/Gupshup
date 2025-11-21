import dotenv from 'dotenv';
dotenv.config();

const ENV = {

//URL
CLIENT_URL: process.env.CLIENT_URL,    
    
//ServerPort
PORT: process.env.PORT,

//Database
MONGODB_URL: process.env.MONGODB_URL,

//Tokens
REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,

//Emails
RESEND_API_KEY: process.env.RESEND_API_KEY,
EMAIL_FROM: process.env.EMAIL_FROM,
EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,

//ImageUpload
CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

//RateLimiting
ARCJET_KEY: process.env.ARCJET_KEY,
ARCJET_ENV: process.env.ARCJET_ENV,

//Server Environment
NODE_ENV: process.env.NODE_ENV,
}

export { ENV }