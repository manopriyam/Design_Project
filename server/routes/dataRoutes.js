import express from 'express';

import { testController, allDataController, sendDataController, statisticsDataController } from '../controllers/dataController.js';

const router = express.Router();

router.get('/test', testController);
router.get('/all', allDataController);
router.post('/send', sendDataController);
router.get('/statistics/:deviceId', statisticsDataController);

export default router;