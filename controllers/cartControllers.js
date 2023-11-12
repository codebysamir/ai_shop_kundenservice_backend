import tempDB from "../tempDB.json" assert { type: 'json' }
import { readFile, writeFile } from "fs/promises"
import path from "path"
import { fileURLToPath } from 'url'
import { errorHandler } from "../middleware/errorHandler.js"

const cartItems = tempDB.cart
const cartCheckoutStatus = tempDB.checkoutStatus

export const startCheckout = async (req, res) => {
    console.log('Cart Items: ', cartItems)
    console.log('Cart Checkout Status: ', cartCheckoutStatus)
    try {
        console.log(req.body)
        const filePath = path.resolve('./', 'tempDB.json')
        const status = req.body?.status
        if (!req.body) return res.status(404).json({output: 'No Status found.'})
        console.log(`new Status: ${status}`)

        tempDB.checkoutStatus = status
        await writeFile(filePath, JSON.stringify(tempDB, null, 2), 'utf-8')

        res.status(200).json({output: `Checkout Status to ${status}`, status})
    } catch (error) {
        errorHandler(error, req, res)
    }
}

export const getCartItems = async (req, res) => {
    console.log('Cart Items: ', cartItems)
    console.log('Cart Checkout Status: ', tempDB.checkoutStatus)
    try {
        const cart = {
            cartCheckoutStatus: tempDB.checkoutStatus,
            cartItems
        }
        res.status(200).json(cart)
    } catch (error) {
        errorHandler(error, req, res)
    }
}

export const postCartItems = async (req, res) => {
    try {
        console.log(`Req.body: ${req.body}`)
        const filePath = path.resolve('./', 'tempDB.json')
        console.log(filePath)
        const file = await readFile(filePath, 'utf-8')
        const products = req.body
        if (!products) return res.status(404).json({output: 'No Products found.'})
        const newItems = Array.isArray(products) ? products : [products]
        console.log(`newItems: ${newItems}`)

        cartItems.push(...newItems)
        console.log(cartItems)
        await writeFile(filePath, JSON.stringify(tempDB, null, 2), 'utf-8')

        res.status(200).json({output: 'Postet new Items to Cart successfully', data: cartItems})
    } catch (error) {
        errorHandler(error, req, res)
    }
}

export const removeCartItems = async (req, res) => {
    try {
        console.log(req.body)
        const filePath = path.resolve('./', 'tempDB.json')
        console.log(filePath)
        const file = await readFile(filePath, 'utf-8')
        const products = req.body
        if (!products) return res.status(404).json({output: 'No Products found.'})
        const itemsToRemove = Array.isArray(products) ? products : [products]

        const filteredCart = cartItems.filter(cartItem => {
            const itemToRemove = itemsToRemove.find(item => item.product === cartItem.product) 
            return cartItem.product !== itemToRemove?.product
        })
        console.log(filteredCart)
        cartItems.splice(0, cartItems.length, ...filteredCart)

        await writeFile(filePath, JSON.stringify(tempDB, null, 2), 'utf-8')

        res.status(200).json({output: 'Removed Items from Cart successfully', data: itemsToRemove})
    } catch (error) {
        errorHandler(error, req, res)
    }
}

export const deleteCartItems = async (req, res) => {
    try {
        const filePath = path.resolve('./', 'tempDB.json')
        console.log(filePath)
        const file = await readFile(filePath, 'utf-8')
       
        cartItems.splice(0, cartItems.length)
        tempDB.checkoutStatus = false

        await writeFile(filePath, JSON.stringify(tempDB, null, 2), 'utf-8')

        res.status(200).json({output: 'Deleted all Items from Cart successfully'})
    } catch (error) {
        errorHandler(error, req, res)
    }
}