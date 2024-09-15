import https from 'https'
import fetch from "node-fetch"

import dotenv from 'dotenv'
dotenv.config()

const httpAgent = new https.Agent({ rejectUnauthorized: false })

const request = async (body) => {
  const response = await fetch(`https://${process.env.HOST}/api/v1/developer/doors/${process.env.DOOR}/lock_rule`, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`
    },
    body: body,
    method: 'PUT',
    agent: httpAgent,
  })

  if (response.ok) {
    const data = await response.json()
    return {success: true, body: data}
  }

  return {success: false, body: response};
}

export const leaveUnlocked = async () => {
  return request('{"type":"keep_unlock"}')
}

export const lock = async () => {
  return request('{"type":"reset"}')
}
