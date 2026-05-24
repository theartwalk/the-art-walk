# Artsy Places NCR — How to Run the App

## First time setup (do this once)

### Step 1 — Install Node.js (if you haven't)
Download from: https://nodejs.org — click the **LTS** button and install it.

### Step 2 — Install Expo Go on your phone
- **iPhone** → App Store → search "Expo Go"
- **Android** → Play Store → search "Expo Go"

### Step 3 — Open Terminal on your Mac
Press **Cmd + Space**, type **Terminal**, press Enter.

### Step 4 — Go to the app folder and install packages
Paste this exactly and press Enter:
```
cd ~/Documents/Claude/Projects/Artsy/artsy-ncr && rm -rf node_modules && npm install
```
This takes 2–3 minutes the first time.

---

## Run the app (every time)

### Step 5 — Start the app
```
cd ~/Documents/Claude/Projects/Artsy/artsy-ncr && npx expo start
```

A QR code appears in Terminal.

### Step 6 — Open on your phone
- **iPhone**: Open the **Camera** app → point at the QR code → tap the notification
- **Android**: Open **Expo Go** → tap "Scan QR code" → scan it

The app opens on your phone! Swipe the cards left and right 🎉

---

## Using the app

**Swipe cards** — drag left/right on the card strip (world2-style)
**Open an event** — tap any card
**Save an event** — tap ♡ on the event page
**See saved events** — tap "Saved" top right
**Gallery map** — tap "Map" top left or "Gallery Map" bottom left

### Secret Admin screen
Long-press **"ARTSY NCR"** (the title in the center) for **1.5 seconds**
→ Enter PIN: **1234**
→ Fill in event details and tap POST EVENT

---

## To connect your real database (Supabase)
1. Go to **supabase.com** → create free account → new project "artsy-ncr"
2. Settings → API → copy your **Project URL** and **anon key**
3. Open `src/lib/supabase.js` in any text editor
4. Replace the placeholder URL and key with yours

Until you do this, the app works perfectly with the built-in sample events.

---

## Create tables in Supabase

**events table:**
| Column | Type |
|--------|------|
| id | uuid (primary key, default: gen_random_uuid()) |
| title | text |
| venue | text |
| address | text |
| date | date |
| dateLabel | text |
| time | text |
| price | text |
| type | text |
| badge | text |
| badgeType | text |
| description | text |
| color | text |
| created_at | timestamptz (default: now()) |

**galleries table:**
| Column | Type |
|--------|------|
| id | uuid (primary key, default: gen_random_uuid()) |
| name | text |
| address | text |
| lat | float8 |
| lng | float8 |
| hours | text |
| website | text |

---

## App files
```
artsy-ncr/
├── App.js                       ← Navigation
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js        ← Swipeable card strip (world2-style)
│   │   ├── EventDetailScreen.js ← Full event page
│   │   ├── MapScreen.js         ← Gallery locations
│   │   ├── SavedScreen.js       ← Your saved events
│   │   ├── AlertsScreen.js      ← Notification history
│   │   └── AdminScreen.js       ← Post events (PIN protected)
│   ├── data/
│   │   └── mockData.js          ← Edit sample events here
│   ├── lib/
│   │   └── supabase.js          ← Database connection
│   └── theme/
│       └── index.js             ← Colors (gold, etc.)
```

---
Built for Artsy Places NCR · thetreemappers@gmail.com
