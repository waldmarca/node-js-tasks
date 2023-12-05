const express = require('express')
require('dotenv').config()
const app = express()

const LIMIT = process.env.LIMIT
const DELAY = process.env.DELAY
const PORT = process.env.PORT
let date
let connections = []

app.get('/date', (req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')
  connections.push(res)
})

let tick = 0
setTimeout(function run() {
  date = new Date().toUTCString()
  console.log(`${tick}, at time ${date}`)
  if (++tick > LIMIT) {
    connections.map((res) => {
      res.write(`END\n`)
      res.end()
    })
    connections = []
    tick = 0
  }
  connections.map((res, i) => {
    res.write(`Hello ${i} user! Tick: ${tick}, date: ${date}\n`)
  })
  setTimeout(run, DELAY)
}, DELAY)

app.listen(PORT, () => {
  console.log(`Server is running port on ${PORT}`)
})