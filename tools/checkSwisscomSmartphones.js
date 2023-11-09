import { DynamicStructuredTool } from "langchain/tools";
import { vectorStore } from "../utils/vectorStore.js"
import { z } from "zod";

export const checkSwisscomSmartphones = new DynamicStructuredTool({
    name: 'checkSwisscomSmartphones',
    description: 'This function queries/asks a question to a index, in the Database Pinecone, for available swisscom smartphones. Input must be details about one or more smartphones or the wished brand for example "apple". for example brandnames like "apple", "samsung" etc., modellname like "iphone 14 pro", samsung galaxy s22", "fold 5" etc., colors, speicherplatz or price. "query" should be your question/input, filter should always be default value "smartphones"',
    schema: z.object({
        query: z.string().describe('The input question to search for the smartphone details'),
        filter: z.object({
        tags: z.string().default('smartphones').describe('Filters the metadata. Always use "smartphones", optional: "Apple", "Samsung" etc.')
        })
    }),
    func: async (options) => {
        const { query, filter } = options
        // const chain = VectorDBQAChain.fromLLM(model, vectorStore)
        // const response = await chain.call({ query, filter })
        const response = await vectorStore.similaritySearch(query, 4, filter)
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