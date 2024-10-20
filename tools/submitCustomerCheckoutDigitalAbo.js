import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod";

export const submitCustomerCheckoutDigitalAbo = new DynamicStructuredTool({
    name: 'submitCustomerCheckoutDigitalAbo',
    description: 'This function ends the customer conversation with an order for a digital product like for example a abo. List everything that the customer ordered with price for each product and the total and the Customers Name. Ask the customer for his name before continue to order, never use fictitious names. Update the Database with which user ordered, which product.',
    schema: z.object({
      customer: z.string().describe('Customername who ordered something, dont assume a name if you dont know it, ask the customer.'),
      products: z.array(
        z.object({
          product: z.string().describe('productabo for example "blue telefonie L"'),
          price: z.string().describe('price of that product'),
        })
      ).describe('An Array of all the products that the customer ordered, each product is an object with productname and price'),
      total: z.string().describe('The Total price of every ordered product together.')
    }),
    func: async (options) => {
      const { customer, products, total } = options
      console.log(customer, products, total)
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
      return `${customer} ordered ${productnames.join(', ')} for ${total}`
    }
})