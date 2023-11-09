import express from "express";
import { createStream, createTalk, destroyStream, getCredits, getTalkVideo, onIceCandidate, startStream, talkToStream, talkWebhook } from '../controllers/avatarController.js'

const router = express.Router()

router.post('/streams', createStream)
router.post('/streams/sdp', startStream)
router.post('/streams/ice', onIceCandidate)
router.post('/streams/talks', talkToStream)
router.post('/createTalk', createTalk)
router.get('/getTalk', getTalkVideo)
router.post('/streams/destroy', destroyStream)
router.post('/streams/webhook', talkWebhook)
router.get('/getCredits', getCredits)

export default router