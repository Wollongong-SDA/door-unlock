// import fetch from "node-fetch";
import {fetch, CookieJar} from "node-fetch-cookies";
import https from 'https';
import dotenv from 'dotenv' ;
import express from 'express';
dotenv.config()

const httpAgent = new https.Agent({
  rejectUnauthorized: false
})

const cookieJar = new CookieJar('./CookieJar.json');
let token;

let lastLogin = new Date("1970-01-01");

const login = async () => {
  const username = process.env.USER;
  const password = process.env.PASS;
  const path = "https://10.2.100.1/api/auth/login";

  if ((new Date() - lastLogin) / (1000 * 60) <= 30) {
    console.info("Skipping (already logged in)")
    return
  }

  const response = await fetch(cookieJar, path, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      password: password,
      remember: true
    }),
    agent: httpAgent
  })

  if (response.ok) {
    console.log("Login Ok")
    const data = await response.json();
    console.log(data);
    // console.log(response.headers);
    lastLogin = Date.now()
    token = response.headers.get('x-csrf-token')
  } else {
    console.log("Login Failed")
    console.log(response)
  }

}

const leaveUnlocked = async () => {
  const response = await fetch(cookieJar, "https://10.2.100.1/proxy/access/api/v2/device/d8b3702b4d56/lock_rule", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-AU,en",
      "content-type": "application/json",
      "x-csrf-token": token
    },
    "referrerPolicy": "no-referrer",
    "body": "{\"type\":\"keep_unlock\"}",
    "method": "PUT",
    "mode": "cors",
    "credentials": "include",
    agent: httpAgent
  });

  if (response.ok) {
    console.log("Leave Unlocked Ok")
    const data = await response.json();
    console.log(data);
  } else {
    console.log("Leave Unlocked Failed")
    const data = await response.headers;
    console.log(data);
  }
}

const lock = async () => {
  const response = await fetch(cookieJar, "https://10.2.100.1/proxy/access/api/v2/device/d8b3702b4d56/lock_rule", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-AU,en",
      "content-type": "application/json",
      "x-csrf-token": token
    },
    "referrerPolicy": "no-referrer",
    "body": "{\"type\":\"reset\"}",
    "method": "PUT",
    "mode": "cors",
    "credentials": "include",
    agent: httpAgent
  });

  if (response.ok) {
    console.log("Relock Ok")
    const data = await response.json();
    console.log(data);
  } else {
    console.log("Relock Failed")
    console.log(response)
  }
}

const app = express()
app.get('/leaveUnlocked', async (req, res) => {
  if (!req.ip.includes("10.2.140.2")) {
    return res.sendStatus(403);
  }

  await login();
  await leaveUnlocked();

  res.sendStatus(200);
})
app.get('/relock', async (req, res) => {
  if (!req.ip.includes("10.2.140.2")) {
    return res.sendStatus(403);
  }

  await login();
  await lock();

  res.sendStatus(200);
})

app.listen(3000, () => console.log('Started listening'))