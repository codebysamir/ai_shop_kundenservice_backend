import mongoose from 'mongoose'

export function connection(url) {
    mongoose.connect(url).then(
        () => console.log("MongoDB Connection Successful")
    ).catch(
        (err) => console.log("ERROR: MongoDB Connection failed!: ", err)
    )
} 