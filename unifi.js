import https from 'https'
import {fetch, CookieJar} from "node-fetch-cookies"
import { consola, createConsola } from 'consola'

import dotenv from 'dotenv'
dotenv.config()

let token
let lastLogin = new Date('1970-01-01')

const cookieJar = new CookieJar('./CookieJar.json')

const httpAgent = new https.Agent({ rejectUnauthorized: false })

export const login = async () => {
  if ((new Date() - lastLogin) / (1000 * 60) <= 30) {
    console.info('Skipping (already logged in)')
    return {success: true, body: {}}
  }

  const response = await fetch(cookieJar, 'https://10.2.100.1/api/auth/login', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      username: process.env.USERNAME,
      password: process.env.PASS,
      remember: true,
    }),
    agent: httpAgent,
  })

  if (response.ok) {
    lastLogin = Date.now()
    token = response.headers.get('x-csrf-token')
    const data = response.json()
    return {success: true, body: data}
  }

  return {success: false, body: response};
}

export const leaveUnlocked = async () => {
  const response = await fetch(cookieJar, 'https://10.2.100.1/proxy/access/api/v2/device/d8b3702b4d56/lock_rule', {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-AU,en',
      'content-type': 'application/json',
      'x-csrf-token': token,
    },
    referrerPolicy: 'no-referrer',
    body: '{"type":"keep_unlock"}',
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    agent: httpAgent,
  })

  if (response.ok) {
    lastLogin = Date.now()
    token = response.headers.get('x-csrf-token')
    const data = response.json()
    return {success: true, body: data}
  }

  return {success: false, body: response};
}

export const lock = async () => {
  const response = await fetch(cookieJar, 'https://10.2.100.1/proxy/access/api/v2/device/d8b3702b4d56/lock_rule', {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-AU,en',
      'content-type': 'application/json',
      'x-csrf-token': token,
    },
    referrerPolicy: 'no-referrer',
    body: '{"type":"reset"}',
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    agent: httpAgent,
  })

  if (response.ok) {
    lastLogin = Date.now()
    token = response.headers.get('x-csrf-token')
    const data = response.json()
    return {success: true, body: data}
  }

  return {success: false, body: response};
}
