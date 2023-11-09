import express from "express";
import { getCreditsElevenlabs, getVoiceElevenlabs } from "../controllers/voiceControllers.js";

const router = express.Router()

router.post('/elevenlabs', getVoiceElevenlabs)
router.get('/elevenlabs/credits', getCreditsElevenlabs)

export default router