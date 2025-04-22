import express from 'express';
const router= express.Router();
import { protectRoute } from '../middleware/auth.middleware.js';
import { update_resume, add_skill, delete_skill, add_project ,set_portfolio,delete_portfolio,delete_project ,add_experience,delete_experience,update_about, add_education ,delete_education ,update_gfg,update_leetcode,get_portfolio,update_linkedin,update_github,update_name, update_profilePic,update_instagram,update_twitter ,update_email,website_link} from '../controllers/data.controller.js';
router.put('/update_name',protectRoute,update_name);
router.put('/update_about',protectRoute,update_about);
router.post('/set_portfolio',set_portfolio);
router.get('/get_portfolio/:username',get_portfolio);
router.delete('/delete_portfolio',protectRoute,delete_portfolio);
router.put('/update_resume',protectRoute,update_resume);
router.get('/protected-route', protectRoute, (req, res) => {
  // This will only be accessible if protectRoute passes
  res.json({ user: req.user });
});
router.put('/get_all_message',protectRoute,(req, res) => {
  res.json({ messages: req.user.messages });
});
router.delete("/delete_portfolio",protectRoute,delete_portfolio);
router.post('/add_skill',protectRoute,add_skill);
router.delete('/delete_skill',protectRoute,delete_skill);
router.post('/add_project',protectRoute,add_project);
router.delete('/delete_project/',protectRoute,delete_project);
router.post('/add_experience',protectRoute,add_experience);
router.delete('/delete_experience',protectRoute,delete_experience);
router.post('/add_education',protectRoute,add_education);
router.delete('/delete_education',protectRoute,delete_education);
router.put('/update_gfg_id',protectRoute,update_gfg); 
router.put('/update_leetcode_id',protectRoute,update_leetcode);
router.put('/update_linkedin',protectRoute,update_linkedin);
router.put('/update_github',protectRoute,update_github);
router.put('/update_profilePic',protectRoute,update_profilePic);
router.put('/update_instagram',protectRoute,update_instagram);
router.put('/update_twitter',protectRoute,update_twitter);
router.put('/update_email',protectRoute,update_email);
router.get('/get_link',website_link)
export default router;
