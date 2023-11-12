import { DynamicStructuredTool, WikipediaQueryRun, SerpAPI, VectorStoreQATool } from "langchain/tools";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { z } from "zod";
import { ChatMessageHistory } from "langchain/memory";
import { AIMessage, HumanMessage } from "langchain/schema";
import { OpenAIAgentTokenBufferMemory } from "langchain/agents/toolkits";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone"
import pineconeClient from '../models/pineconeModel.js'
import { clearFolder } from '../utils/clearFolder.js'
import { createReadStream } from 'fs'
import { chmod } from 'fs/promises'
import { OpenAIWhisperAudio } from "langchain/document_loaders/fs/openai_whisper_audio"
import { checkCartProducts, addProductToCart, checkSwisscomCustomer, checkSwisscomProducts, checkSwisscomSmartphones, submitCustomerCheckoutDigitalAbo, submitCustomerCheckoutPhysicalProduct, removeProductFromCart} from "../tools/tools.js"
import { openai } from "../models/openaiClient.js";
import dotenv from 'dotenv'
import { errorHandler } from "../middleware/errorHandler.js";
dotenv.config()


// let pastMessages = []
// SEND MESSAGE
export const sendMessage = async (req, res) => {

  const model = new ChatOpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo-1106' });
  const gpt4 = new ChatOpenAI({ modelName: 'gpt-4-1106-preview' })

  const systemprompt = `Du bist Sales Consultant und arbeitest im Swisscom Shop, du betreust unsere Kundschaft mit deinen verkäuferischen sowie technischen Fähigkeiten. Du führst nur die folgenden Regeln durch:
  - Falls User bereits Kunde ist, kontrolliere seine Produkte und probiere ihm wen möglich und unaufdringlich verbesserung vorzuschlagen.
  - Bevor du ein Produkt zum Warenkorb hinzufügst, checkst du nach, ob das Produkt im Angebot ist und erst dann fügst du dieses Produkt, mit den Informationen von der Datenbank zum Warenkorb hinzu.  
  - Immer wen der kunde ein digitales Produkt, wie z.b. ein Abo, kaufen will, fragst du vorher nach seinem Namen um den Kauf abzuschliessen.
  - Immer wen du dem Kunden ein produkt empfehlen willst, kontrollist du ob es auf Lager ist bzw. in der Datenbank existiert.
  - Du benutzt ausschliesslich NUR die in der Datenbank zur verfügung gestellten Abo Produkte, Smartphones/handys und kundendaten des befragten. 
  - Erwähne nie informationen die nicht in der Datenbank zur Verfügung stehen, falls du mehr Input Informationen brauchst fragst du danach. 
  - Falls der Kunde seine eigenen Kundendaten abfragen will, hilst du ihm dabei.
  - Ausser seinen eigenen Daten, dürfen nie andere Kundendaten den Kunden erreichen. 
  - Wen du das angefragte Produkt/Leistung nicht findest, sagst du dem Kunden das und erfindest nichts. 
  - Wen der Kunde ein physisches Produkt kaufen will, wie z.b. ein smartphone, dann brauchst du immer noch die zusätzlichen informationen wie Farbe und Speicherplatz bevor du das Produkt in den Warenkorb hinzufügst.
  - Do your best to answer the questions. 
  - Never assume information that you couldnt look up.
  - Feel free to use any tools available to look up relevant information, only if necessary. 
  - You never refer to yourself as an AI-Model, if you refer to yourself, you are an Sales Consultant.`

  let tools = [checkSwisscomCustomer, checkSwisscomProducts, checkSwisscomSmartphones, submitCustomerCheckoutDigitalAbo, submitCustomerCheckoutPhysicalProduct, addProductToCart, checkCartProducts, removeProductFromCart]
  
  try {
    const { prompt, functions, chatHistory: _chatHistory, gender, tts } = req?.body
    if (!prompt) return res.status(404).json({errorMessage: 'No Data found'})

    if (functions) {
      console.log(`functions active: ${functions}`)
      tools = tools.filter(tool => functions.find(func => func === tool.name))
      tools.map(tool => console.log(tool.name))
    } else {
      console.log(`No Functions ${functions}`)
    }

    let pastMessages = []
    if (_chatHistory) {
      const chatLog = JSON.parse(_chatHistory)
      console.log(typeof(chatLog))
      console.log(chatLog)
      if (chatLog?.length) {
        chatLog.forEach(chat => (
          pastMessages.push(
            new HumanMessage(chat.question),
            new AIMessage(chat.answer)
            )
        ))
      }
    }
    console.log(`pastMessages: `, pastMessages)

    const chatHistory = new ChatMessageHistory(pastMessages, { limit: 6 })
    // const lastMessages = await chatHistory.getMessages()
    // console.log(lastMessages)
    
    const memory = new OpenAIAgentTokenBufferMemory({
      chatHistory: chatHistory,
      llm: new ChatOpenAI({}),
      memoryKey: 'chat_history',
      outputKey: 'output',
    })
    
    const executor = await initializeAgentExecutorWithOptions(tools, gpt4, {
      agentType: "openai-functions",
      verbose: true,
      memory: memory,
      returnIntermediateSteps: true,
      agentArgs: {
        prefix: systemprompt,
      }
    });
    
    // const input = messages[messages.length - 1].content;
    
    const result = await executor.call({ input: prompt });

    // let audioBuffer
    // if (tts === 'elevenlabs_tts') {
    //   const audioRes = await fetch('http://localhost:5000/api/voice/elevenlabs', {
    //     method: 'POST',
    //     headers: { "Content-Type": "application/json"},
    //     body: JSON.stringify({
    //       prompt: result.output,
    //       gender
    //     })
    //   })
    //   console.log('Audio Response: ', audioRes)
    //   if (audioRes.ok) {
    //     audioBuffer = audioRes
    //   } 
    // }
    // console.log('Audio: ', audioBuffer)
    res.status(200).json(result)
  } catch (error) {
    console.log(error)
    if (error.code === 'context_length_exceeded') {
      res.status(400).json({output: error.error.message, code: 'context_length_exceeded'})
    } else {
      errorHandler(error, req, res)
    }
  }
}


// Speech-To-Text (Open AI Whisper)
export const sendVoice = async (req, res) => { 
    // Get the saved file path from the req.file object
  console.log(req.file)
  const audioFile = req.file
  const audioFilePath = req.file.path;


  // Create a ReadableStream object from the saved file using fs.createReadStream()
  const audioStream = createReadStream(audioFilePath);
  
  try {
    // OPEN AI VERSION
    const response = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      language: 'de'
    });

    // LANGCHAIN VERSION
    // const loader = new OpenAIWhisperAudio(audioFilePath)
    // const response = await loader.load()

    // Send the response back to the client
    console.log(response)
    // console.log(response[0].pageContent)

    // LANGCHAIN VERSION
    // const speechToText = response[0].pageContent;

    // OPENAI VERSION
    const speechToText = response.text

    res.status(200).json({
      message: speechToText,
      // tokens: response.data.usage.total_tokens
    })
  } catch (error) {
    console.log('Catch Error is: ' + error)
    errorHandler(error, req, res)
  }
  clearFolder('./uploads')
}
