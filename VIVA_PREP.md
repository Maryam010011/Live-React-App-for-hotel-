# LuxeStay — Master Technical Viva Defense & Backend Guide

> **Project Name:** LuxeStay Hotel Booking & Management Platform  
> **Tech Stack:** React 18 (TypeScript, Vite) + Node.js (Express.js) + MongoDB Atlas (Mongoose) + Cloudinary API + Resend Email API  
> **Target Audience:** University Supervisor / Technical Examiner  

---

## 1. ARCHITECTURE OVERVIEW

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 LUXESTAY SYSTEM ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  [ CLIENT / BROWSER ]
       │
       ▼
  React 18 + Vite (SPA)
  ├── UI Pages (Home, HotelDetail, Booking, Admin CRUD)
  ├── Custom Components (ImageUploader, HotelCard, SearchBar)
  └── Services (hotelService.ts, bookingService.ts)
       │
       │  HTTP / REST API Requests (JSON)
       ▼
  [ BACKEND REST API ]
  Express.js Server (Local `server.js` | Vercel Serverless `api/index.js`)
  ├── Middleware (CORS, JSON Parser, MongoDB Pre-flight Connection Gate)
  ├── Routes (/api/hotels, /api/bookings, /api/health)
  ├── Controllers (hotelController.js, bookingController.js)
  └── Models (Hotel.js, Booking.js via Mongoose ODM)
       │
       ├─────────────────────────┬─────────────────────────┐
       ▼                         ▼                         ▼
  [ PRIMARY DATABASE ]      [ ASSET STORAGE ]      [ NOTIFICATION SERVICE ]
  MongoDB Atlas (Cloud)     Cloudinary CDN         Resend Email API
  ├── `hotels` collection   ├── Hotel Images (JPG/WEBP) └── HTML Booking Confirmation
  └── `bookings` collection └── Returns `secure_url`    Emails to Guest Inboxes
