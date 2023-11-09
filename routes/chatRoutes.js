import express from "express";
import { sendMessage, sendVoice } from '../controllers/chatControllers.js'

const router = express.Router()

router.post('/', sendMessage)
router.post('/speech-to-text', sendVoice)
// router.post('/text-to-speech', recieveVoice)

export default router