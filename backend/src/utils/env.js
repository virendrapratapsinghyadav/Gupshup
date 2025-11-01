import dotenv from 'dotenv'
dotenv.config();

const ENV = {
    
//ServerPort
PORT: process.env.PORT,

//Database
MONGODBURL:  process.env.MONGODBURL,

//Tokens
REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,

//Emails
CLIENT_URL: process.env.CLIENT_URL,
RESEND_API_KEY: process.env.RESEND_API_KEY,
EMAIL_FROM: process.env.EMAIL_FROM,
EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,

//ImageUpload

//RateLimiting


//Server Environment
NODE_ENV: process.env.NODE_ENV,
}


export {ENV};

