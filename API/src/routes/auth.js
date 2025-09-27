import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { LoginDto, RegisterDto, VerifyStudentDto, ResetRequestDto, ResetConfirmDto } from '../dtos/auth.dto.js';
import { authController } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', validate({ body: LoginDto }), authController.login);

router.get('/me', authRequired, authController.me);

router.post('/verify', validate({ body: VerifyStudentDto }), authController.verify);

router.post('/register', validate({ body: RegisterDto }), authController.register);

router.post('/reset/request', validate({ body: ResetRequestDto }), authController.resetRequest);
router.post('/reset/confirm', validate({ body: ResetConfirmDto }), authController.resetConfirm);

export default router;
