const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
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

//common function for using in routes
function varifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized Access' })
    }
    const token = authHeader.split(' ')[1]
    //varifying aceess token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Invalid Token' })
        }
        req.decoded = decoded
        next()
    })
}

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
            data: `inside from api ${error.message}`,
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
app.post('/orders', varifyJWT, async (req, res) => {
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
app.get('/orders', varifyJWT, async (req, res) => {
    try {
        const decoded = req.decoded
        if (decoded.email !== req.query.email) {
            return res.status(403).send({ message: 'unauthorized Access!!!' })
        }
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
//api for deleting a order
app.delete('/orders/:id', varifyJWT, async (req, res) => {
    id = req.params.id
    try {
        const query = { _id: ObjectId(id) }
        const result = await ordersCollection.deleteOne(query)
        res.send(result)
    } catch (error) {
        res.send(error.message)
    }
})
//api for updating a order
app.patch('/orders/:id', varifyJWT, async (req, res) => {
    const id = req.params.id
    const status = req.body.status
    try {
        const query = { _id: ObjectId(id) }
        const updateDoc = {
            $set: { status: status }
        }
        const result = await ordersCollection.updateOne(query, updateDoc)
        res.send(result)
    } catch (error) {
        res.send(error.message)
    }
})
//api for JWT 
app.post('/jwt', async (req, res) => {
    try {
        const user = req.body
        console.log(user);
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        res.send({ token })
    }
    catch (error) {
        res.send(error.message)
    }
})

app.listen(port, () => {
    console.log(`This port is running in ${port}`);
})

