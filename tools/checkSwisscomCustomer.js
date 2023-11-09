import { DynamicStructuredTool } from "langchain/tools";
import { vectorStore } from "../utils/vectorStore.js"
import { z } from "zod";

export const checkSwisscomCustomer = new DynamicStructuredTool({
    name: 'checkSwisscomCustomer',
    description: 'This function queries/asks a question to a index, in the Database Pinecone, for swisscom customer information. "query" should be your question/input, must be details about the customer like his kundennummer or his name. The argument filter is additional help for searching with "tags", there are 2 options, one is his customernumber or the tag "customers" to list all customers. Use only the customernumber of the customer if you have it, if not ask the customer for it, never use other filter. Never ever give other customer information to the customer you talk to, only his information. Ask the customer for his name to query the customer information.',
    schema: z.object({
      query: z.string().describe('Query string should be to search for specific customer informations like the name, phonenumber or customernumber'),
      filter: z.object({
        tags: z.string().describe('Filters the metadata for specific customer. If available only use the customernumber for specific customer. If you need all customer use "customers"')
      }).optional()
    }),
    func: async (options) => {
      const { query, filter } = options
      const metadata = filter?.tags || { tags: 'customers' }
      // const chain = VectorDBQAChain.fromLLM(model, vectorStore)
      // const response = await chain.call({ query, metadata })
      console.log(filter)
      console.log(metadata)
      const response = await vectorStore.similaritySearch(query, 4, metadata)
      console.log(response)
      let obj = {}
      response.forEach(doc => {
        obj = {
          ...obj,
          [doc.metadata.id]: doc
        }
      });
      console.log(JSON.stringify(obj))
      if (JSON.stringify(obj)) {
        return JSON.stringify(obj)
      } else {
        return 'No Customer found with those data.'
      }
    }
})