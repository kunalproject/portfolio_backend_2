import person from "../model/person.model.js";
import Portfolio from "../model/portfolio.model.js";
import { generate_tokens, set_cookies } from "../utility/tokens.js";
import { send_mail } from "../utility/mailer.js";
export const signup = async (req, res) => {
    const { email, password,name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ error: "All fields are required!" });
    }
    const already_email = await person
        .findOne({ email: email });
    if (already_email) {
        return res.status(400).json({ error: "user already exists with this email kindly login or try another email" });}
    const username = email.split("@")[0];
    const user = await Portfolio
        .findOne({ username: username });
    if (user) {
        return res.status(400).json({ error: "user name  already exists with this email kindly login or try another email" });
    }    
    const new_user = new person({ email, password });
    const saved_user = await new_user.save();
    const new_portfolio = new Portfolio({ username, email,name });
     await new_portfolio.save();
    const access_token = generate_tokens({ user_id: saved_user._id, username: new_portfolio.username });
    set_cookies(res, access_token); 
    const web_url =`${process.env.PORTFOLIO_URL}/${username}`;
    const message=`
    <h1>Congratulations, ${name},</h1>
    <p>Your portfolio website is now ready and can be accessed at this <a href="${web_url}">web link</a>
  . Please fill out the form on the website to display the complete details of your portfolio.</p>
    <p>Hope you have a great experience with us.</p>`
    const subject='Portfolio Website Ready';
    send_mail(email,message,subject);
    res.status(201).json({ "user": saved_user,"portfolio":new_portfolio,access_token });
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required!" });
    }
    const user = await person.findOne({ email: email });
    if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    const portfolio = await Portfolio.findOne({ email: email });
    const access_token = generate_tokens({ user_id: user._id, username: portfolio.username });
    set_cookies(res, access_token);
    res.status(200).json({ user: user });
}