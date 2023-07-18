const dotenv= require('dotenv');
dotenv.config();
const { MongoClient } = require ('mongodb');
const URI = process.env.MONGODB_URLSTRING;
const client= new MongoClient (URI);

async function connectToDB() {
//const connectToDB = async () => {  
try {
        await client.connect();
        console.log("Conectado a MongoDB");
        return client;
    } catch (error) {
        console.error("Error al conectar a MongoDB;", error);
        return null;
    }
};
async function disconnectFromMongoDB (){
//const disconnectFromMongoDB = async () => {
    try{
        await client.close();
        console.log("Desconectado a MongoDB");
        return client
    }catch (error){
        console.error("Error al desconectar a MongoDB;", error);
        return null;
    }
};
module.exports={connectToDB, disconnectFromMongoDB };