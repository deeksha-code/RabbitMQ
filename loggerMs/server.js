const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const Producer = require("./producer");
const producer = new Producer();

// app.use(bodyParser.json("application/json"));
app.use(express.json());

app.post("/sendLog", async (req, res, next) => {
  console.log("entered sendlog method",req.body.logType,req.body.message)
  await producer.publishMessage(req.body.logType, req.body.message);
  res.send({message:"success"});
});

app.listen(3000, () => {
  console.log("Server started...");
});


