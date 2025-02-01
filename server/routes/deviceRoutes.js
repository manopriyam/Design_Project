import express from 'express';

import { testController, allDeviceController } from '../controllers/deviceController.js';

const router = express.Router();

router.get('/test', testController);
router.get('/all', allDeviceController);

export default router;