```

### Directory & File Responsibilities

| Directory / File | Path | Role & Purpose |
|---|---|---|
| **Server Root** | `server/app.js` | Express app configuration, CORS setup, DB middleware, and route mounting. |
| **Local Entrypoint** | `server/server.js` | Local development runner (`node server.js`); connects to MongoDB Atlas and starts the HTTP port listener. |
| **Vercel Entrypoint** | `api/index.js` | Serverless function entrypoint for production on Vercel; handles on-demand request execution. |
| **Database Config** | `server/config/db.js` | Mongoose connection manager with connection caching and fail-fast settings. |
| **Models** | `server/models/` | Mongoose data schemas defining field types, validation rules, and collection structure (`Hotel.js`, `Booking.js`). |
| **Controllers** | `server/controllers/` | Backend business logic: querying DB, creating documents, updating, deleting, and triggering external services (`hotelController.js`, `bookingController.js`). |
| **Routes** | `server/routes/` | Express route definitions mapping HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) to controller functions. |
| **Email Service** | `server/services/emailService.js` | Generates branded HTML emails and dispatches them via the Resend Node.js SDK. |
| **Data Migration** | `server/seed.js` | Standalone migration script that fetched 1,700 real hotels from LiteAPI and populated MongoDB Atlas. |
| **Frontend Services** | `src/services/` | Client-side API layer (`hotelService.ts`, `bookingService.ts`) executing `fetch()` calls to the Express backend. |

---

## 2. HOW THE SERVER STARTS AND CONNECTS TO MONGODB

### Server Startup (`server/server.js`)

In local development, the backend starts by awaiting the database connection **before** opening the port to incoming HTTP traffic:

```javascript
// server/server.js
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('Initiating database connection...');
    await connectDB(); // 1. Connect to MongoDB Atlas first
    
    app.listen(PORT, () => { // 2. Only start listening once connected
      console.log(`🚀 LuxeStay Backend Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
```

### Database Connection Manager (`server/config/db.js`)

```javascript
// server/config/db.js
import mongoose from 'mongoose';

// Fail fast if database is disconnected instead of hanging for 10 seconds
mongoose.set('bufferCommands', false);

let cachedConnectionPromise = null;

export const connectDB = async () => {
  // 1. Return immediately if already connected (readyState 1 = connected)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. Reuse in-flight connection promise across warm serverless invocations
  if (cachedConnectionPromise && mongoose.connection.readyState === 2) {
    return cachedConnectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI;

  try {
    cachedConnectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    const conn = await cachedConnectionPromise;
    console.log(`✅ MongoDB connected to: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    cachedConnectionPromise = null;
    console.error('❌ MongoDB connection error details:', error.message);
    throw error;
  }
};
```

### Breakdown of the MongoDB Connection String

```
mongodb+srv://maryam51214ali_db_user:gjCkkcGV33X6aOSn@cluster0.tejkdt5.mongodb.net/luxestay?retryWrites=true&w=majority&appName=Cluster0
│             │                       │               │                       │         │
│             │                       │               │                       │         └─ Cluster options (automatic retry on writes)
│             │                       │               │                       └─ Target Database Name inside cluster (`luxestay`)
│             │                       │               └─ Cluster Hostname (managed by MongoDB Atlas)
│             │                       └─ Database User Password
│             └─ Database User Username
└─ Protocol (SRV DNS record for automatic replica set member discovery)
```

### 🐞 Real Debugging Case Study to Mention in Viva

> **The "Buffering Timed Out" Bug:**  
> Early on, database queries were failing with `MongooseError: Operation hotels.find() buffering timed out after 10000ms`.  
> 
> **Why it happened:** By default, Mongoose buffers queries in memory when not connected, waiting up to 10 seconds. In our initial code, `connectDB()` was called without an `await` before `app.listen()`, meaning the Express HTTP server started accepting user requests before the TLS connection to Atlas completed.  
> 
> **How we fixed it:**
> 1. Set `mongoose.set('bufferCommands', false)` so operations fail fast with a descriptive error rather than silently stalling.
> 2. Structured `startServer()` to `await connectDB()` before `app.listen()`.
> 3. Added a global connection gate middleware in `server/app.js` so every request (local and serverless) verifies the database connection before reaching the controller.

---

## 3. HOW EXTERNAL DATA (LiteAPI) WAS MIGRATED INTO MONGODB

### Migration vs Live API Calls
- **Previous State:** The app was trying to fetch live hotel search results directly from a third-party API (**LiteAPI**) at runtime on the client. This had rate limits, caused latency, and exposed API keys.
- **Current Architecture:** We ran a **one-time offline migration script** (`server/seed.js`). It queried LiteAPI for 34 global cities, cleaned the HTML data, mapped it to our Mongoose schema, and inserted **1,700 real hotel documents** permanently into our MongoDB Atlas database.
- **Runtime:** During normal user operation, the application communicates **only** with our own MongoDB database. **LiteAPI is never called during user requests.**

### The Migration Script (`server/seed.js`)

```javascript
// server/seed.js — Sanitization Function
function cleanHtmlDescription(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')                  // Strip remaining HTML tags
    .replace(/&amp;/g, '&')                   // Decode HTML entities
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n\n');
}

// Mapping LiteAPI JSON to Mongoose Hotel Schema
function mapLiteApiToHotel(raw, index, targetCity) {
  return {
    id: index + 1,
    name: raw.name || 'Boutique Hotel',
    city: targetCity.city,
    country: targetCity.countryCode,
    address: raw.address || `${targetCity.city} City Center`,
    price: raw.startingFrom?.amount ? Math.round(raw.startingFrom.amount) : 150 + (index % 5) * 25,
    rating: raw.reviewScore ? parseFloat(raw.reviewScore.toFixed(1)) : 4.5,
    description: cleanHtmlDescription(raw.hotelDescription || raw.description),
    image: raw.main_photo || raw.thumbnail || 'https://images.unsplash.com/...',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Room Service'],
    rooms: raw.rooms || 100,
    type: (raw.stars >= 5) ? 'Luxury' : (raw.stars === 4) ? 'Deluxe' : 'Business',
  };
}
```

---

## 4. HOW CUSTOM DATA IS ADDED (CRUD ADMIN FLOW)

When an admin adds or modifies a hotel in the UI, it goes through a standard 5-step full-stack data flow:

```
[Admin UI: HotelForm.tsx] 
       │ 1. Form Submit
       ▼
[Frontend Service: hotelService.ts] 
       │ 2. HTTP POST /api/hotels (fetch)
       ▼
[Express Route: hotelRoutes.js] 
       │ 3. router.post('/', createHotel)
       ▼
[Controller: hotelController.js] 
       │ 4. HotelModel.create(req.body)
       ▼
[Database: MongoDB Atlas `hotels` collection]
```

### Real Code Path for Hotel Creation

#### Step 1: Frontend Service (`src/services/hotelService.ts`)
```typescript
// src/services/hotelService.ts
export const createHotel = async (hotelData: Partial<Hotel>): Promise<Hotel> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(hotelData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create hotel');
  }

  const json = await response.json();
  return json.data;
};
```

#### Step 2: Express Route (`server/routes/hotelRoutes.js`)
```javascript
// server/routes/hotelRoutes.js
import express from 'express';
import { getHotels, getHotelById, createHotel, updateHotel, deleteHotel } from '../controllers/hotelController.js';

