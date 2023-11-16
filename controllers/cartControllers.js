import tempDB from "../tempDB.json" assert { type: 'json' }
import { access, constants, readFile, writeFile } from "fs/promises"
import path from "path"
import { fileURLToPath } from 'url'
import { errorHandler } from "../middleware/errorHandler.js"

const railwayPath = path.resolve(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'tempDB.json')
console.log('First try Railway Path: ', railwayPath)

const checkOrCreateDB = async () => {
    try {
        const doesDBExist = await access(railwayPath, constants.F_OK)
        console.log('Does DB exist: ', doesDBExist)
    } catch (error) {
        
        const initialData = {
            "cart": [],
            "checkoutStatus": false
        }
        await writeFile(railwayPath, JSON.stringify(initialData))
    }
    console.log('Should now exist: ', railwayPath)
}
checkOrCreateDB()
// const filePath = path.resolve('./', 'tempDB.json')
const filePath = railwayPath


export const startCheckout = async (req, res) => {
    try {
        console.log(req.body)
        const file = await readFile(filePath, 'utf-8')
        const fileData = JSON.parse(file)
        const dataCartItems = fileData.cart
        console.log('Cart Items: ', dataCartItems)
        console.log('Cart Checkout Status: ', fileData.checkoutStatus)
        const status = req.body?.status
        if (!req.body) return res.status(404).json({output: 'No Status found.'})
        console.log(`new Status: ${status}`)

        fileData.checkoutStatus = status
        await writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf-8')

        res.status(200).json({output: `Checkout Status to ${status}`, status})
    } catch (error) {
        errorHandler(error, req, res)
    }
}

export const getCartItems = async (req, res) => {
    try {
    const file = await readFile(filePath, 'utf-8')
    const fileData = JSON.parse(file)
    const dataCartItems = fileData.cart
    console.log('Cart Items: ', dataCartItems)
    console.log('Cart Checkout Status: ', fileData.checkoutStatus)
    
        const cart = {
            cartCheckoutStatus: fileData.checkoutStatus,
            cartItems: dataCartItems
        }
        res.status(200).json(cart)
    } catch (error) {
        errorHandler(error, req, res)
    }
}

export const postCartItems = async (req, res) => {
    try {
        console.log(`Req.body: ${req.body}`)
        console.log(filePath)
        const file = await readFile(filePath, 'utf-8')
        const fileData = JSON.parse(file)
        const dataCartItems = fileData.cart

        const products = req.body
        if (!products) return res.status(404).json({output: 'No Products found.'})
        const newItems = Array.isArray(products) ? products : [products]
        console.log(`newItems: ${newItems}`)

        dataCartItems.push(...newItems)
        console.log(dataCartItems)
        await writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf-8')

        res.status(200).json({output: 'Postet new Items to Cart successfully', data: dataCartItems})
    } catch (error) {
        errorHandler(error, req, res)
    }
}

export const removeCartItems = async (req, res) => {
    try {
        console.log(req.body)
        console.log(filePath)
        const file = await readFile(filePath, 'utf-8')
        const fileData = JSON.parse(file)
        const dataCartItems = fileData.cart

        const products = req.body
        if (!products) return res.status(404).json({output: 'No Products found.'})
        const itemsToRemove = Array.isArray(products) ? products : [products]

        const filteredCart = dataCartItems.filter(cartItem => {
            const itemToRemove = itemsToRemove.find(item => item.product === cartItem.product) 
            return cartItem.product !== itemToRemove?.product
        })
        console.log(filteredCart)
        dataCartItems.splice(0, dataCartItems.length, ...filteredCart)

        await writeFile(filePath, JSON.stringify(tempDB, null, 2), 'utf-8')

        res.status(200).json({output: 'Removed Items from Cart successfully', data: itemsToRemove})
    } catch (error) {
        errorHandler(error, req, res)
    }
}

export const deleteCartItems = async (req, res) => {
    try {
        console.log(filePath)
        const file = await readFile(filePath, 'utf-8')
        const fileData = JSON.parse(file)
        const dataCartItems = fileData.cart

        dataCartItems.splice(0, dataCartItems.length)
        fileData.checkoutStatus = false

        await writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf-8')

        res.status(200).json({output: 'Deleted all Items from Cart successfully'})
    } catch (error) {
        errorHandler(error, req, res)
    }
}