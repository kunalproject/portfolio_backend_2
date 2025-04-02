import jwt from "jsonwebtoken";
import Portfolio from "../model/portfolio.model.js";

export const protectRoute = async(req, res, next) => {
    // verifying user with the access token 
  
    const access_token = req.cookies.accessToken;
    if (!access_token) {
        console.log("access token not found");
        return res.status(401).send("unauthorized access");
    }
    try {
        const decoded = jwt.verify(access_token.access_token, process.env.ACCESS_TOKEN_SECRET);
       
        const user = await Portfolio.findOne({username:decoded.username});
        if(!user){
            return res.status(404).send("user not found");
        } 
        req.user = user;
        next();// move to next middleware
    } catch (error) {
        return res.status(501).send("some network error occured");
        next()
    }
    
}