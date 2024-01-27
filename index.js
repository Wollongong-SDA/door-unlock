import dotenv from 'dotenv';
import express from 'express';
import {leaveUnlocked, lock, login} from './unifi.js'
import { consola, createConsola } from "consola";

dotenv.config()
let lastTrigger = new Date('1970-01-01')

const app = express()

// Whitelisting
app.use((req, res, next) => {
  if (!req.ip.includes("10.2.140.2")) {
    consola.warn(`Unauthorized IP ${req.ip} requested '${req.path}'!`)
    return res.sendStatus(403)
  }

  next()
})

app.get('/leaveUnlocked', async (req, res) => {
  const loginRes = await login();
  if (!loginRes.success) {
    consola.error(new Error("Login Failed"), loginRes.body)
    res.sendStatus(500)
  }

  const unlockRes = await leaveUnlocked();
  if (!unlockRes.success) {
    consola.error(new Error("Unlock Failed"), unlockRes.body)
    res.sendStatus(500)
  }

  res.sendStatus(200);
})

app.get('/relock', async (req, res) => {
  const loginRes = await login();
  if (!loginRes.success) {
    consola.error(new Error("Login Failed"), loginRes.body)
    res.sendStatus(500)
  }

  const lockRes = await lock();
  if (!lockRes.success) {
    consola.error(new Error("Relock failed"), loginRes.body)
    res.sendStatus(500)
  }

  res.sendStatus(200);
})

const port = process.env.PORT || 3000
app.listen(port, () => consola.success(`Express started on port ${port}`))