const router = express.Router();

router.route('/')
  .get(getHotels)
  .post(createHotel);   // Matches POST /api/hotels

router.route('/:id')
  .get(getHotelById)
  .put(updateHotel)     // Matches PUT /api/hotels/:id
  .delete(deleteHotel); // Matches DELETE /api/hotels/:id

export default router;
```

#### Step 3: Controller Logic (`server/controllers/hotelController.js`)
```javascript
// server/controllers/hotelController.js
export const createHotel = async (req, res) => {
  try {
    const { name, city, country, address, price, description, image, amenities, rooms, type } = req.body;

    // Validation
    if (!name || !city || !country || !address || price === undefined || !description || !image) {
      return res.status(400).json({ status: 'fail', message: 'Missing required fields' });
    }

    const nextId = Date.now(); // Unique identifier

    const newHotel = await HotelModel.create({
      id: req.body.id || nextId,
      name,
      city,
      country,
      address,
      price: Number(price),
      rating: req.body.rating ? Number(req.body.rating) : 4.5,
      description,
      image, // Cloudinary secure_url
      amenities: Array.isArray(amenities) ? amenities : ['WiFi', 'Pool'],
      rooms: rooms ? Number(rooms) : 50,
      type: type || 'Luxury',
    });

    return res.status(201).json({ status: 'success', data: newHotel });
  } catch (error) {
    return res.status(400).json({ status: 'fail', message: error.message });
  }
};
```

#### Step 4: Update & Delete Operations
```javascript
// PUT /api/hotels/:id
export const updateHotel = async (req, res) => {
  const { id } = req.params;
  const updated = await HotelModel.findOneAndUpdate(
    { $or: [{ id: Number(id) || 0 }, { _id: id }] },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  return res.status(200).json({ status: 'success', data: updated });
};

// DELETE /api/hotels/:id
export const deleteHotel = async (req, res) => {
  const { id } = req.params;
  await HotelModel.findOneAndDelete({ $or: [{ id: Number(id) || 0 }, { _id: id }] });
  return res.status(200).json({ status: 'success', message: 'Hotel deleted successfully' });
};
```

---

## 5. FULL CRUD MAPPING TABLE

| Operation | HTTP Method | API Endpoint | Controller Function | Frontend Service Function | Triggered In UI By |
|---|---|---|---|---|---|
| **List Hotels** | `GET` | `/api/hotels` | `getHotels` | `fetchHotels()` | Home page load & search bar queries |
| **Hotel Details** | `GET` | `/api/hotels/:id` | `getHotelById` | `fetchHotelById()` | Clicking a Hotel card (`/hotel/:id`) |
| **Create Hotel** | `POST` | `/api/hotels` | `createHotel` | `createHotel()` | Admin "Add New Hotel" form submit |
| **Update Hotel** | `PUT` | `/api/hotels/:id` | `updateHotel` | `updateHotel()` | Admin "Edit Hotel" form submit |
| **Delete Hotel** | `DELETE` | `/api/hotels/:id` | `deleteHotel` | `deleteHotel()` | Admin clicking "Delete" button |
| **Create Booking**| `POST` | `/api/bookings` | `createBooking` | `createBooking()` | Guest clicking "Confirm & Complete Booking" |
| **List Bookings** | `GET` | `/api/bookings` | `getBookings` | `fetchBookings()` | Admin Bookings table review |

---

## 6. HOW IMAGE UPLOADS WORK (CLOUDINARY)

### Crucial Distinction for Viva
> **Key Statement to Tell Your Examiner:**  
> *"We do NOT store heavy image binary files inside MongoDB. Image binary files are uploaded directly from the browser to **Cloudinary's Content Delivery Network (CDN)**. Cloudinary stores the file and returns an HTTPS URL (`secure_url`). MongoDB only ever stores that lightweight string URL inside the hotel's `image` field."*

```
[User Selects File] ──> [ImageUploader.tsx] ──> Direct POST (FormData) ──> [Cloudinary CDN]
                                                                                  │
                                                                       Returns `secure_url`
                                                                                  │
[Hotel Form Submit] ──> Saves `secure_url` string in MongoDB ─────────────────────┘
```

### ImageUploader Component (`src/components/ImageUploader.tsx`)

The component supports **native file browsing** and **drag-and-drop**:

```typescript
// src/components/ImageUploader.tsx — Direct Cloudinary Upload Logic
const uploadFileToCloudinary = (file: File) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;     // 'vxwyhut0'
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; // 'luxestay_uploads'

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset); // Unsigned preset

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const xhr = new XMLHttpRequest();

  // Progress Bar calculation
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      setProgress(Math.round((event.loaded / event.total) * 100));
    }
  });

  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      const response = JSON.parse(xhr.responseText);
      onImageUploaded(response.secure_url); // Hands URL back to HotelForm state
    }
  });

  xhr.open('POST', uploadUrl, true);
  xhr.send(formData);
};
```

---

## 7. HOW EMAIL AUTOMATION WORKS (RESEND)

### Email Flow
When a guest completes the checkout form on the frontend:
1. `POST /api/bookings` is sent to the backend.
2. The booking document is saved to MongoDB.
3. `sendBookingConfirmationEmail()` is triggered **asynchronously**.
4. The Resend API sends an HTML email from `onboarding@resend.dev` directly to the guest's email inbox.

```javascript
// server/services/emailService.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmationEmail(booking) {
  const sender = 'LuxeStay <onboarding@resend.dev>';
  const subject = `Booking Confirmed - ${booking.hotelName} (Ref: ${booking.bookingRef})`;
  const html = generateBookingEmailHtml(booking); // Generates styled responsive HTML

  try {
    const response = await resend.emails.send({
      from: sender,
      to: booking.email,
      subject: subject,
      html: html,
    });
    console.log(`✅ [Resend] Confirmation email sent to ${booking.email} (ID: ${response.data?.id})`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ [Resend] Failed to send email to ${booking.email}:`, error.message);
    return { success: false, error: error.message };
  }
}
```

### Why Email Failures Do Not Break Bookings
In `server/controllers/bookingController.js`:
```javascript
// server/controllers/bookingController.js
const newBooking = await BookingModel.create({ ...bookingDetails });

// Non-blocking invocation: catch error without interrupting the response
sendBookingConfirmationEmail(newBooking).catch(err => {
  console.error('Email sending failed in background:', err);
});

// Always return success to the user receipt screen
return res.status(201).json({ status: 'success', data: newBooking });
```

---

## 8. ENVIRONMENT VARIABLES EXPLAINED

Environment variables keep sensitive API tokens and environment-specific endpoints outside of source control:

| Variable Name | Example / Purpose | Why It Cannot Be Hardcoded |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster0...` | Contains database username, password, and cluster host. Hardcoding it in git exposes database credentials publicly. |
| `VITE_API_URL` | `http://localhost:5000` (local) or `""` (Vercel) | Tells the React client where to send REST API requests. Empty in production so requests go to the same origin domain. |
| `VITE_CLOUDINARY_CLOUD_NAME` | `vxwyhut0` | Identifies your Cloudinary cloud bucket destination for direct client-side uploads. |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `luxestay_uploads` | Specifies the unsigned upload rules and transformations on Cloudinary. |
| `RESEND_API_KEY` | `re_H5wxNWLk...` | Secret API key allowing the backend to authenticate and dispatch emails through Resend. |
| `PORT` | `5000` | Port number for local Express HTTP listener. |

---

## 9. DEPLOYMENT (VERCEL & SERVERLESS)

### Local Development vs. Vercel Production

```
LOCAL DEV:
Terminal Command: `npm run server:dev`
Architecture: Persistent Node.js process (`server/server.js`) listening on Port 5000.

VERCEL PRODUCTION:
Architecture: Serverless Functions (`api/index.js`).
There is NO persistent running server. Vercel spins up an isolated Node container on-demand when a request hits `/api/*`.
```

### How `vercel.json` Routes Requests

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
- Any request starting with `/api/` is routed to the serverless function `api/index.js`.
- All other requests are routed to `dist/index.html` (React Single Page Application).

---

## 10. TOP 10 VIVA QUESTIONS & CONFIDENT ANSWERS

### Q1: What is the overall architecture of your application?
**Answer:**  
*"LuxeStay is a 3-tier full-stack application. The presentation layer is a React 18 Single Page Application built with TypeScript and Vite. The business logic layer is a Node.js and Express.js REST API. The persistence layer is MongoDB Atlas accessed via Mongoose ODM. In addition, we integrate Cloudinary for direct image hosting and Resend for transactional email dispatch."*

---

### Q2: Why did you use MongoDB instead of a relational database like MySQL or PostgreSQL?
**Answer:**  
*"Hotel listings naturally contain variable and nested attributes like amenities arrays, dynamic image collections, and varying room category pricing. MongoDB’s document-oriented JSON/BSON data model allows us to store and query these flexible hotel objects with high performance and zero complex SQL multi-table join overhead."*

---

### Q3: Where is your hotel data coming from? Are you calling LiteAPI live?
**Answer:**  
*"No, we do not call LiteAPI live. We ran a one-time offline database migration script (`server/seed.js`) that fetched real hotel records across 34 global cities from LiteAPI, sanitized the HTML descriptions, mapped the data to our Mongoose schema, and seeded 1,700 documents into our MongoDB Atlas database. In runtime, our frontend queries only our own Express REST API and MongoDB."*

---

### Q4: How does image uploading work? Are image files stored in MongoDB?
**Answer:**  
*"No, storing large binary images in MongoDB degrades database performance and hits document size limits. Instead, our custom `ImageUploader` component uploads image files directly from the browser to Cloudinary's CDN using an unsigned upload preset. Cloudinary stores the file and returns a secure HTTPS URL. We then store only that lightweight URL string in MongoDB."*

---

### Q5: How do you ensure the database connection doesn't fail on Vercel serverless functions?
**Answer:**  
*"Serverless functions are stateless and invoked on-demand. In `server/config/db.js`, we cache the Mongoose connection promise globally across warm lambda invocations so we don't reconnect on every request. Furthermore, we implemented a connection gate middleware in `server/app.js` and set `mongoose.set('bufferCommands', false)` so operations fail fast rather than stalling if a connection drops."*

---

### Q6: What happens if the Resend email service fails or is down during a booking?
**Answer:**  
*"The booking creation and email dispatch are decoupled. After the booking is successfully written and confirmed in MongoDB Atlas, `sendBookingConfirmationEmail()` is executed asynchronously in a non-blocking `try/catch` block. If the email API encounters an error, the error is logged on the server, but the guest's reservation remains confirmed and returns HTTP 201 to the user."*

---

### Q7: What is the purpose of Mongoose in your backend?
**Answer:**  
*"Mongoose is an Object Data Modeling (ODM) library for MongoDB. It provides schema validation, type casting (e.g., ensuring prices are numbers and dates are valid), default values, and intuitive CRUD helper methods like `HotelModel.find()`, `create()`, and `findOneAndUpdate()`."*

---

### Q8: What are CORS headers and why do you need them in Express?
**Answer:**  
*"CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts web pages from making requests to a different domain or port than the one that served the page. In `server/app.js`, we use the `cors` middleware to explicitly allow HTTP requests from our Vite development server (`localhost:5173`) and our deployed Vercel production domain (`*.vercel.app`)."*

---

### Q9: What is the difference between `server/server.js` and `api/index.js`?
**Answer:**  
*"`server/server.js` is the entrypoint for local development; it connects to MongoDB and calls `app.listen(PORT)` to keep a persistent HTTP listener active. `api/index.js` is the entrypoint for Vercel; it exports the Express app handler directly as a serverless function without calling `app.listen()`, since Vercel manages the HTTP serverless execution lifecycle."*

---

### Q10: How does your frontend communicate with the backend?
**Answer:**  
*"Our React frontend uses modular service files (`src/services/hotelService.ts` and `src/services/bookingService.ts`). These use the native `fetch()` API to make asynchronous JSON HTTP requests to endpoints like `GET /api/hotels` or `POST /api/bookings`, using the `VITE_API_URL` environment variable as the base URL."*

---

### Q11: Explain your REST API status codes.
**Answer:**  
- `200 OK`: Successful retrieval or update (`GET`, `PUT`, `DELETE`).
- `201 Created`: Document successfully created in MongoDB (`POST /api/hotels`, `POST /api/bookings`, `POST /api/auth/register`).
- `400 Bad Request`: Client validation error (e.g. missing required fields, password too short).
- `401 Unauthorized`: Missing, invalid, or expired JWT token.
- `403 Forbidden`: Authenticated user lacks sufficient permissions (e.g., customer trying to access admin hotel CRUD).
- `404 Not Found`: Requested hotel, booking, or user ID does not exist.
- `409 Conflict`: Attempting to register with an email that already exists.
- `500 / 503 Server Error`: Unhandled database or connection failure.

---

### Q12: How does authentication and Role-Based Access Control (RBAC) work in your app?
**Answer:**  
*"LuxeStay uses stateless JSON Web Token (JWT) authentication. When a user registers or logs in via `/api/auth/login`, their password is verified with `bcrypt.compare()`. The server signs and returns a 7-day JWT containing the user's ID, email, and role ('admin' or 'customer').*

*For protected endpoints (e.g. creating/editing hotels or viewing all bookings), the client attaches this token in the `Authorization: Bearer <token>` HTTP header. Our backend `protect` middleware decodes and verifies the token, attaching `req.user`, and `requireAdmin` enforces that `req.user.role === 'admin'`, returning 403 Forbidden otherwise. On the frontend, React Router routes are guarded by `<ProtectedRoute requireAdmin>`."*

---

### Q13: Why did you use JWTs instead of session cookies?
**Answer:**  
*"Because our backend is deployed as Serverless Functions on Vercel. Serverless architectures are completely stateless — there is no persistent memory or shared session store between function invocations. JWTs are self-contained and digitally signed with `JWT_SECRET`, meaning any serverless instance can verify the user's identity and permissions instantly without needing a shared session database."*

