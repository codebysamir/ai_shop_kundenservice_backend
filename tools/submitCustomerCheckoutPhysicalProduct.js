import axios from "axios";
import { DynamicStructuredTool } from "langchain/tools"
import { z } from "zod";

const BACKEND_URL = import.meta.BACKEND_URL

export const submitCustomerCheckoutPhysicalProduct = new DynamicStructuredTool({
    name: 'submitCustomerCheckoutPhysicalProduct',
    description: 'This function ends the customer conversation with completing the shopcart. List everything that the customer ordered with price for each product and the total. Ask the customer if he is already a swisscom customer. Update the Database for stock amount of those products.',
    schema: z.object({
      products: z.array(
        z.object({
          product: z.string().describe('productmodell like for example "iphone 15 pro" or productabo like for example "blue telefonie L"'),
          price: z.string().describe('price of that product'),
        })
      ).describe('An Array of all the products that the customer ordered, each product is an object with productname and price'),
      total: z.string().describe('The Total price of every ordered product together.')
    }),
    func: async (options) => {
      const { products, total } = options
      console.log(products)
      console.log(total)
      const productnames = products?.map(prod => prod.product)
      // const response = await vectorStore.similaritySearch(query, 4, filter)
      // let obj = {}
      // response.forEach(doc => {
      //   obj = {
      //     ...obj,
      //     [doc.metadata.id]: doc
      //   }
      // });
      // console.log(JSON.stringify(obj))
      // return JSON.stringify(obj)
      await axios.post(BACKEND_URL + '/api/cart/checkout', {status: true})
      return `You ordered ${productnames.join(', ')} for ${total}`
    }
})