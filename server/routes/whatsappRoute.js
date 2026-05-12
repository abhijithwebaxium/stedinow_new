import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import watiService from '../services/watiService.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @route POST /api/whatsapp/send
 * @desc Send a manual WhatsApp message to a student
 */
router.post('/send', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ success: false, message: 'Phone and message are required' });
  }

  const result = await watiService.sendWhatsAppMessage(phone, message);

  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

export default router;
