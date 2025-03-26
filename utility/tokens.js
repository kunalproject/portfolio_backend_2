import jwt from "jsonwebtoken"
export const generate_tokens =({user_id,username})=>{
     const access_token = jwt.sign({user_id,username},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1h"});
     return {access_token};
}
export const set_cookies=(res, access_token) => {
        res.cookie("accessToken", access_token, {
        // httpOnly: true, // prevent XSS attacks, cross site scripting attack
        secure: process.env.NODE_ENV === "production",// only works on https  in production
        sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
        maxAge: 60 * 60 * 1000, // 1 hour
        });
}