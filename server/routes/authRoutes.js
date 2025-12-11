import express from "express";
import { loginUser, registerUser, getCompanyUsers, addUserToChat } from "../controllers/authController.js";

const router = express.Router();

router.post('/login', loginUser)
router.post('/register', registerUser)
router.get('/company/:companyId/users', getCompanyUsers)
router.post('/chats/addUser', addUserToChat)

export default router;