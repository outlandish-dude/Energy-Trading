Open powershell then copy the following 
Backend : (change the directory to your server folder in powershell)
cd "e:\college\4th sem\lab\software lab\energy trading vs code\server"
Copy-Item .env.example .env
npm install
npm run dev

Frontend in new tab in powershell:(change the directory to your client folder in powershell)
cd "e:\college\4th sem\lab\software lab\energy trading vs code\client"
Copy-Item .env.example .env
npm install
npm run dev










# VoltShare - EV Energy Trading Platform (Simulation)

Demo simulation web app for EV energy trading across India.

## Simulation disclaimer
Demo simulation. No real energy or payments involved.

## Stack
- Frontend: React + TypeScript + Tailwind + Framer Motion + React Leaflet (OpenStreetMap)
- Backend: Node.js + Express + MongoDB + Socket.IO
- Payments: Virtual wallet credits (INR / U+20B9)
- Blockchain: Mock transaction ledger with fake SHA hashes

## Project structure
- `server/` Express API, Mongo models, pricing, simulation engine, WebSockets
- `client/` React app with map, role actions, dashboards, demo runners

## Backend setup
1. Open terminal in `server`
2. Copy `.env.example` to `.env`
3. Install deps: `npm install`
4. Start API: `npm run dev`

## Frontend setup
1. Open terminal in `client`
2. Copy `.env.example` to `.env`
3. Install deps: `npm install`
4. Start app: `npm run dev`

## Main APIs
- `GET /api/marketplace/listings`
- `POST /api/marketplace/start-trade`
- `POST /api/marketplace/emergency/request`
- `POST /api/marketplace/rescue/request`
- `POST /api/marketplace/demo/:scenario` (`solar`, `hospital`, `rescue`, `market`)
- `POST /api/blockchain/createTransaction`
- `GET /api/blockchain/transactions`
- `POST /api/admin/spawn-users`
- `POST /api/admin/spawn-vehicles`
- `POST /api/admin/trigger-emergency`

## Real-time simulation
- Vehicle state updates every 1 second via Socket.IO event: `simulation:update`
- Vehicles animate on India map with route polylines
- Trade progress transitions: `created -> moving -> charging -> completed`
- Wallet and battery updates on completion

## Demo buttons in UI
1. Charge from Solar Home
2. Hospital Emergency Power
3. Highway Rescue
4. Live Energy Marketplace

