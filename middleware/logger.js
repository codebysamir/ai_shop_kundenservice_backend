import { format } from 'date-fns'
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'dd/MM/yyyy\tHH:mm:ss')
    const logItem = `${dateTime}\t${randomUUID()}\t${message}\n`

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch (err) {
        console.log('logEvents Error: ' + err)
    }
}

export const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}\t`, 'reqLog.log')
    console.log(`${req.method}\t${req.path}`)
    next()
}