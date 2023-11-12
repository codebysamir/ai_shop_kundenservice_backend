import express from "express";
import { getCreditsElevenlabs, getVoiceElevenlabs, getVoiceOpenAI } from "../controllers/voiceControllers.js";
import { sendVoice } from "../controllers/chatControllers.js";

const router = express.Router()

router.post('/openai/whisper', sendVoice)
router.post('/openai/voice', getVoiceOpenAI)
router.post('/elevenlabs/voice', getVoiceElevenlabs)
router.get('/elevenlabs/credits', getCreditsElevenlabs)

export default router