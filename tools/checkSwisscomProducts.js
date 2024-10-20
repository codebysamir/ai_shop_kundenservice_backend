import { DynamicStructuredTool } from "@langchain/core/tools";
import { vectorStore } from "../utils/vectorStore.js"
import { z } from "zod";

export const checkSwisscomProducts = new DynamicStructuredTool({
    name: 'checkSwisscomProducts',
    description: 'This function checks for available swisscom abo products (for example: mobile abo, internet abo, tv abo and festnetz abo) and returns the top answer. The argument {tags} in {filter} is additional help for searching the metadata with keywords, "tags" should only contain one of the searchKeys: "products" for all products, if no specific product is mentioned, or "Internet", "Mobile", "TV" or "Festnetz" for specific abo, never use others.',
    schema: z.object({
        query: z.string().describe('The input question to search for the abo/product'),
        filter: z.object({
        tags: z.enum(['Internet', 'Mobile', 'Festnetz', 'TV', 'products']).describe('Filters the metadata for specific product category. Only use following searchKeys: "products" for all products or "Internet", "Mobile", "TV" or "Festnetz" for specific abo, never use others.')
        })
    }),
    func: async (options) => {
        const { query, filter } = options
        const metadata = {
        tags: `products`
        }
        // const chain = VectorDBQAChain.fromLLM(model, vectorStore)
        // const response = await chain.call({ query, metadata })
        const response = await vectorStore.similaritySearch(query, 4, filter ?? metadata)
        console.log(response)
        let obj = {}
        response.forEach(doc => {
        obj = {
            ...obj,
            [doc.metadata.id]: doc
        }
        });
        console.log(JSON.stringify(obj))
        return JSON.stringify(obj)
    }
})