# Watchful Dig Guard — Render Deployment Guide

This guide walks you through deploying your full-stack safety dashboard and the simulation API server to **Render** (https://render.com/) using the native **Node.js** environment.

Since the project consists of two components (the **Vite / TanStack Start Frontend** and the **TypeScript API Server**), we will deploy them as two separate **Web Services** on Render.

---

## 1. Deploy the API Server (Backend)

First, we will deploy the mock telemetry API server so that we have its live URL ready.

1. **Log in** to your [Render Dashboard](https://dashboard.render.com/) and click **New +** $\rightarrow$ **Web Service**.
2. **Connect your GitHub repository**: Select `watchful-dig-guard`.
3. **Configure the Web Service**:
   * **Name**: `watchful-dig-guard-api`
   * **Language**: `Node` *(Choose standard Node runtime)*
   * **Branch**: `main`
   * **Region**: Choose the region closest to you (e.g., `Singapore` or `Oregon`).
4. **Build & Start Settings**:
   * **Build Command**: `npm install`
   * **Start Command**: `npm run api` *(Uses `tsx` to execute TypeScript on Node natively)*
5. **Environment Variables**:
   Click **Advanced** and add the following variable:
   * `PORT` = `10000` *(Render maps your app to port 10000 by default)*
6. **Deploy**: Click **Create Web Service**. 
   * Once deployed, Render will provide a public URL (e.g., `https://watchful-dig-guard-api.onrender.com`).
   * **Copy this URL**; you will need it for the frontend.

---

## 2. Deploy the Dashboard (Frontend)

Now we will deploy the TanStack Start React front-end and configure it to connect to the newly created backend API.

1. Click **New +** $\rightarrow$ **Web Service** on Render.
2. Select your repository `watchful-dig-guard`.
3. **Configure the Web Service**:
   * **Name**: `watchful-dig-guard-dashboard`
   * **Language**: `Node`
   * **Branch**: `main`
4. **Build & Start Settings**:
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npx vinxi start` *(Vinxi launches the production server automatically using the built assets)*
5. **Environment Variables**:
   Click **Advanced** and add the following variables:
   * `VITE_USE_MOCK` = `false` *(Tells the frontend to query the live API)*
   * `VITE_API_BASE_URL` = `https://watchful-dig-guard-api.onrender.com/api` *(Paste your API Web Service URL here, making sure to append `/api` at the end)*
   * `VITE_LIVE_REFRESH_MS` = `3000` *(Refresh interval in ms)*
6. **Deploy**: Click **Create Web Service**.

---

## 3. Verify the Deployment

* Once both builds complete (status shows **Live**), open your frontend dashboard URL (e.g., `https://watchful-dig-guard-dashboard.onrender.com`).
* Try logging in with:
  * **Email**: `supervisor@site.local`
  * **Password**: `demo1234`
* You should see the safety console fetch live telemetry feeds from your running API server over HTTPS!
