import Portfolio from "../model/portfolio.model.js";
import person from "../model/person.model.js";
import { cloudinaryUpload } from "../utility/cloudinary.js";
import { multer_setup } from "../utility/cloudinary.js";
import streamifier from "streamifier";
export const update_profilePic = async (req, res) => {

    // Find the user by username
    const user = req.user;

    if (!user) {
        return res.status(404).json({ error: "Portfolio not found" });
    }
    const username = user.username;
    // Set up Multer middleware
    const upload = multer_setup(username);
            const previousPic = user.profilePic;
            if (previousPic) {
              //  console.log("Deleting previous profile picture from Cloudinary:", previousPic);
                const urlParts = previousPic.split("/");
                const public_id = urlParts[urlParts.length - 1].split(".")[0];

                // Add the folder to the public_id if it exists
                const folder = urlParts[urlParts.length - 2];
                const fullPublicId = folder ? `${folder}/${public_id}` : public_id;
              const deleted_pic=  await cloudinaryUpload.uploader.destroy(fullPublicId);
              console.log("Deleted profile picture from Cloudinary:", deleted_pic);
            }
    // Use Multer middleware to handle file upload
    upload.single("profilePic")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {

            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }
            
            const stream = cloudinaryUpload.uploader.upload_stream(
                { folder: "portfolio" },
                async (error, result) => {
                    if (error) {
                        console.error("Error uploading file:", error);
                        return res.status(500).json({ message: "Error uploading file", error });
                    }

                    // Update the user's profile picture in the database
                    await Portfolio.updateOne(
                        { username: username },
                        { $set: { profilePic: result.secure_url } }
                    );

                    // Return success response
                    res.json({ message: "Profile pic updated!", imageUrl: result.secure_url });
                }
            );

            // Stream the file buffer to Cloudinary
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ error: error.message });
        }
    });
};
export const update_name=async (req, res) => {
    const user=req.user;    
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
   const username = user.username;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Name is required!" });
    }
    user.name=name;
    await user.save();
      res.status(201).json({ message: "Name updated!" });
    }
export const update_about=async (req, res) => {
    const user= req.user;
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    const username = user.username;
    const { about } = req.body;
    if (!about) {
        return res.status(400).json({ message: "About is required!" });
    }
    user.about=about;
    await user.save();
    res.json({ message: "About updated!" });
}
export const update_resume=async (req, res) => {
     const user= req.user;
     if(!user){
        return res.status(404).json({error:"Portfolio not found"})
     }
     const username = user.username;
    const { resume } = req.body;
    if(resume===null || resume===undefined){
        return res.status(400).json({ message: "Resume is required!" });
    }
    user.resume=resume;
    await user.save();
    res.json({ message: "Resume updated!" });
}
export const add_skill= async (req, res) => {
     const user= req.user;
     if(!user){
        return res.status(404).json({error:"Portfolio not found"})
     }
     const username = user.username;
    const { skill } = req.body;
    if (!skill) {
        return res.status(400).json({ message: "Skill is required!" });
    }
    user.skills.push(skill);
    await user.save();
    res.json({ message: "Skill added!" });
}
export const delete_skill =async (req, res) => {
     const user= req.user;
     if(!user){
        return res.status(404).json({error:"Portfolio not found"})
     }
     const username = user.username;
    const {skill} = req.body;
    if (!skill) {
        return res.status(400).json({ message: "Skill is required!" });
    }
    user.skills = user.skills.filter((s) => s !== skill);
    await user.save();
    res.json({ message: "Skill removed!" });
}
export const add_project = async (req, res) => {
     const user= req.user;
     if(!user){
        return res.status(404).json({error:"Portfolio not found"})
     }
    const { title, description, imageUrl, link } = req.body;
    if (!title || !description ) {
        return res.status(400).json({ message: "All fields are required!" });
    }
    const newProject = { title, description, imageUrl, link};
    user.projects.push(newProject);
    await user.save();
    res.json({ message: "Project added!" ,"newProject":newProject});
}
export const delete_project=async (req,res)=>{
    const user = req.user;  
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    const {index} = req.body;
    if(index===null || index===undefined){
        return res.status(400).json({error:"index is required"})
    }
    if(index<0 || index>=user.projects.length){
        return res.status(400).json({error:"Index out of range"})
    }
    const to_delete=user.projects[index];
    user.projects = user.projects.filter((p) => p !== to_delete);
    await user.save();
    res.json({message:"Project deleted!"})
}
export const set_portfolio = async (req, res) => {       
    const { username,name, resume, profilePic, about, skills, projects, experience, education ,leetcode_id,gfg_id, email,instagram,twitter} = req.body;
    const find_username= await Portfolio.findOne({username:username});
    if(find_username){
        return res.status(501).json({error:"Portfolio already exist with this username kindly choose another username"})
    }
    const find_email= await Portfolio.findOne({email:email});
    if(find_email){
        return res.status(501).json({error:"Email already exist with another portfolio"})
    }
    const newPortfolio = new Portfolio({ username, resume, profilePic, about, skills, projects, experience, education,leetcode_id,gfg_id ,email,name,instagram,twitter});
    // await Portfolio.deleteMany({});      // Delete all existing portfolios
    await newPortfolio.save();
    res.json({ message: "Portfolio set!" });
}
export const delete_portfolio= async (req,res)=>{

    const user = req.user;
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    // delete cloudinary images
            const profile_pic = user.profilePic;
            if (profile_pic) {
              //  console.log("Deleting previous profile picture from Cloudinary:", previousPic);
                const urlParts = profile_pic.split("/");
                const public_id = urlParts[urlParts.length - 1].split(".")[0];

                // Add the folder to the public_id if it exists
                const folder = urlParts[urlParts.length - 2];
                const fullPublicId = folder ? `${folder}/${public_id}` : public_id;
                await cloudinaryUpload.uploader.destroy(fullPublicId);
            }

    await Portfolio.deleteOne({username:user.username});
    await person.deleteOne({email:user.email});
    res.json({message:"Portfolio deleted!"})
}
export const get_portfolio = async (req, res) => {
    const username = req.params.username ||req.user.username;
    const user = await Portfolio.findOne({username:username});
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    res.json(user);
}
export const add_experience = async (req, res) => {
     const user= req.user;
     if(!user){
        return res.status(404).json({error:"Portfolio not found"})
     }
    const { company,position,startDate,endDate, description,imageUrl } = req.body;
    if (!company || !position || !startDate  || !description ) {
        return res.status(400).json({ message: "All fields are required!" });
    }
    const newExperience = { company,position,startDate,endDate, description,imageUrl };
    user.experience.push(newExperience);
    await user.save();
    res.json({ message: "experience added!" });
}
export const delete_experience=async (req,res)=>{
    const username=req.params.username;
    const user = req.user;    
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    const {index} = req.body;
    if(index===null || index===undefined){
        return res.status(400).json({error:"index is required"})
    }
    if(index<0 || index>=user.experience.length){
        return res.status(400).json({error:"Index out of range"})
    }
    const to_delete=user.experience[index];
    user.experience = user.experience.filter((e) => e !== to_delete);
    await user.save();
    res.json({message:"experience deleted!"})
}

