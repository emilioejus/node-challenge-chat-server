const express = require("express");
const cors = require("cors");
const moment = require("moment");

const app = express();
const date = moment();

app.use(express.json());
app.use(cors());

const welcomeMessage = {
  id: 0,
  from: "Bart",
  text: "Welcome to CYF chat system!",
};

//This array is our "data store".
//We will start with one message in the array.
//Note: messages will be lost when Glitch restarts our server.
const messages = [welcomeMessage];

// GET
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

app.get("/messages", (req, res)=> {
  res.status(200).json(messages)
});

app.get("/messages/search", (req, res)=> {
  let text = req.query.text.toLowerCase();
  let exist = messages.filter(obj => obj.text.toLocaleLowerCase().includes(text))
  console.log(text)
  if(text) {
    res.status(200).json(exist)
  }else {
    res.status(200).json(messages)
  }
});

app.get("/messages/latest", (req, res)=> {
  let amount = -10;
  const lastTen = messages.slice(amount) 
  res.status(200).json(lastTen)
});

app.get("/messages/:id", (req, res)=> {
  const id = parseInt(req.params.id);
  const messageFind = messages.find(obj => obj.id === id)
  res.status(200).json(messageFind);
})

//POST
app.post("/messages/new", (req, res)=> {
  let body = req.body;
  body.timeSent = date.format('HH:mm - DD/MM/YYYY')
  body.id = messages.length <= 0 ? 0 :Math.max(...messages.map((q) => q.id)) + 1;
  if(body.from === "" || body.text === "") {
    res.status(400).send("imcomplete message")
  }else {
    messages.push(body);
    res.status(200).send(messages)
  }
});


//PUT
app.put("/messages/:id", (req, res)=> {
  let id = parseInt(req.params.id);
  let body = req.body;

  messages.forEach(async (obj, index) => {
    console.log(index)

    if(obj.id === id) {
      if(Object.keys(body).includes('timeSent') || Object.keys(body).includes('id')) {
         res.status(401).send('requires administrator permission')
      }else if(body.from === "" || body.text === "") {
         res.status(400).send("imcomplete message")
      }else {
         obj.from =  body.from,
         obj.text =  body.text
        res.status(201).send('Up Date')
      }
    }
    else if(messages.length === (index +1)) {
      res.status(400).send(`Not foun id:${id}`)
    }
  })

});


//DELETE
app.delete("/messages/:id", (req, res)=> {
  let id = parseInt(req.params.id);
  const messageDelete = (arr, id) => {
    const index = arr.findIndex(obj => obj.id === id)
    if(index !== -1) {
      return messages.splice(index, 1)
    }
  }
  let isDelete = messageDelete(messages, id)
  res.status(200).json(isDelete)
})



const server = app.listen(process.env.PORT || 3000, () => {
   console.log(`Listening on port ${server.address().port} http://localhost:${server.address().port}`)
  });
