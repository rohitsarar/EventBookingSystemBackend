---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local or Atlas cloud)
- npm or yarn

---

## 🖥️ Backend Setup



### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env` file in the `backend/` root:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventbooking
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
```

> ⚠️ Replace `JWT_SECRET` with a strong random string before deploying to production.

### 4. Start the development server

```bash
npm run dev
```

The backend will start at **http://localhost:5000**

### 5. Verify it is running










---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local or Atlas cloud)
- npm or yarn

---

## 🖥️ Backend Setup

### 1. Navigate to the backend folder

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env` file in the `backend/` root:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventbooking
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
```

> ⚠️ Replace `JWT_SECRET` with a strong random string before deploying to production.

### 4. Start the development server

```bash
npm run dev
```

The backend will start at **http://localhost:5000**

### 5. Verify it is running







Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "environment": "development"
}
```

---

### 📌 API Endpoints

#### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login, returns JWT token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

#### Events
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/events` | List all events | No |
| GET | `/api/events/:id` | Get event + seat grid | No |
| POST | `/api/events` | Create event (auto-seeds seats) | No |
| POST | `/api/events/:id/seed-seats` | Seed seats for existing event | No |

#### Reservation
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/reserve` | Reserve seats for 10 minutes | Yes |

#### Booking
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings` | Confirm booking from reservation | Yes |

---

### 📦 Backend Scripts

```bash
npm run dev       # Start with nodemon (hot reload)
npm run build     # Compile TypeScript to JavaScript
npm start         # Run compiled production build
```

---

### 🌱 Seed Seats for Existing Events

If you created events before the seat-seeding logic was added, run this once:

```bash
npx ts-node src/scripts/seedExistingEvents.ts
```

Or call the API directly:
