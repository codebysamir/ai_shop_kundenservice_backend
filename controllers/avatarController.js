import api from 'api'
const dIDClient = api('@d-id/v4.2.0#g9xv4c21lnk6rt31')
const dIDResourcesClients = api('@d-id/v4.2.0#g23r1clm7g7rlv')
import path from "path";
import dotenv from 'dotenv'
import { createReadStream } from 'fs';
import { clearFolder } from '../utils/clearFolder.js';
import { errorHandler } from '../middleware/errorHandler.js';
dotenv.config()
dIDClient.auth(process.env.DID_API_KEY);
dIDResourcesClients.auth(process.env.DID_API_KEY);

const voices = {
  male_german: 'de-DE-KillianNeural',
  female_german: 'de-DE-KatjaNeural',
  male_swissgerman: 'de-CH-JanNeural',
  female_swissgerman: 'de-CH-LeniNeural',
  male_english: 'en-US-JasonNeural',
  female_english: 'en-US-JennyMultilingualNeural',
}

const maleAvatar = 'https://create-images-results.d-id.com/DefaultPresenters/Ibrahim_m/image.png'
const femaleAvatar = 'https://create-images-results.d-id.com/DefaultPresenters/Zivva_f/image.png'

export const createStream = async (req, res) => {
    console.log('Creating stream...')
    console.log(req.body)
    const { gender } = req.body

    try {
        const sessionResponse = await dIDClient.createStream({
            source_url: gender === 'female' ? femaleAvatar : maleAvatar,
            // source_url: 's3://d-id-images-prod/auth0|6543de833df8359e291b9f2f/img_HBiFteD89wn7oVHbRnRRP/avatar_cropped.jpeg',
            // source_url: 's3://d-id-images-prod/auth0|654694d6a5b46c922b94c9b1/img_B_KrVzm2sIoP3E2ZtloAd/test2.jpeg',
            // source_url: 's3://d-id-images-prod/auth0|654694d6a5b46c922b94c9b1/img_8hglmzinAmiXWK2-R3813/test3.jpeg',
            // face: {top_left: [0], size: 700},
            driver_url: 'bank://lively/driver-06',
        })

        res.status(200).json(sessionResponse)
    } catch (error) {
      console.log('error during streaming setup', error);
      if (error.status === 429 && error.data.kind === 'TooManyRequestsError') {
        res.status(429).json({output: error.data.description, status: error.status, kind: error.data.kind})
      }
      errorHandler(error, req, res)
    }
}

export const startStream = async (req, res) => {
    console.log('Starting stream...')
    // console.log('req.body: ', req.body)
    const { streamId, sessionId, sessionClientAnswer } = req.body
    try {
        const sdpResponse = await dIDClient.startConnection(
            {
              answer: sessionClientAnswer,
              session_id: sessionId,
            },
            {id: streamId}
        );
        console.log(`Stream active, SDP Response: `, sdpResponse?.data, sdpResponse?.status)
    } catch (error) {
      console.log('error during streaming setup', error);
      errorHandler(error, req, res)
    }
}

