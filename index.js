const WebSocketServer = require('ws').Server
const http = require('http')
const express = require('express')
const app = express()
const port = process.env.PORT || 5000

var server = http.createServer(app)
server.listen(port)

var wss = new WebSocketServer({
  server: server
})

const clients = []
let clientID = 1

wss.on('connection', function(ws) {
  const id = clientID

  clients.push({ id, ws })

  console.log('websocket connection open:', clientID)

  clientID++

  ws.on('message', function(message) {
    console.log('websocket message received', message)
  })

  ws.on('close', function() {
    console.log('websocket connection close')
    const clientIdx = clients.findIndex((client) => client.id === id)
    clients.splice(clientIdx, 1)
  })
})

const allowedCommands = ['open', 'close']

app.get('/', (req, res) => {
  const { cmd, target } = req.query
  const targetNumber = parseInt(target)

  if (!allowedCommands.includes(cmd)) {
    res.sendStatus(400)
    return
  }
  if (Number.isNaN(targetNumber)) {
    res.sendStatus(400)
    return
  }
  if (targetNumber < 1 || targetNumber > 16) {
    res.sendStatus(400)
    return
  }

  clients.forEach((client) => {
    client.ws.emit('message', JSON.stringify({ cmd, target }))
  })

  res.sendStatus(200)
})
