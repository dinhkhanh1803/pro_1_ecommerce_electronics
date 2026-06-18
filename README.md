# Electronics E-Commerce Website

Full-stack e-commerce project for electronics products.

## Tech Stack

- Frontend: React 18, TypeScript, Vite, TailwindCSS
- Backend: Node.js, Express, MongoDB (Mongoose), Passport Google OAuth, JWT
- Services: Cloudinary, Nodemailer, VNPay, MoMo

## Local Setup

### 1. Clone

```bash
git clone <your-repo-url>
cd pro_1_ecommerce_electronics
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# Core
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/electronics_db

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
OTP_EXPIRE=300000

# Frontend URLs (used by CORS + redirects)
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (used by backend/src/config/cloudinary.js)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# VNPay / MoMo demo mock (for coursework/demo)
# No payment gateway merchant keys are required.
```

Run backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd ../client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

## Production Environment Variables

### Backend (Render / Vercel)

Required:

- `NODE_ENV=production`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `FRONTEND_URL` (your deployed frontend URL, e.g. `https://your-frontend.vercel.app`)
- `CLIENT_URL` (same as frontend URL, or comma-separated allowed origins if needed)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
Optional:

- `PORT` (platform usually injects this)
- `OTP_EXPIRE`

### Frontend (Vercel)

Required:

- `VITE_API_URL` (deployed backend URL, e.g. `https://your-backend.onrender.com`)

## Deploy Notes (Vercel + Render)

- Backend CORS is production-safe and reads allowed origins from `CLIENT_URL` / `FRONTEND_URL`.
- In production, localhost origins are not auto-allowed.
- VNPay secrets and return URL are required at runtime; fake fallback values are not used.
- `client/vercel.json` is included for SPA routing rewrite.

## Security Notes

- Never commit `.env` files.
- Never expose secret values in client code or repository.
