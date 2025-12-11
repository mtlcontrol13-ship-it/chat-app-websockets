import express from "express";
import { loginUser, registerUser, } from "../controllers/authController.js";
import { addUserToChat, getCompanyUsers } from "../controllers/userController.js";

const router = express.Router();

router.post('/login', loginUser)
router.post('/register', registerUser)
router.get('/company/:companyId/users', getCompanyUsers)
router.post('/chats/addUser', addUserToChat)

export default router;