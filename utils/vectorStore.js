import { PineconeStore } from '@langchain/pinecone';
import pineconeClient from '../models/pineconeModel.js'
import { OpenAIEmbeddings } from '@langchain/openai';

const indexName = process.env.PINECONE_INDEX
const pineconeIndex = pineconeClient.Index(indexName);

export const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
);