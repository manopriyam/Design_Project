import express from 'express';

import { testController, allDeviceController, singleDeviceDetailsController, instructionDeviceController } from '../controllers/deviceController.js';

const router = express.Router();

router.get('/test', testController);
router.get('/all', allDeviceController);
router.get('/details/:deviceId', singleDeviceDetailsController);
router.post('/instruction', instructionDeviceController);

export default router;