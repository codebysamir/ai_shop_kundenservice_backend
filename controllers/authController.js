import { readFile, writeFile } from "fs/promises"
import path from "path"
import { fileURLToPath } from 'url'

// const cartItems = tempDB.cart

// export const getCartItems = async (req, res) => {
//     console.log('Cart Items: ', cartItems)
//     try {
        
//         res.status(200).json(cartItems)
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({output: `get CarItems Error: ${JSON.stringify(error)}`, type: 'Get', error: error.error.message})
//     }
// }

export const loginUser = async (req, res) => {
    try {
        console.log(`Req.body: ${req.body}`)
        const filePath = path.resolve('./', 'tempDB.json')
        console.log(filePath)
        const file = await readFile(filePath, 'utf-8')
        const users = req.body
        if (!users) return res.status(404).json({output: 'No Products found.'})
        const newItems = Array.isArray(users) ? users : [users]
        console.log(`newItems: ${newItems}`)

        cartItems.push(...newItems)
        console.log(cartItems)
        await writeFile(filePath, JSON.stringify(tempDB, null, 2), 'utf-8')

        res.status(200).json({output: 'Postet new Items to Cart successfully', data: cartItems})
    } catch (error) {
        console.log(error)
        res.status(500).json({output: `post CarItems Error: ${JSON.stringify(error)}`, type: 'Post', error: error.error.message})
    }
}
