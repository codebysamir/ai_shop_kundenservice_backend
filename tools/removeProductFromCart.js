import axios from "axios";
import { DynamicStructuredTool } from "langchain/tools"
import { z } from "zod";

export const removeProductFromCart = new DynamicStructuredTool({
    name: 'removeProductFromCart',
    description: 'This function removes a digital or a physical product from the cart and displays it to the user. \n 1. If the user wants to correct its cart or changed his mind, remove the product from the cart. 2. Be accurate to name the input of the product precisly, if you not sure check the cart products first.',
    schema: z.object({
      products: z.array(
        z.object({
          product: z.string().describe('productabo for example "blue telefonie L" or "iPhone 15'),
          price: z.string().describe('price of that product in CHF'),
        })
      ).describe('An Array of all the products that the customer wants to remove, each product is an object with productname and price'),
      total: z.string().describe('The Total price of every listed product together.')
    }),
    func: async (options) => {
      const { products, total } = options
      console.log(products, total)
      const productnames = products?.map(prod => prod.product)
      
      const getCartProducts = await axios.get('http://localhost:5000/api/cart/get')
      const productsToRemove = getCartProducts.data.cartItems.filter(prod => prod.product === products.find(p => prod.product === p.product)?.product)
      console.log(productsToRemove)

      if (!productsToRemove.length) return 'Error removing Product: Input product doesnt exist in the cart, please enter correct name. If you dont know the correct name check the cart. Maybe it was a Typo, try again.' 

      console.log('test if removed function starts')
      const response = await axios.post('http://localhost:5000/api/cart/remove', productsToRemove)
      console.log(response.data)

      return `${productnames.join(', ')} for ${total} was removed from the Cart`
    }
  })