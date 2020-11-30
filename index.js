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

wss.on('connection', function(ws) {
  var id = setInterval(function() {
    ws.send(JSON.stringify(new Date()), function() {  })
  }, 1000)

  console.log('websocket connection open')

  ws.on('message', function(message) {
    console.log('websocket message received', message)
  })

  ws.on('close', function() {
    console.log('websocket connection close')
    clearInterval(id)
  })
})

app.get('/', (req, res) => {
  res.json({
    data: 'Deu certo!'
  })
})
