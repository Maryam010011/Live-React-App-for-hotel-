# LuxeStay — End-to-End API Traceability Map & System Walkthrough

> **Live Production URL:** [https://reacthotelbooking.vercel.app/](https://reacthotelbooking.vercel.app/)  
> **Tech Stack:** React 18 (TypeScript, Vite) + Node.js (Express.js) + MongoDB Atlas (Mongoose) + Cloudinary CDN API + Resend Email API  
> **Documentation Date:** August 18, 2026  

---

## Executive Summary & System Integration Architecture

LuxeStay relies on three distinct, decoupled API systems working in tandem:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               LUXESTAY API INTEGRATION ARCHITECTURE                      │
└──────────────────────────────────────────────────────────────────────────────────────────┘

    [ CLIENT / BROWSER ]
         │
         ├──────────────────────────────────────┐
         │ (1) HTTP REST API Requests           │ (2) Direct Image Uploads (Binary)
         ▼                                      ▼
    [ PRIMARY REST API ]                   [ EXTERNAL ASSET HOSTING ]
    Express.js (Vercel Serverless / Node)  Cloudinary CDN API
    ├── /api/auth/*                        ├── Host: api.cloudinary.com
    ├── /api/hotels/*                      └── Returns: secure_url HTTPS link
    └── /api/bookings/*                         │
         │                                      │
         │ (Stores HTTPS Image URL)             │
         ▼                                      │
    [ DATABASE ]                                │
    MongoDB Atlas Cloud                         │
    ├── users collection                        │
    ├── hotels collection ◄─────────────────────┘
    └── bookings collection
         │
         │ (3) Outbound Server-to-Server Email Dispatch
         ▼
    [ EXTERNAL TRANSACTIONAL EMAIL API ]
    Resend API (api.resend.com)
    └── Sends HTML confirmation emails to guest inboxes
```

### 1. Primary REST API (MongoDB-Backed)
Hosted on Vercel Serverless (`https://reacthotelbooking.vercel.app/api/*`) and locally via `server/server.js` (`http://localhost:5000`). Handles authentication, JWT issuance, hotel CRUD, and booking reservations.

### 2. Cloudinary CDN API (`api.cloudinary.com`)
Direct browser-to-Cloudinary image upload service. Binary image files are uploaded directly from the React client using unsigned upload presets. Cloudinary processes the file and returns a `secure_url`, which our primary API stores in MongoDB as a lightweight string.

### 3. Resend Transactional Email API (`api.resend.com`)
Outbound server-to-server REST API. Triggered by our Node.js backend (`server/services/emailService.js`) after a booking is written to MongoDB Atlas. This request originates from Vercel serverless containers directly to Resend's API servers.

---

## Environment & Network Port Abstraction

| Environment | Transport Protocol | Port Mechanism | Description |
|---|---|---|---|
| **Production (Vercel)** | HTTPS | **443** (Implicit) | Vercel abstracts listening ports entirely. Express app routes are wrapped in serverless Lambda functions. Incoming traffic is routed over standard HTTPS port 443 to the serverless entrypoint (`api/index.js`). |
| **Local Development** | HTTP | **5000** (Explicit) | `server/server.js` reads `process.env.PORT || 5000` and starts a persistent TCP listener (`app.listen(PORT)`), opening `http://localhost:5000` for client requests. |

---

## 1. GUEST FLOW (Unauthenticated Visitor)

Visitors browsing the site without logging in can view the hotel catalog, search by city, and read hotel details. Creating a booking requires sign-in.

### Master Traceability Table: Guest Role

| Action | Endpoint URL | HTTP Method | Auth Required | Middleware | Controller File & Function | Route File & Line | HTTP Status | Response Summary |
|---|---|---|---|---|---|---|---|---|
| **1. Site Load / Health Check** | `/api/health` | `GET` | ❌ Public | None | Inline Handler (`app.js`) | `server/app.js` (L60) | `200 OK` | `{ status: "ok", database: { status: "connected" } }` |
| **2. Browse Hotel Catalog** | `/api/hotels` | `GET` | ❌ Public | None | `hotelController.js` → `getHotels()` | `server/routes/hotelRoutes.js` (L13) | `200 OK` | `{ status: "success", results: 1703, data: [...] }` |
| **3. Filter Hotels by City** | `/api/hotels?city=Miami` | `GET` | ❌ Public | None | `hotelController.js` → `getHotels()` | `server/routes/hotelRoutes.js` (L13) | `200 OK` | `{ status: "success", results: 50, data: [...] }` |
| **4. View Single Hotel Detail** | `/api/hotels/1` | `GET` | ❌ Public | None | `hotelController.js` → `getHotelById()` | `server/routes/hotelRoutes.js` (L14) | `200 OK` | `{ status: "success", data: { id: 1, name: "Grand Luxury Hotel", ... } }` |
| **5. Attempt Booking (Unauthenticated)** | `/api/bookings` | `POST` | ✅ JWT | `protect` | Blocked before controller | `server/routes/bookingRoutes.js` (L21) | `401 Unauthorized` | `{ status: "fail", message: "Access denied. No token provided. Please log in." }` |
| **6. Direct Access to /admin/hotels** | Client Route Guard | N/A | ✅ Admin | `<ProtectedRoute>` | Blocked on Client Side | `src/App.tsx` (L35) | Client Redirect | Redirected to `/login` before network dispatch |

### Action Details & Payloads: Guest Role

#### Action 2: Browse Hotel Catalog
- **Request URL:** `https://reacthotelbooking.vercel.app/api/hotels`
- **Request Method:** `GET`
- **Request Payload:** None
- **Response Body:**
```json
{
  "status": "success",
  "results": 1703,
  "data": [
    {
      "id": 1,
      "name": "Grand Luxury Hotel",
      "city": "New York",
      "country": "USA",
      "price": 250,
      "rating": 4.7,
      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
    }
  ]
}
```

#### Action 5: Attempt Booking (Unauthenticated)
- **Request URL:** `https://reacthotelbooking.vercel.app/api/bookings`
- **Request Method:** `POST`
- **Request Payload:** `{ "hotelId": 1, "firstName": "Guest" }`
- **Response Status:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": "fail",
  "message": "Access denied. No token provided. Please log in."
}
```

---

## 2. CUSTOMER FLOW (Authenticated Guest User)

Registered customer accounts can manage their profile, execute hotel reservations, and view their personal booking history under "My Bookings".

### Master Traceability Table: Customer Role

| Action | Endpoint URL | HTTP Method | Auth Required | Middleware | Controller File & Function | Route File & Line | HTTP Status | Response Summary |
|---|---|---|---|---|---|---|---|---|
| **1. Register New Account** | `/api/auth/register` | `POST` | ❌ Public | None | `authController.js` → `register()` | `server/routes/authRoutes.js` (L8) | `201 Created` | `{ status: "success", token: "eyJhb...", user: { role: "customer" } }` |
| **2. Account Login** | `/api/auth/login` | `POST` | ❌ Public | None | `authController.js` → `login()` | `server/routes/authRoutes.js` (L11) | `200 OK` | `{ status: "success", token: "eyJhb...", user: { role: "customer" } }` |
| **3. Restore Session on Load** | `/api/auth/me` | `GET` | ✅ JWT | `protect` | `authController.js` → `getMe()` | `server/routes/authRoutes.js` (L14) | `200 OK` | `{ status: "success", user: { id: "...", role: "customer" } }` |
| **4. Execute Hotel Booking** | `/api/bookings` | `POST` | ✅ JWT | `protect` | `bookingController.js` → `createBooking()` | `server/routes/bookingRoutes.js` (L21) | `201 Created` | `{ status: "success", data: { bookingRef: "LX-363171", user: "..." } }` |
| **5. View "My Bookings" Page** | `/api/bookings/my` | `GET` | ✅ JWT | `protect` | `bookingController.js` → `getMyBookings()` | `server/routes/bookingRoutes.js` (L16) | `200 OK` | `{ status: "success", results: 1, data: [...] }` |
| **6. Attempt Admin All-Bookings Route** | `/api/bookings` | `GET` | ✅ Admin | `protect`, `requireAdmin` | Blocked by `requireAdmin` | `server/routes/bookingRoutes.js` (L19) | `403 Forbidden` | `{ status: "fail", message: "Access denied. Administrator privileges required." }` |
| **7. User Logout** | Client Side | N/A | N/A | None | Client State Clearing | `src/components/Header.tsx` (L24) | Local Operation | `localStorage.removeItem('luxestay_token')`; token cleared |

### Action Details & Payloads: Customer Role

#### Action 1: Register New Account
- **Request URL:** `https://reacthotelbooking.vercel.app/api/auth/register`
- **Request Method:** `POST`
- **Request Payload:**
```json
{
  "name": "Walkthrough Customer",
  "email": "walkthrough_cust_1787039009742@example.com",
  "password": "CustomerPass123!"
}
```
- **Response Status:** `201 Created`
- **Response Body:**
```json
{
  "status": "success",
  "message": "Account created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhODQwZDIxZWY2NTIxY2ViYjZjY2FiZSIsImVtYWlsIjoid2Fsa3Rocm91Z2hfY3VzdF8xNzg3MDM5MDA5NzQyQGV4YW1wbGUuY29tIiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzg3MDM5MDE2LCJleHAiOjE3ODc2NDM4MTZ9.SignatureTruncated",
  "user": {
    "id": "6a840d21ef6521cebb6ccabe",
    "name": "Walkthrough Customer",
    "email": "walkthrough_cust_1787039009742@example.com",
    "role": "customer"
  }
}
```

#### Action 4: Execute Hotel Booking
- **Request URL:** `https://reacthotelbooking.vercel.app/api/bookings`
- **Request Method:** `POST`
- **Request Headers:** `Authorization: Bearer <customerToken>`
- **Request Payload:**
```json
{
  "hotelId": 1,
  "hotelName": "Grand Luxury Hotel",
  "firstName": "Walkthrough",
  "lastName": "Customer",
  "email": "walkthrough_cust_1787039009742@example.com",
  "phone": "+15550009999",
  "checkIn": "2026-11-01",
  "checkOut": "2026-11-05",
  "adults": 2,
  "children": 0,
  "roomType": "deluxe",
  "totalPrice": 1000
}
```
- **Response Status:** `201 Created`
- **Response Body:**
```json
{
  "status": "success",
  "message": "Booking created successfully",
  "data": {
    "user": "6a840d21ef6521cebb6ccabe",
    "bookingRef": "LX-363171",
    "hotelId": 1,
    "hotelName": "Grand Luxury Hotel",
    "firstName": "Walkthrough",
    "lastName": "Customer",
    "email": "walkthrough_cust_1787039009742@example.com",
    "totalPrice": 1000,
    "status": "confirmed",
    "_id": "6a840d28ef6521cebb6ccabf",
    "createdAt": "2026-08-18T07:43:34.000Z"
  }
}
```

#### Action 5: View "My Bookings" Page
- **Request URL:** `https://reacthotelbooking.vercel.app/api/bookings/my`
- **Request Method:** `GET`
- **Request Headers:** `Authorization: Bearer <customerToken>`
- **Response Status:** `200 OK`
- **Response Body:**
```json
{
  "status": "success",
  "results": 1,
  "data": [
    {
      "id": "6a840d28ef6521cebb6ccabf",
      "user": "6a840d21ef6521cebb6ccabe",
      "bookingRef": "LX-363171",
      "hotelName": "Grand Luxury Hotel",
      "totalPrice": 1000,
      "status": "confirmed"
    }
  ]
}
```

#### Action 6: Attempt Admin Route (`GET /api/bookings`)
- **Request URL:** `https://reacthotelbooking.vercel.app/api/bookings`
- **Request Method:** `GET`
- **Request Headers:** `Authorization: Bearer <customerToken>`
- **Response Status:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": "fail",
  "message": "Access denied. Administrator privileges required."
}
```

---

## 3. ADMIN FLOW (Authenticated Administrator)

Admin accounts have full privilege to manage the hotel directory (Create, Edit, Delete) and inspect all system reservations across all users.

### Master Traceability Table: Admin Role

| Action | Endpoint URL | HTTP Method | Auth Required | Middleware | Controller File & Function | Route File & Line | HTTP Status | Response Summary |
|---|---|---|---|---|---|---|---|---|
| **1. Admin Login** | `/api/auth/login` | `POST` | ❌ Public | None | `authController.js` → `login()` | `server/routes/authRoutes.js` (L11) | `200 OK` | `{ status: "success", token: "eyJhb...", user: { role: "admin" } }` |
| **2. Access Admin Bookings List** | `/api/bookings` | `GET` | ✅ Admin | `protect`, `requireAdmin` | `bookingController.js` → `getBookings()` | `server/routes/bookingRoutes.js` (L19) | `200 OK` | `{ status: "success", results: 14, data: [...] }` |
| **3A. Upload Image to CDN** | `https://api.cloudinary.com/v1_1/vxwyhut0/image/upload` | `POST` | ❌ Direct CDN | Cloudinary API | Cloudinary Ingestion Engine | External API | `200 OK` | `{ secure_url: "https://res.cloudinary.com/...", public_id: "..." }` |
| **3B. Create Hotel Document** | `/api/hotels` | `POST` | ✅ Admin | `protect`, `requireAdmin` | `hotelController.js` → `createHotel()` | `server/routes/hotelRoutes.js` (L17) | `201 Created` | `{ status: "success", data: { id: "walkthrough-1787039519960", ... } }` |
| **4. Edit Hotel Listing** | `/api/hotels/:id` | `PUT` | ✅ Admin | `protect`, `requireAdmin` | `hotelController.js` → `updateHotel()` | `server/routes/hotelRoutes.js` (L18) | `200 OK` | `{ status: "success", data: { price: 490, ... } }` |
| **5. Delete Hotel Listing** | `/api/hotels/:id` | `DELETE` | ✅ Admin | `protect`, `requireAdmin` | `hotelController.js` → `deleteHotel()` | `server/routes/hotelRoutes.js` (L19) | `200 OK` | `{ status: "success", message: "Hotel deleted successfully", data: null }` |
| **6. View All System Bookings** | `/api/bookings` | `GET` | ✅ Admin | `protect`, `requireAdmin` | `bookingController.js` → `getBookings()` | `server/routes/bookingRoutes.js` (L19) | `200 OK` | Returns reservations across ALL registered customers |
| **7. Dispatch Confirmation Email** | `https://api.resend.com/emails` | `POST` (Server) | ✅ Resend API Key | Server-side Execution | `emailService.js` → `sendBookingConfirmationEmail()` | Server-to-Server Call | `200 OK` | Resend API returns `{ id: "re_..." }`; triggers after booking save |

### Action Details & Payloads: Admin Role

#### Action 3A: Direct Cloudinary Image Upload (External API)
- **Request URL:** `https://api.cloudinary.com/v1_1/vxwyhut0/image/upload`
- **Request Method:** `POST`
- **Payload Format:** `multipart/form-data`
  - `file`: `[Binary Image Data]`
  - `upload_preset`: `luxestay_uploads`
- **Response Status:** `200 OK`
- **Response Body:**
```json
{
  "asset_id": "f8a92b3c4d5e",
  "public_id": "luxestay_uploads/hotel_789",
  "secure_url": "https://res.cloudinary.com/vxwyhut0/image/upload/v1692345678/luxestay_uploads/hotel_789.jpg",
  "format": "jpg",
  "width": 1200,
  "height": 800
}
```

#### Action 3B: Create Hotel Document (Primary REST API)
- **Request URL:** `https://reacthotelbooking.vercel.app/api/hotels`
- **Request Method:** `POST`
- **Request Headers:** `Authorization: Bearer <adminToken>`
- **Request Payload:**
```json
{
  "id": "walkthrough-1787039519960",
  "name": "Walkthrough Grand Hotel",
  "city": "Paris",
  "country": "France",
  "address": "15 Avenue Montaigne",
  "price": 450,
  "rating": 4.9,
  "description": "Luxury testing hotel created during walkthrough.",
  "image": "https://res.cloudinary.com/vxwyhut0/image/upload/v1692345678/luxestay_uploads/hotel_789.jpg",
  "amenities": ["WiFi", "Spa", "Pool"],
  "rooms": 100,
  "type": "Luxury"
}
```
- **Response Status:** `201 Created`
- **Response Body:**
```json
{
  "status": "success",
  "data": {
    "id": "walkthrough-1787039519960",
    "name": "Walkthrough Grand Hotel",
    "city": "Paris",
    "price": 450,
    "image": "https://res.cloudinary.com/vxwyhut0/image/upload/v1692345678/luxestay_uploads/hotel_789.jpg",
    "createdAt": "2026-08-18T07:47:00.000Z"
  }
}
```

#### Action 4: Edit Hotel Listing
- **Request URL:** `https://reacthotelbooking.vercel.app/api/hotels/walkthrough-1787039519960`
- **Request Method:** `PUT`
- **Request Headers:** `Authorization: Bearer <adminToken>`
- **Request Payload:**
```json
{
  "price": 490,
  "description": "Updated description for walkthrough hotel."
}
```
- **Response Status:** `200 OK`
- **Response Body:**
```json
{
  "status": "success",
  "message": "Hotel updated successfully",
  "data": {
    "id": "walkthrough-1787039519960",
    "price": 490,
    "description": "Updated description for walkthrough hotel."
  }
}
```

#### Action 5: Delete Hotel Listing
- **Request URL:** `https://reacthotelbooking.vercel.app/api/hotels/walkthrough-1787039519960`
- **Request Method:** `DELETE`
- **Request Headers:** `Authorization: Bearer <adminToken>`
- **Response Status:** `200 OK`
- **Response Body:**
```json
{
  "status": "success",
  "message": "Hotel deleted successfully",
  "data": null
}
```

#### Action 7: Resend Email API Trigger (Server-Side Internal Execution)
- **Why this does NOT appear in Browser DevTools:**  
  Browser DevTools Network tab records network traffic that originates from the client's web browser. The Resend email call is a **server-to-server HTTP request** executed by Vercel serverless function (`server/controllers/bookingController.js` calling `sendBookingConfirmationEmail()` in `server/services/emailService.js`).
- **Server Execution Code:**
```javascript
// server/controllers/bookingController.js (Line 101)
try {
  await sendBookingConfirmationEmail(newBooking);
} catch (emailErr) {
  console.error('⚠️ [Resend] Non-fatal email sending error:', emailErr.message || emailErr);
}
```
- **Server Terminal Output:**
```text
📡 [Resend] Sending confirmation email to guest@example.com for booking LX-363171...
✅ [Resend] Confirmation email sent successfully to guest@example.com. Email ID: re_H5wxNWLk...
```

---

## Complete API Route & Middleware Reference Map

| HTTP Method | API Path | Access Level | Middleware Pipeline | Primary Controller Function |
|---|---|---|---|---|
| `GET` | `/api/health` | ❌ Public | None | Inline Handler (`app.js`) |
| `POST` | `/api/auth/register` | ❌ Public | None | `authController.register` |
| `POST` | `/api/auth/login` | ❌ Public | None | `authController.login` |
| `GET` | `/api/auth/me` | ✅ Customer / Admin | `protect` | `authController.getMe` |
| `GET` | `/api/hotels` | ❌ Public | None | `hotelController.getHotels` |
| `GET` | `/api/hotels/:id` | ❌ Public | None | `hotelController.getHotelById` |
| `POST` | `/api/hotels` | ✅ Admin Only | `protect` → `requireAdmin` | `hotelController.createHotel` |
| `PUT` | `/api/hotels/:id` | ✅ Admin Only | `protect` → `requireAdmin` | `hotelController.updateHotel` |
| `DELETE` | `/api/hotels/:id` | ✅ Admin Only | `protect` → `requireAdmin` | `hotelController.deleteHotel` |
| `POST` | `/api/bookings` | ✅ Customer / Admin | `protect` | `bookingController.createBooking` |
| `GET` | `/api/bookings/my` | ✅ Customer / Admin | `protect` | `bookingController.getMyBookings` |
| `GET` | `/api/bookings` | ✅ Admin Only | `protect` → `requireAdmin` | `bookingController.getBookings` |
| `GET` | `/api/bookings/:id` | ✅ Admin Only | `protect` → `requireAdmin` | `bookingController.getBookingById` |
| `PUT` | `/api/bookings/:id` | ✅ Admin Only | `protect` → `requireAdmin` | `bookingController.updateBooking` |
| `DELETE` | `/api/bookings/:id` | ✅ Admin Only | `protect` → `requireAdmin` | `bookingController.deleteBooking` |
