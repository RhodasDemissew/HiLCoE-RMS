import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { CreateSubmissionDto, FileParams } from '../dtos/submissions.dto.js';
import { submissionsController } from '../controllers/submissions.controller.js';
import { saveBase64File, getFileStream } from '../services/storageService.js';

const router = express.Router();

router.post('/', authRequired, validate({ body: CreateSubmissionDto }), submissionsController.create);
router.get('/:id/files/:index', authRequired, validate({ params: FileParams }), submissionsController.file);

export default router;
