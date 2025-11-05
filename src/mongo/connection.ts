import mongoose from 'mongoose'

export const connectDB=async(MONGO_URL:string):Promise<void>=>{
    try {
        if(!MONGO_URL)
            {
                throw new Error("MONGO_URL is not defined in environment variables.")
            }
            await mongoose.connect(MONGO_URL)
            console.log("database Connected");
            
    } catch (error) {
        console.error('Error connecting to MongoDB:', error) 
    }
}
