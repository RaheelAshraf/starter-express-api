import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PineconeClient } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import { queryPineconeVectorStoreAndQueryLLM } from "./query.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.send(`Hello world`)
})

// Define a function to query Pinecone and get a response
async function queryPineconeAndReturnResponse(client, indexName, question) {
    try {
        const response = await queryPineconeVectorStoreAndQueryLLM(client, indexName, question);

        return response;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// POST route to generate a response
app.post('/generate', async (req, res) => {
    const question = req.body.text;

    const indexName = "uindex";
    const client = new PineconeClient();
    await client.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
    });
    try {
        const response = await queryPineconeAndReturnResponse(client, indexName, question);
        console.log(`ResponseType: ${response}`)
        res.send(response); // Send the response back to the client (HTML page)
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


//OPENAI_API_KEY=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
