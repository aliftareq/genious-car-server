const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
require('colors');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

//data base uri & client instance.
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.preca8g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//connecting operation with database.
async function run() {
    try {
        await client.connect()
        console.log('Database connected'.yellow.bold);
    }
    catch (error) {
        console.log(error.message.red.bold);
    }
}
run().catch(err => console.log(err))

//here the collection
const ServicesCollection = client.db('geniusCar').collection('services')
const ordersCollection = client.db('geniusCar').collection('orders')

//end-points

//root api
app.get('/', (req, res) => {
    res.send('genious car is running on the server')
})

//api for get all services data
app.get('/services', async (req, res) => {
    try {
        const query = {}
        const cursor = ServicesCollection.find(query)
        const services = await cursor.toArray()
        res.send({
            success: true,
            data: services
        })
    }
    catch (error) {
        res.send({
            success: false,
            data: error.message
        })
    }
})
//api for get one single services data
app.get('/services/:id', async (req, res) => {
    try {
        const id = req.params.id
        const service = await ServicesCollection.findOne({ _id: ObjectId(id) })
        res.send({
            success: true,
            data: service
        })
    }
    catch (error) {
        res.send({
            success: false,
            data: error.message
        })
    }
})
//api for post orders data.
app.post('/orders', async (req, res) => {
    try {
        const order = req.body
        const result = await ordersCollection.insertOne(order)
        res.send(result)
    }
    catch (error) {
        res.send(error.message)
    }
})
//api for get orders data.
app.get('/orders', async (req, res) => {
    try {
        let query = {}
        if (req.query.email) {
            query = {
                email: req.query.email
            }
        }
        const cursor = ordersCollection.find(query)
        const orders = await cursor.toArray()
        res.send(orders)
    }
    catch (error) {
        res.send(error.message)
    }
})

app.listen(port, () => {
    console.log(`This port is running in ${port}`);
})

