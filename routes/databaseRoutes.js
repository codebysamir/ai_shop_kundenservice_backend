import express from "express";
import { createVector, updateVector, deleteVector, queryVector } from '../controllers/databaseControllers.js'

const router = express.Router()

router.post('/create', createVector)
router.post('/update', updateVector)
router.post('/delete', deleteVector)
router.post('/query', queryVector)

export default router