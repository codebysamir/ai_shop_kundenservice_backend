import axios from "axios";
import { DynamicStructuredTool } from "langchain/tools"
import { z } from "zod";

export const addProductToCart = new DynamicStructuredTool({
    name: 'addProductToCart',
    description: 'This function adds a digital or a physical product to the cart and displays to the user. \n 1. If the user wants to buy a product add it to the cart. 2. Be accurate to name every detail of the product precisly.',
    schema: z.object({
      products: z.array(
        z.object({
          product: z.string().describe('productabo for example "blue telefonie L" or "iPhone 15'),
          details: z.string().describe('Details about the product like for smartphone it will be {color} and {RAM}. For abos it will be only the {data speed}.'),
          price: z.string().describe('price of that product in CHF'),
        })
      ).describe('An Array of all the products that the customer wants to order, each product is an object with productname and price'),
      total: z.string().describe('The Total price of every ordered product together.')
    }),
    func: async (options) => {
      const { products, total } = options
      console.log(products, total)
      const productnames = products?.map(prod => prod.product)

      const response = await axios.post('http://localhost:5000/api/cart/post', products)
      console.log(response.data)

      return `${productnames.join(', ')} for ${total} added to the Cart`
    }
  })