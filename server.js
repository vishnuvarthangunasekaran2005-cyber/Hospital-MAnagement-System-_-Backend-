const express = require('express');
//console.log(express)
const app = express();

const port = 4000;
console.log(port)

app.get('/' , (req,res) => {
    res.send(`port is running on ${port}`)
})

app.listen(port,() =>{
    console.log(`port is running ${port}`);
})
