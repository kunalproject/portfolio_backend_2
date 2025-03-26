import express from 'express';
const app= express();
import bodyparser from 'body-parser';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
app.use(cookieParser());
app.use(express.json());
dotenv.config();
app.use(bodyparser.json());
import db from './db.js';
import cors from 'cors';
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // Allow any origin
  },
  credentials: true // Still allow credentials
}));
import portfoliorouter from './router/portfolio.router.js';
import datarouter from './router/data.router.js';
import personrouter from './router/person.router.js';
app.use('/person',personrouter);
app.use('/data',datarouter);
app.use('/portfolio',portfoliorouter);
app.listen(process.env.PORT,()=>{
    console.log("app is running on port ", process.env.PORT)
})