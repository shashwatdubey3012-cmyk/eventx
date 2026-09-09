# EventX — Modern Event Discovery, Ticketing & Management Platform

EventX is a complete, full-stack responsive web application for discovering events, reserving tickets, and managing events from initial proposal to day-of-event attendee check-ins.

Built with **Node.js, Express, React (Vite), TypeScript, and Tailwind CSS**, with a persistent database store, JWT authentication, role-based authorization, dynamic QR code digital pass generation, and an Android WebView integration wrapper.

---

## 🌟 Key Features

### 1. Main User Roles
- **Attendee / User:**
  - Register & authenticate with JWT.
  - Browse, search (by keyword, city, category), and filter events (by date, venue, price range, in-person/online format).
  - View comprehensive event details: large banners, speaker lineups, schedule timelines, and venue directions.
  - Reserve tickets with fee breakdowns, attendee contact forms, and instant ticket pass generation.
  - View digital ticket passes containing **unique booking IDs (`EVX-2026-XXXXX`)** and **scannable QR codes**.
  - Track upcoming, past, and cancelled bookings in the personal dashboard; cancel bookings to release reserved seats.
  - Edit personal profile details (Name, avatar URL, phone, city).

- **Event Organizer:**
  - Dedicated Organizer Dashboard with metrics: Total Events, Upcoming Events, Total Registrations, and Gross Revenue.
  - Create and publish events (Title, category, description, banner, start/end times, venue, city, Google Maps location, capacity, ticket price, speakers list, schedule timeline, and terms).
  - Save drafts or publish directly for administrator review ("Pending Approval" status).
  - **Live Attendee Check-In Station:**
    - Scan digital pass QR code payloads or input booking IDs.
    - Validates ticket status:
      - `✓ Check-in Successful`: displays participant name, booking ID, event name, and pass type.
      - `⚠ Ticket Already Used`: displays check-in timestamp and prevents duplicate entry.
      - `✕ Invalid Ticket`: alerts staff of unverified IDs.
  - View attendee rosters and booking transactions with search.

- **Platform Super Admin:**
  - Global system metrics: Total Users, Total Organizers, Total Events, Total Bookings, and Total Revenue.
  - Event moderation queue: approve or reject newly submitted events.
  - User and organizer management: block or unblock accounts, review activity.
  - Audit log of all platform bookings and revenue streams.

---

## 🚀 Instant Demo Credentials

The platform is pre-seeded with realistic demo accounts:

| Role | Email | Password | Pre-loaded Data |
| :--- | :--- | :--- | :--- |
| **Attendee User** | `user@eventx.com` | `User123!` | 2 Bookings with QR Passes (AI Summit, CyberPulse) |
| **Event Organizer** | `organizer@eventx.com` | `Organizer123!` | 3 Hosted Events, 45+ attendees, check-in station ready |
| **Super Admin** | `admin@eventx.com` | `Admin123!` | Moderation queue with pending approvals |

*You can also click the quick-login chips directly in the Sign In modal to switch roles in one click.*

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Space Grotesk display typography.
- **Backend:** Node.js, Express, TypeScript, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), QR Code Generator (`qrcode`).
- **Database Engine:** Custom ACID-compliant persistent JSON storage engine (`backend/config/db.ts`) persisted to `data/eventx-db.json` with seed state and simple drop-in compatibility for MongoDB via Mongoose.
- **Mobile Compatibility:** Responsive mobile-first CSS layout with Android Studio WebView support.

---

## 📡 REST API Documentation

All routes are mounted under `/api`:

### Authentication
- `POST /api/auth/register` — Register a new user or organizer
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/profile` — Update user details (Name, avatar, phone, city)

### Events
- `GET /api/events` — List approved events with filters (`search`, `category`, `city`, `date`, `eventType`, `sortBy`)
- `GET /api/events/featured` — Retrieve top curated featured events
- `GET /api/events/:id` — Retrieve full event details including schedule and speakers
- `POST /api/events` — Create event *(organizer or admin)*
- `PUT /api/events/:id` — Update event *(organizer or admin)*
- `DELETE /api/events/:id` — Delete event *(organizer or admin)*

### Bookings & Check-In
- `POST /api/bookings` — Create a new booking, decrement available seats, generate `EVX-2026-XXXXX` ID and QR pass
- `GET /api/bookings/my` — Get bookings for the authenticated user
- `PUT /api/bookings/:id/cancel` — Cancel a booking and restore available seats
- `GET /api/organizer/events` — Get events created by the logged-in organizer
- `GET /api/organizer/bookings` — Get all bookings for the organizer's events
- `POST /api/organizer/check-in` — Validate QR scan payload or booking ID for attendee entrance

### Notifications
- `GET /api/notifications` — Fetch user alerts and booking confirmations
- `PUT /api/notifications/:id/read` — Mark notification as read
- `PUT /api/notifications/read-all` — Mark all notifications as read

### Admin Portal
- `GET /api/admin/stats` — Platform counters (Users, Organizers, Events, Bookings, Revenue)
- `GET /api/admin/events` — List all events across all statuses
- `PUT /api/admin/events/:id/status` — Approve or reject pending events
- `GET /api/admin/users` — List registered users and organizers
- `PUT /api/admin/users/:id/status` — Suspend or activate accounts
- `GET /api/admin/bookings` — Audit log of all bookings

---

## 📱 Android Studio WebView Integration Guide

EventX is designed to run seamlessly inside an Android WebView.

### 1. `app/src/main/AndroidManifest.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.eventx.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="EventX"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.EventX"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 2. `app/src/main/java/com/eventx/app/MainActivity.java`
```java
package com.eventx.app;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private ProgressBar progressBar;
    private static final String APP_URL = "https://your-eventx-domain.com";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true); // Crucial for localStorage JWT tokens
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
            }
            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
            }
        });

        webView.loadUrl(APP_URL);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN && keyCode == KeyEvent.KEYCODE_BACK) {
            if (webView.canGoBack()) {
                webView.goBack();
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }
}
```

---

## 🍃 MongoDB Integration Note

EventX uses an abstracted database provider interface in `backend/config/db.ts`. To connect to a cloud MongoDB cluster (e.g. MongoDB Atlas):
1. Provide `MONGODB_URI` in `.env`.
2. Replace or wrap the JSON collection functions in `db.ts` with standard Mongoose models (`User`, `Event`, `Booking`, `Notification`). The REST controller interfaces remain completely identical.
