import express from 'express';
import { createOrder, getOrderStatus, handleWebhook } from '../../controllers/payments/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.get('/status/:orderId', getOrderStatus);
router.post('/webhook', handleWebhook);

export default router;
