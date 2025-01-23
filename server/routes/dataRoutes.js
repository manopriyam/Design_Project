import express from 'express';

import { testController, allDataController, sendDataController } from '../controllers/dataController.js';

const router = express.Router();

router.get('/test', testController);
router.get('/all', allDataController);
router.post('/send', sendDataController);

export default router;