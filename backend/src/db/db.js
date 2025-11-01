import mongoose from "mongoose";


const connectDB = async () => {
    try {
       
        const connectionInstance= await mongoose.connect(`${process.env.MONGO_URL}`);
        console.log(` \n mongodb connected !! DB HOSt : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error( "Error:",error );
        throw error;
    }

}


export default connectDB;