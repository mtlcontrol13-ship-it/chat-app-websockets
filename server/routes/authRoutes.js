import express from "express";
import { loginUser, registerUser, getCompanyUsers } from "../controllers/authController.js";

const router = express.Router();

router.post('/login', loginUser)
router.post('/register', registerUser)
router.get('/company/:companyId/users', getCompanyUsers)

export default router;