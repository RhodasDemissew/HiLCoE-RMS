import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { researcherStagesController } from '../controllers/researcherStages.controller.js';

const router = express.Router();

router.use(authRequired);

router.get('/researchers/progress', researcherStagesController.progress);
router.get('/templates/proposal', researcherStagesController.template);
router.get('/submissions', researcherStagesController.listSubmissions);
router.post('/submissions', researcherStagesController.createSubmission);
router.get('/submissions/:id/file', researcherStagesController.download);
router.post('/submissions/:id/review', researcherStagesController.reviewSubmission);
router.get('/coordinator/submissions', researcherStagesController.coordinatorList);
router.post('/submissions/:id/analyze', researcherStagesController.analyze);
router.get('/submissions/:id/analysis', researcherStagesController.analysis);

export default router;
