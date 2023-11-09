import pineconeClient from '../models/pineconeModel.js'
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone"
import { clearFolder } from '../utils/clearFolder.js'
import { Document } from "langchain/document";
import { readFile } from "fs/promises"
import dotenv from 'dotenv'
dotenv.config()

// CREATE VECTOR
export const createVector = async (req, res) => {
    try {
      const file = req.file
      const { category } = req.body
      if (!file) {
        console.log('No File found!')
        return res.status(404).json({message: 'No file found!'})
      }
      if (!category) {
        console.log('No category found!')
      }
      console.log(file)
      console.log(category)
  
  
      // transformTextForPincone('./uploads')
  
      // const loader = new DirectoryLoader("./uploads", {
      //     ".txt": (path) => new TextLoader(path),
      //     ".json": (path) => new JSONLoader(path, ["/customer1"]),
      // })
  
      const jsonFile = await readFile(file.path, 'utf8')
  
      const jsonData = JSON.parse(jsonFile)
      const docs = Object.entries(jsonData).map(([key, value]) => new Document({ 
        pageContent: JSON.stringify(value),
        metadata: {
          source: file.originalname,
          id: key,
          tags: [`${category}`, `${key}`]
        }
      }))
  
      // const docs = await loader.load()
  
      console.log(docs)
  
      // const indexName = file.originalname.replace(/\s+/g, '-').toLocaleLowerCase().split('.')[0]
      // console.log(indexName)
  
      const indexName = process.env.PINECONE_INDEX

      const existingIndexes = await pineconeClient.listIndexes()
      console.log(`Existing Indexes: ${JSON.stringify(existingIndexes)}`)
  
      if (!existingIndexes[0].name.includes(indexName)) {
          console.log(`Creating "${indexName}"...`)
  
          const createClient = await pineconeClient.createIndex({
              createRequest: {
                  name: indexName,
                  dimension: 1536,
                  metric: "cosine"
              }
          })
  
          console.log(`Created with client: `, createClient)
          // setTimeout for the long creation part in pinecone, takes about 1min.
          await new Promise(resolve => setTimeout(resolve, 60000))
      } else {
          console.log(`"${indexName}" already exists.`)
      }
      
      const pineconeIndex = pineconeClient.Index(indexName)
  
      await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
        pineconeIndex,
      });
      console.log(`Documents uploaded successfully to index "${indexName}"!`)
  
      clearFolder('./uploads')
  
      res.status(200).json({
        output: 'Successfully uploaded file!', 
        type: 'file', 
        filename: file.originalname
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({output: error.message || JSON.stringify(error)})
    }
}

// UPDATE VECTOR
export const updateVector = async (req, res) => {
  
  try {
      const { idsToReplace: ids, indexName: _indexName, vectorCategory: category } = req.body
    const file = req.file
    console.log(file)
    console.log(ids)
    if (!_indexName) console.log('No Indexname')
    if (!ids && !category) {
      console.log('No IDs and category found!')
      return res.status(404).json({message: 'No IDs and category found!'})
    }
    
    let docs
    if (!file) {
        console.log('No File found!')
        return res.status(404).json({message: 'No file found!'})
    } else {
        const jsonFile = await readFile(file.path, 'utf8')
        
        const jsonData = JSON.parse(jsonFile)
        docs = Object.entries(jsonData).map(([key, value]) => new Document({ 
          pageContent: JSON.stringify(value),
          metadata: {
            source: file.originalname,
            id: key,
            tags: [category, `${key}`]
          }
        }))
        console.log(docs)
    }
    
    const indexName = _indexName || process.env.PINECONE_INDEX
    const pineconeIndex = pineconeClient.Index(indexName);
    const pineconeStore = new PineconeStore(new OpenAIEmbeddings(), { pineconeIndex })

    const existingIndexes = await pineconeClient.listIndexes()

    if (!existingIndexes[0].name.includes(indexName)) {
        console.log(`Index: "${indexName}" not found.`)
        return res.status(404).json({message: `Index: "${indexName}" not found.`})
    } else {
        console.log(`"${indexName}" exists.`)
    }
    
    if (file) {
      if (category && ids) {
        await pineconeStore.delete({
            ids: Array.isArray(ids) ? ids : [ids],
        });
        console.log(`"${ids}" got deleted.`)
        // console.log(`"${ids.join(', ')}" are deleted.`)
      } else if (category) {
        await pineconeIndex.deleteMany({
            tags: { $in: Array.isArray(category) ? [...category] : [category] }
        })
        console.log(`"${category}" Category is deleted.`)
      } else if (ids) {
        await pineconeStore.delete({
            ids: Array.isArray(ids) ? ids : [ids],
        });
        console.log(`"${ids}" got deleted.`)
        // console.log(`"${ids.join(', ')}" are deleted.`)
      }
  
      await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
        pineconeIndex,
      });
      console.log(`Documents uploaded successfully to Vector DB!`)

      clearFolder('./uploads')
    }
    

    res.status(200).json({
      output: 'Successfully updated Vector!', 
      type: 'file', 
      filename: file.originalname
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({output: error.message || JSON.stringify(error)})
  }
}

// DELETE VECTOR
export const deleteVector = async (req, res) => {
  try {
    const { idsToDelete: ids, category } = req.body
    console.log(req.body)
    
    if (!ids && !category) {
      console.log('No IDs and category found!')
      return res.status(404).json({message: 'No IDs and category found!'})
    }
    console.log(ids)
    console.log(category)
    
    const indexName = process.env.PINECONE_INDEX

    const existingIndexes = await pineconeClient.listIndexes()

    if (!existingIndexes[0].name.includes(indexName)) {
      console.log(`Index: "${indexName}" not found.`)
      return res.status(404).json({message: `Index: "${indexName}" not found.`})
    }
    
    const pineconeIndex = pineconeClient.Index(indexName);
    const pineconeStore = new PineconeStore(new OpenAIEmbeddings(), { pineconeIndex })

    if (category) {
      await pineconeIndex.deleteMany({
        tags: { $in: Array.isArray(category) ? [...category] : [category] }
      })
      console.log(`"${category}" Category is deleted.`)
    } else if (ids) {
      await pineconeStore.delete({
        ids: ids,
      });
      console.log(`"${ids}" are deleted.`)
      // console.log(`"${ids.join(', ')}" are deleted.`)
    }


    res.status(200).json({
      output: 'Successfully DELETED vectors!', 
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({message: error.message || JSON.stringify(error)})
  }
}

// QUERY VECTOR
export const queryVector = async (req, res) => {
  const { prompt } = req.body
  console.log(prompt)
  if (!prompt) return res.sendStatus(404)

  const indexName = process.env.PINECONE_INDEX
  const pineconeIndex = pineconeClient.Index(indexName);
  
  try {
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex }
    );

    const response = await vectorStore.similaritySearch(prompt, 3, { txtPath: 'C:\\Users\\sa\\Desktop\\Javascript Test\\langchain_backend\\documents\\The Holy Land and Syria.txt'})
    console.log(response)

    // const model = new ChatOpenAI({});
    // const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    //   k: 3,
    //   returnSourceDocuments: true,
    // });
    // const response = await chain.call({ query: prompt })
    // console.log(response)

    res.status(200).json(response)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)  
  }
}