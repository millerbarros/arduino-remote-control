const WebSocketServer = require('ws').Server
const http = require('http')
const express = require('express')
const app = express()
const port = process.env.PORT || 5000

const server = http.createServer(app)
server.listen(port)

console.log(`server listening on port ${port}`)

const wss = new WebSocketServer({ server })

const clients = []
let clientID = 1

wss.on('connection', function(ws) {
  const id = clientID

  clientID++

  clients.push({ id, ws })

  console.log(`websocket connection opened (${id})`)

  ws.on('message', function(message) {
    console.log(`websocket message received (${id}):`, message)
  })

  ws.on('close', function() {
    console.log(`websocket connection closed (${id})`)

    const clientIdx = clients.findIndex((client) => client.id === id)
    clients.splice(clientIdx, 1)
  })
})

const allowedCommands = ['open', 'close']

app.get('/', (req, res) => {
  const { cmd, target: targetString } = req.query
  const target = parseInt(targetString)

  if (!allowedCommands.includes(cmd)) {
    res.sendStatus(400)
    return
  }

  if (Number.isNaN(target)) {
    res.sendStatus(400)
    return
  }

  if (target < 1 || target > 16) {
    res.sendStatus(400)
    return
  }

  const event = { cmd, target }

  clients.forEach((client) => {
    client.ws.send(JSON.stringify(event))
  })

  res.status(200)
  res.send(event)
})
