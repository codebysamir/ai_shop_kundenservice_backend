import { OpenAI } from "openai";
const configuration = {
    organization: process.env.ORG_KEY,
    apiKey: process.env.OPENAI_API_KEY,
};
export const openai = new OpenAI(configuration);