import { clearFolder } from '../utils/clearFolder.js'
import { createReadStream } from 'fs'
import { openai } from "../models/openaiClient.js";
import dotenv from 'dotenv'
import { errorHandler } from '../middleware/errorHandler.js';
dotenv.config()

// Speech-To-Text (Open AI Whisper)
export const sendVoiceOpenAI = async (req, res) => { 
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
  } finally {
    if (process.env.NODE_ENV === 'development') {
      clearFolder('./uploads')
    }
  }
}


// Text-To-Speech (Open AI)
export const getVoiceOpenAI = async (req, res) => {
  console.log(req.body)
  const prompt = req.body.prompt
  const gender = req.body.gender
  if (!prompt || !gender) res.status(404).send('No Prompt or Gender found!')
  const voice_onyx_male = 'onyx'
  const voice_nova_female = 'nova'
  const voice_id = gender === 'female' ? voice_nova_female : voice_onyx_male

  try {
      const getVoice = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice_id,
        input: prompt,
      })
      const resultBuffer = Buffer.from(await getVoice.arrayBuffer())
      console.log(resultBuffer)
      res.setHeader('Content-Type', 'audio/mpeg')
      res.setHeader('Content-Disposition', 'attachment; filename-"audio.mp3"')
      
      res.status(200).send(resultBuffer)
  } catch (error) {
      console.log('openai error is: ', error)
      errorHandler(error, req, res)
  }
}

// Text-To-Speech (Elevenlabs)
export const getVoiceElevenlabs = async (req, res) => {
  console.log(req.body)
  const prompt = req.body.prompt
  const gender = req.body.gender
  if (!prompt || !gender) res.status(404).send('No Prompt or Gender found!')
  const voice_markus_male = 'aqgeMU48tPYXFrBiWWip'
  const voice_maya_female = 'wkw3r1f5eyCvFXQLV0AG'
  const voice_id = gender === 'female' ? voice_maya_female : voice_markus_male
  // const file_name = 'test.mp3'

  try {
      const getVoice = await fetch(`${process.env.ELEVENLABS_URL}/text-to-speech/${voice_id}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'xi-api-key': process.env.ELEVENLABS_API_KEY,
              'accept': '*/*',
          },
          // responseType: 'stream',
          body: JSON.stringify({
              text: prompt,
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0,
                use_speaker_boost: false
              },
              model_id: 'eleven_multilingual_v2'
          })
      })
      const resultBuffer = Buffer.from(await getVoice.arrayBuffer())
      console.log(resultBuffer)
      res.setHeader('Content-Type', 'audio/mpeg')
      res.setHeader('Content-Disposition', 'attachment; filename-"audio.mp3"')
      
      res.status(200).send(resultBuffer)
  } catch (error) {
      console.log('elevenlabs error is: ', error)
      errorHandler(error, req, res)
  }
}

export const getCreditsElevenlabs = async (req, res) => {
  console.log('Getting elevenlabs credits...')
  try {
    const getCreditsRes = await fetch(`${process.env.ELEVENLABS_URL}/user`, {
      method: 'GET',
      headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'accept': 'application/json',
      }
    })
    res.status(200).json(getCreditsRes)
  } catch (error) {
    console.log('elevenlabs get credits error: ', error)
    errorHandler(error, req, res)
  }
}