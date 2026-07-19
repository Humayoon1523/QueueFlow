# QueueFlow AI - Intelligent Hybrid Queue & Order Coordination System

**QueueFlow AI** is a Next.js App Router application built for high-volume takeaway restaurants (focusing on Chapathi & Chenna Gravy).

---

## 🌟 Key Features

1. **Customer Pre-Order App (`/`)**:
   - Menu ordering (Chapathi ₹15, Chenna ₹30).
   - Multi-Payment Options: **Online UPI**, **Debit/Credit Card**, and **💵 Cash on Takeout / Pickup**.
   - Live Token Tracker with automated progression (PENDING ➔ PREPARING ➔ PACKING ➔ READY ➔ DELIVERED).
   - Automated Order History archiving when food is handed over.
   - PWA Installable on Android & iOS.

2. **Manager Walk-in POS Portal (`/manager`)**:
   - Counter POS token issuer with thermal receipt printer modal.
   - Live Central Queue table & Order History tab.
   - Customer SMS/Notification alert launcher.

3. **Delivery & Packing Station (`/delivery`)**:
   - Kitchen Quantity Aggregator (calculates total Chapathis and Chenna containers needed).
   - Web Speech Synthesis Text-to-Speech audio broadcast for hands-free cooks.

4. **AI Queue Analytics (`/analytics`)**:
   - Server-side Machine Learning Queue Wait Time Predictor.
   - Rush Hour forecasting & cook throughput capacity % monitoring.

5. **Integrated Payment Gateways (`/api/payment/*`)**:
   - Razorpay, PhonePe UPI & Stripe checkout order creation & HMAC signature verification.

---

## ☁️ Permanent Cloud Deployment Guide (24/7 Zero Downtime)

### Option 1: Vercel (Recommended - 1-Click Zero Downtime)
1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "QueueFlow AI Cloud Build"
   git remote add origin https://github.com/your-username/queueflow.git
   git push -u origin main
   ```
2. Go to [Vercel.com](https://vercel.com) -> **Add New Project**.
3. Import your `queueflow` repository.
4. Set Environment Variables (optional):
   - `RAZORPAY_KEY_ID`: `rzp_live_your_key`
   - `RAZORPAY_KEY_SECRET`: `your_secret`
5. Click **Deploy**. Vercel gives you an instant `https://queueflow-ai.vercel.app` URL with automated HTTPS SSL & PWA support!

### Option 2: Render or Railway (Docker / Node Server)
1. Create a Web Service on Render or Railway.
2. Build Command: `npm run build`
3. Start Command: `npm run start`
4. Port: `3000`

---

## 🚀 Local Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production build test
npm run build
```