export const add_education = async (req, res) => {
     const user= req.user;
     if(!user){
        return res.status(404).json({error:"Portfolio not found"})
     }
    const {institution,degree,startDate,endDate,marks ,imageUrl} = req.body;
    if (!institution || !degree || !startDate ) {
        return res.status(400).json({ message: "institution and degree fields are required!" });
    }
    const newEducation = { institution,degree,startDate,endDate,marks,imageUrl };
    user.education.push(newEducation);
    await user.save();
    res.json({ message: "education added!" });
}
export const delete_education=async (req,res)=>{
    const user = req.user;    
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    const {index} = req.body;
    if(index===null || index===undefined){
        return res.status(400).json({error:"index is required"})
    }
    if(index<0 || index>=user.education.length){
        return res.status(400).json({error:"Index out of range"})
    }
    const to_delete=user.education[index];
    user.education = user.education.filter((e) => e !== to_delete);
    await user.save();
    res.json({message:"education deleted!"})
} 
export const update_leetcode =async (req,res)=>{
    const username=req.params.username;
    const user = req.user;    
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    const {leetcode_id} = req.body;
    if(leetcode_id===null || leetcode_id===undefined){
        return res.status(400).json({error:"leetcode is required"})
    }
    user.leetcode_id=leetcode_id;
    await user.save();
    res.json({message:"leetcode updated!"})
}
export const update_gfg =async (req,res)=>{
    const user = req.user;    
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    const {gfg_id} = req.body;
    if(gfg_id===null || gfg_id===undefined){
        return res.status(400).json({error:"gfg is required"})  
    }
    user.gfg_id=gfg_id;
    await user.save();
    return res.json({message:"gfg updated!"})   
}
export const update_linkedin =async (req,res)=>{
    const username=req.params.username;
    const user = req.user;    
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    const {linkedin} = req.body;
    if(linkedin===null || linkedin===undefined){
        return res.status(400).json({error:"linkedin is required"})
    }
    user.linkedin=linkedin;
    await user.save();
    res.json({message:"linkedin updated!"})
    }
export const update_github =async (req,res)=>{
    const username=req.params.username;
    const user = req.user;    
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }    
    const {github} = req.body;    
    if(github===null || github===undefined){
        return res.status(400).json({error:"github is required"})
    }
    user.github=github;
    await user.save();
    res.json({message:"github updated!"})
}
export const update_instagram =async (req,res)=>{
    const user = req.user;    
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    const {instagram} = req.body;
    if(instagram===null || instagram===undefined){
        return res.status(400).json({error:"instagram is required"})
    }
    user.instagram=instagram;
    await user.save();
    res.json({message:"instagram updated!"})
}
export const update_twitter =async (req,res)=>{
    const username=req.params.username;
    const user = req.user;    
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    const {twitter} = req.body;
    if(twitter===null || twitter===undefined){
        return res.status(400).json({error:"twitter is required"})
    }
    user.twitter=twitter;
    await user.save();
    res.json({message:"twitter updated!"})
}
export const update_email =async (req,res)=>{
    const user = req.user;    
    if(!user){
        return res.status(404).json({error:"Portfolio not found"})
    }
    const {email} = req.body;
    if(email===null || email===undefined){
        return res.status(400).json({error:"email is required"})
    }
    const already_email = await person.findOne({ email: email });
    if (already_email) {
        already_email.email=email;
        await already_email.save();
       }
    user.email=email;
    await user.save();
    res.json({message:"email updated!"})
}
export const website_link=async (req,res)=>{
    const user=await Portfolio.findOne({username:"kunalgambhir920"});
    if(!user){
        return res.status(404).json({error:"Website link not found"})
    }
const web_link=user.resume;
return res.json(web_link);
}