export const talkToStream = async (req, res) => {
  console.log('Talking to stream...')
  console.log(req.body)
  console.log(req.file)
  const { streamId, sessionId, message, gender, language, tts } = req.body
  const audioFile = tts === 'elevenlabs_tts' || tts === 'openai_tts' ? req.file : ''

  let voice_id
  let microsoft_tts_script

  if (tts === 'microsoft_tts') {
    voice_id = Object.entries(voices).find(([key, value]) => key.includes(gender) && key.includes(language))[1]
    console.log(voice_id)
  
    microsoft_tts_script = {
      type: 'text',
      provider: {
        type: 'microsoft',
        voice_id: voice_id
      },
      input: message
    }
  }

  let alternative_tts_script
  let audioURL
  
  try {
    if (tts === 'elevenlabs_tts' || tts === 'openai_tts') {
      const audioUpload = await dIDResourcesClients.uploadAnAudio({ audio: audioFile.path })
      console.log(audioUpload.data)
      audioURL = audioUpload.data.url
      alternative_tts_script = {
        type: 'audio',
        // audio_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/webrtc.mp3',
        audio_url: audioURL
        // audio_url: 's3://d-id-audios-prod/auth0|653fc7da3ef5ce034899e464/wrhTVv_z6gvYBrgFvcG4N/elevenLabsAudio2.wav'
      }
    }

    const talkResponse = await fetchWithRetries(`${process.env.DID_URL}/talks/streams/${streamId}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${process.env.DID_API_KEY}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: tts === 'microsoft_tts' ? microsoft_tts_script : alternative_tts_script,
        config: {
          align_driver: true,
          auto_match: true,
          sharpen: true,
          result_format: 'mp4',
          stitch: true,
          driver_expressions: {
            expressions: [
              {
                expression: 'happy',
                start_frame: 0,
                intensity: 1
              }
            ]
          }
        },
        session_id: sessionId,
      }),
    });
    const status = talkResponse.status
    if (status === 200) {
      console.log(`Talk status successfull - ${status}`)
    } else {
      console.log('talk status response: ', talkResponse)
    }
    res.status(200).json(talkResponse.status)
  } catch (error) {
    console.log('talk status errror: ')
    errorHandler(error, req, res)
  } finally {
    if (process.env.NODE_ENV === 'development') {
      clearFolder('./uploads')
    }
  }
};

export const uploadImage = async (req, res) => {
  console.log(req.file)
  const imgFile = req.file  
  try {
      const result = await dIDClient.uploadImage({

      })
  } catch (error) {
      console.log('Image Upload error is: ', error)
      errorHandler(error, req, res)
  }
}

export const uploadAudio = async (req, res) => {
  console.log(req.file)
  const audioFile = req.file  
  try {
        const result = await dIDClient.uploadAnAudio({
          audio: audioFile,
          source_url: audioFile.path,
        })
    } catch (error) {
        console.log('Audio Upload error is: ', error)
      errorHandler(error, req, res)
    }
}

export const destroyStream = async (req, res) => {
  console.log('Destroying Stream...')
  const { sessionId, streamId } = req.body
  if (!streamId || !sessionId) return res.status(404).send('No StreamId or SessionId found!') 
  try {
    const stopStream = await fetch(`${process.env.DID_URL}/talks/streams/${streamId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${process.env.DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
    console.log(stopStream.status)
    console.log('Successfull destroyed Stream')
    res.status(200).json({status: stopStream.status, data: stopStream})
  } catch (error) {
    console.log('Destroy Stream error is: ', error)
    errorHandler(error, req, res)
  }
};

export const onIceCandidate = async (req, res) => {
  console.log('Gather ICE candidates...')
  if (req.body.candidate) {
    const { candidate, sdpMid, sdpMLineIndex, session_id, streamId } = req.body;

    try {
        const getIceCandidate = await dIDClient.addIceCandidate(
          {
            candidate,
            sdpMid,
            sdpMLineIndex,
            session_id,
          },
          {id: streamId}
        );
        console.log('Ice Candidate: ', getIceCandidate?.data)
      res.status(200).json({output: 'Gather Ice Candidates', data: getIceCandidate.data})
    } catch (error) {
      console.log(error)
      errorHandler(error, req, res)
    }
  }
}

export const createTalk = async (req, res) => {
  console.log('Starting create Talk...')
  // console.log('req.body: ', req.body)
  // const {  } = req.body
  try {
      const talkVideo = await dIDClient.createTalk({
        script: {
          type: 'text',
          subtitles: 'false',
          ssml: true,
          input: '<break time=\"5000ms\"/><break time=\"5000ms\"/><break time=\"5000ms\"/>'
        },
        config: {
          // align_expand_factor: 0.9,
          stitch: true,
          fluent: true,
          pad_audio: '0.0',
          driver_expressions: {expressions: [{expression: 'neutral', start_frame: 0, intensity: 1}]}
        },
        source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Ibrahim_m/image.png',
        // source_url: 's3://d-id-images-prod/auth0|654694d6a5b46c922b94c9b1/img_CdRHTQ2FtzzFwT6Lrjo8x/test2.jpeg',
        // driver_url: 'bank://lively/driver-06',
        // webhook: "http://localhost:5000/api/avatar/streams/webhook",
        name: 'test2'
      });
      console.log(`Talk Video: `, talkVideo)
      res.status(200).json(talkVideo)
  } catch (error) {
    console.log('error during streaming setup', error);
    errorHandler(error, req, res)
  }
} 
export const getTalkVideo = async (req, res) => {
  console.log('Starting create Talk...')
  // console.log('req.body: ', req.body)
  // const {  } = req.body
  try {
    const getVideo = await dIDClient.getTalks({id: 'tlk_9P-akNnp_bxw7cZ3dsyTU'});
    console.log(`get Talk Video: `, getVideo.data.talks)
    res.status(200).json(getVideo.data.talks)
  } catch (error) {
    console.log('error during streaming setup', error);
      errorHandler(error, req, res)
  }
} 
export const talkWebhook = async (req, res) => {
  console.log('Connecting to Webhook...')
  console.log('req.body: ', req.body)
  const data = req.body
  try {
    res.status(200).json(data)
  } catch (error) {
    console.log('error during webhook', error);
      errorHandler(error, req, res)
  }
} 

export const getCredits = async (req, res) => {
  console.log('Get Credits...')
  try {
    const data = await dIDResourcesClients.getCredits()
    console.log(data.data)
    res.status(200).json(data.data)
  } catch (error) {
    console.log('error during get credits', error);
    errorHandler(error, req, res)
  }
}

  
const maxRetryCount = 3;
const maxDelaySec = 4;
  
async function fetchWithRetries(url, options, retries = 1) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (retries <= maxRetryCount) {
        const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;
  
        await new Promise((resolve) => setTimeout(resolve, delay));
  
        console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
        return fetchWithRetries(url, options, retries + 1);
      } else {
        throw new Error(`Max retries exceeded. error: ${err}`);
      }
    }
}