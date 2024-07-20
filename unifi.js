import https from 'https'
import fetch from "node-fetch"
import { consola } from 'consola'

import dotenv from 'dotenv'
dotenv.config()

const httpAgent = new https.Agent({ rejectUnauthorized: false })

export const leaveUnlocked = async () => {
  const response = await fetch(`https://${process.env.HOST}/api/v1/developer/doors/${process.env.DOOR}/lock_rule`, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`
    },
    body: '{"type":"keep_unlock"}',
    method: 'PUT',
    agent: httpAgent,
  })

  if (response.ok) {
    const data = await response.json()
    return {success: true, body: data}
  }

  return {success: false, body: response};
}

export const lock = async () => {
  const response = await fetch(`https://${process.env.HOST}/api/v1/developer/doors/${process.env.DOOR}/lock_rule`, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`
    },
    body: '{"type":"reset"}',
    method: 'PUT',
    agent: httpAgent,
  })

  if (response.ok) {
    const data = await response.json()
    return {success: true, body: data}
  }

  return {success: false, body: response};
}
