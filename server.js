import express from "express";
import cors from "cors";
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage })


const corsOptions = {
  origin: 'http://localhost:5173',
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

const testGet = async () => {
  const response = await axios.get('http://localhost:5000/api/cart/get')
  console.log(response.data)
}
// testGet()

const testPost = async () => {
  const body = [ 
    {
      product: 'Google Pixel 8',
      price: '700 CHF'
    }
    ,{
      product: 'Google Pixel 8 Pro',
      price: '1000 CHF'
    }
  ]
  const response = await axios.post('http://localhost:5000/api/cart/post', body)
  console.log(response)
}
// testPost()

const testRemove = async () => {
  const body = [ 
    {
      product: 'Google Pixel 8',
      price: '700 CHF'
    }
  ]
  const response = await axios.post('http://localhost:5000/api/cart/remove', body)
  console.log(response.data)
}
// testRemove()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server is listening on Port ${PORT}`))