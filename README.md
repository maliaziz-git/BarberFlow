# ✂️ BarberFlow

**BarberFlow** is an all-in-one, modern Barber Shop Management System built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL (Neon)**, **REST APIs**, and a **React Native** companion app for barbers.

---

## 🌟 Highlights & Key Features

### 🖥️ Responsive Web Dashboard
- **Role-Based Portals**:
  - **Admin**: Full access to all operations, shop settings, barber roster, and business reporting.
  - **Barber**: Focused portal for assigned chairs, appointments, and client records.
- **Appointment Management**:
  - Interactive queue with instant status updates (`BOOKED`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`).
  - Filtering by Date, Barber, and Status.
  - Create and reschedule modals with real-time slot conflict checking.
- **Public Customer Booking Page (`/book`)**:
  - Frictionless 4-step client reservation flow (Service ➔ Barber ➔ Date & Slot ➔ Contact Details).
  - Instant confirmation receipt with reference code and price.
- **Customer Directory & History**:
  - Full client CRUD, styling notes, allergy warnings, and chronological visit history.
- **Services Catalog**:
  - Custom durations, active/inactive visibility, and pricing.
- **Barber Roster**:
  - Profiles with bios, specialties, phone, avatar, and lifetime cut volume.
- **Shop Business Hours & Rules**:
  - Opening/closing time configuration, slot intervals, and active open days of the week.
- **Analytics & Reporting**:
  - Realized revenue, appointment volume, completion rates, and most popular haircuts ranking.

### 📐 Appointment Business Rules
- **Double-Booking Prevention**: Dynamically checks existing active appointments (`BOOKED`, `CONFIRMED`, `IN_PROGRESS`) for the chosen barber.
- **Automatic Duration Math**: Calculates exact appointment end times based on the service's duration in minutes.
- **Operating Hours Enforcement**: Rejects any bookings that start before opening time, end after closing time, or fall on shop rest days.
- **Availability Engine**: Generates live, verified conflict-free slots on `/api/appointments/availability`.

### 📱 React Native Mobile Companion (`mobile/`)
- Native mobile app designed for barbers at the chair.
- **Screens**:
  1. **Login**: Secure authentication with configurable backend API URL and 1-click demo filler.
  2. **Today's Appointments**: Real-time queue for today with color-coded status badges and customer details.
  3. **Appointment Details**: Tap-to-call phone dialer, service info, price, notes editor, and 1-tap status transitions (`IN_PROGRESS`, `COMPLETED`, etc.).
  4. **Customer Profile**: View past visits and client preferences.
  5. **Profile & Account**: Active chair status and session management.

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Web Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & Lucide React |
| **Database** | [PostgreSQL (Neon Serverless)](https://neon.tech/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Authentication** | Secure bcrypt password hashing & JWT tokens (Cookies + Bearer headers) |
| **Mobile App** | [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) & React Navigation |
| **Testing** | [Vitest](https://vitest.dev/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🔐 Demo Credentials

The database seed provides two pre-configured accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Shop Admin** | `admin@barberflow.com` | `admin123` | Full administrative control |
| **Barber** | `barber@barberflow.com` | `barber123` | Chair appointments & client notes |

*Quick tip: The web login page features 1-click demo buttons to automatically populate and test either role instantly.*

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/BarberFlow.git
cd BarberFlow

# Install web dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your Neon PostgreSQL connection string and secrets:

```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secure-random-secret-key-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Migration & Seed

Run Prisma commands to create the tables, indexes, and seed sample data:

```bash
# Push schema to Neon PostgreSQL
npm run prisma:push

# Seed demo barbers, services, customers, shop settings, and realistic appointments
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser:
- **Public Booking**: [http://localhost:3000/book](http://localhost:3000/book)
- **Staff Login**: [http://localhost:3000/login](http://localhost:3000/login)
- **Admin Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 📱 Running the Mobile Companion App

The React Native application is located in the `mobile/` directory:

```bash
cd mobile

# Install mobile dependencies
npm install

# Start Expo development server
npm start
```

Press `w` to open in browser, or scan the QR code with Expo Go on your iOS/Android device. In the login screen, point the API URL to your computer's local IP (e.g. `http://192.168.1.50:3000`) or your deployed Vercel domain.

---

## 🧪 Automated Testing

Unit and integration tests for appointment availability, operating hours, interval overlaps, and double-booking prevention:

```bash
npm test
```

Tests run via Vitest:
- ✅ Service duration math & end-time calculation
- ✅ Overlapping interval detection (start/end boundaries & back-to-back allowance)
- ✅ Conflicting active bookings (`BOOKED`, `CONFIRMED`, `IN_PROGRESS`)
- ✅ Permitting bookings over `CANCELLED` slots
- ✅ Operating hours enforcement (rejection outside opening/closing times)
- ✅ Closed day of the week validation
- ✅ Dynamic availability slot generator

---

## 📡 REST API Reference

All endpoints return JSON and handle validation and appropriate HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`).

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate & retrieve JWT cookie/token | Public |
| `GET` | `/api/auth/me` | Fetch active user session | Auth |
| `POST` | `/api/auth/logout` | Clear session cookie | Auth |
| `GET` | `/api/dashboard/stats` | Overview KPIs, revenue & live queue | Auth |
| `GET` | `/api/appointments` | List appointments with query filters | Public / Auth |
| `POST` | `/api/appointments` | Book appointment (conflict protected) | Public / Auth |
| `GET` | `/api/appointments/:id` | Get appointment details | Auth |
| `PUT` | `/api/appointments/:id` | Reschedule / update appointment | Auth |
| `PATCH` | `/api/appointments/:id` | Fast status transition & notes update | Auth |
| `DELETE`| `/api/appointments/:id` | Cancel or delete appointment | Auth |
| `GET` | `/api/appointments/availability` | Query open slots by date & service | Public |
| `GET` | `/api/customers` | Search & paginate customers | Auth |
| `POST` | `/api/customers` | Create new customer profile | Auth |
| `GET` | `/api/customers/:id` | Customer details & visit history | Auth |
| `PUT` | `/api/customers/:id` | Update customer details | Auth |
| `DELETE`| `/api/customers/:id` | Remove customer | Admin |
| `GET` | `/api/services` | List active grooming services | Public |
| `POST` | `/api/services` | Create new service & duration | Admin |
| `PUT` | `/api/services/:id` | Update service price & status | Admin |
| `GET` | `/api/barbers` | List barbers and specialties | Public |
| `POST` | `/api/barbers` | Add barber to roster | Admin |
| `PUT` | `/api/barbers/:id` | Update barber details & availability | Admin / Barber |
| `GET` | `/api/reports` | Revenue, completion rate & popular cuts | Auth |
| `GET` | `/api/settings` | Get shop operating hours & info | Public |
| `PUT` | `/api/settings` | Update shop schedule & interval rules | Admin |

---

## ☁️ Deployment Guide (Vercel & Neon PostgreSQL)

### 1. Neon Database Setup
1. Create a free PostgreSQL database at [neon.tech](https://neon.tech).
2. Copy your connection string (e.g. `postgresql://neondb_owner:...@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`).

### 2. Vercel Deployment
1. Push this repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your `BarberFlow` repository.
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `JWT_SECRET`: A secure 32+ character random secret string.
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production URL (e.g. `https://barberflow.vercel.app`).
5. Click **Deploy**. Vercel will automatically run `prisma generate && next build` and deploy your serverless application globally.
6. Run seeds against your Neon database from your local machine:
   ```bash
   DATABASE_URL="your-neon-url" npm run prisma:seed
   ```

---

## 📄 License
MIT License. Built for modern barbershops and grooming studios.
