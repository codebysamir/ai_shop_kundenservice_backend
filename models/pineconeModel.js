import { Pinecone } from "@pinecone-database/pinecone"
import dotenv from 'dotenv'
dotenv.config()

const client = new Pinecone();

export default client