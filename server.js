import express from "express";
import cors from "cors";
import { connection } from "./models/mongoDBClient.js";
import multer from "multer"
import databaseRoutes from "./routes/databaseRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import avatarRoutes from "./routes/avatarRoutes.js"
import voiceRoutes from "./routes/voiceRoutes.js"
import axios from "axios"
import dotenv from 'dotenv'
import { logger } from "./middleware/logger.js";
dotenv.config()

const uploadDest = process.env.RAILWAY_VOLUME_MOUNT_PATH ?? 'uploads'
console.log(uploadDest)
console.log(process.env.NODE_ENV)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDest)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage })

const allowedOrigins = [
  'https://aishopkundenservicebackend-production.up.railway.app',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://localhost:3001',
  'https://ai-kundenservice.netlify.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true)
    } else {
        callback(new Error('Not allowed by CORS'));
    }
},
  optionsSuccessStatus: 200
};

const app = express()
app.use(logger)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({extended: true}))
app.use(cors(corsOptions))

app.use('/api/database', upload.single('fileUpload'), databaseRoutes)
app.use('/api/chat', upload.single('fileUpload'), chatRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/avatar', upload.single('fileUpload'), avatarRoutes)
app.use('/api/voice', upload.single('fileUpload'), voiceRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  connection(process.env.MONGODB_URL)
  console.log(`Server is listening on Port ${PORT}`)
})