import express from "express";
import { deleteCartItems, getCartItems, postCartItems, removeCartItems, startCheckout } from '../controllers/cartControllers.js'

const router = express.Router()

router.get('/get', getCartItems)
router.post('/post', postCartItems)
router.post('/checkout', startCheckout)
router.post('/remove', removeCartItems)
router.delete('/delete', deleteCartItems)

export default router