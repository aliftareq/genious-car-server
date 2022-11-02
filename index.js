const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())


app.listen(port, () => {
    console.log(`This port is running in ${port}`);
})

