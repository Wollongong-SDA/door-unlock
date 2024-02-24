import express from 'express'
import { leaveUnlocked, lock, login } from './unifi.js'
import { consola } from 'consola'

import dotenv from 'dotenv'
dotenv.config()

let lastTrigger = new Date('1970-01-01')

const app = express()

// Whitelisting
app.use((req, res, next) => {
  // if (!req.ip.includes(process.env.ALLOWED_IP)) {
  //   consola.warn(`Unauthorized IP ${req.ip} requested '${req.path}'!`)
  //   return res.sendStatus(403)
  // }

  // if (process.env.REJECTALL == 'true') {
  //   return res.sendStatus(500)
  // }

  next()
})

app.get('/leaveUnlocked', async (req, res) => {
  if ((new Date() - lastTrigger) / (1000) <= 10) {
    console.warn('Too many requests (leave unlocked within 10 seconds of another command)')
    return res.sendStatus(429)
  }

  const unlockRes = await leaveUnlocked()
  if (!unlockRes.success) {
    consola.error(new Error('Unlock Failed'), unlockRes.body)
    return res.sendStatus(500)
  }

  lastTrigger = Date.now()
  return res.sendStatus(200)
})

app.get('/relock', async (req, res) => {
  const lockRes = await lock()
  if (!lockRes.success) {
    consola.error(new Error('Relock failed'), loginRes.body)
    return res.sendStatus(500)
  }

  lastTrigger = Date.now()
  return res.sendStatus(200)
})

const port = process.env.PORT || 3000
app.listen(port, () => consola.success(`Express started on port ${port}`))
