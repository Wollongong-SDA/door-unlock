import express from 'express'
import { leaveUnlocked, lock } from './unifi.js'
import { consola } from 'consola'
import dotenv from 'dotenv'

let lastTrigger = new Date('1970-01-01')

const app = express()
dotenv.config()

app.use((req, res, next) => {
  if (!req.ip.includes(process.env.ALLOWED_IP)) {
    consola.warn(`Unauthorized IP ${req.ip} requested '${req.path}'!`)
    return res.sendStatus(403)
  }

  next()
})

app.get('/leaveUnlocked', async (req, res) => {
  consola.info(`Authorized IP ${req.ip} requested '${req.path}'!`)
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
  consola.info(`Authorized IP ${req.ip} requested '${req.path}' successfully.`)
  return res.sendStatus(200)
})

app.get('/relock', async (req, res) => {
  consola.info(`Authorized IP ${req.ip} requested '${req.path}'!`)
  const lockRes = await lock()
  if (!lockRes.success) {
    consola.error(new Error('Relock failed'), lockRes.body)
    return res.sendStatus(500)
  }

  lastTrigger = Date.now()
  consola.info(`Authorized IP ${req.ip} requested '${req.path}' successfully.`)
  return res.sendStatus(200)
})

app.listen(3000, () => consola.success('Express started on port 3000 (inside the container)'))
