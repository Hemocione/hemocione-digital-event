# API Changes Documentation

## Overview
This document describes the API changes introduced for issues #32 (24h Notification) and #33 (Location Features).

## Issue #32 - 24h Notification Feature

### New Endpoints

#### GET /api/v1/notifications/preferences
Get the current user's notification preferences.

**Authentication:** Required (User Auth)

**Response:**
```json
{
  "hemocioneId": "string",
  "channels": {
    "push": { "enabled": true, "token": null },
    "whatsapp": { "enabled": true, "phone": null },
    "email": { "enabled": true, "address": null },
    "sms": { "enabled": true, "phone": null }
  },
  "eventReminderHours": [24],
  "createdAt": "2026-03-22T00:00:00.000Z",
  "updatedAt": "2026-03-22T00:00:00.000Z"
}
```

#### PUT /api/v1/notifications/preferences
Update the current user's notification preferences.

**Authentication:** Required (User Auth)

**Request Body:**
```json
{
  "channels": {
    "sms": { "enabled": false },
    "whatsapp": { "enabled": true, "phone": "+5511999999999" },
    "email": { "enabled": true, "address": "user@example.com" },
    "push": { "enabled": true, "token": "device-token-here" }
  },
  "eventReminderHours": [24, 2]
}
```

**Response:** Updated preferences object

#### PUT /api/v1/notifications/:notificationId/status
Mark a notification as sent or failed.

**Authentication:** Required (Service Auth - Secret Key)

**Request Body:**
```json
{
  "status": "sent"
}
```
or
```json
{
  "status": "failed",
  "errorMessage": "Failed to send SMS"
}
```

#### GET /api/v1/notifications/event/:eventId
Get notifications for a specific event.

**Authentication:** Required (Service Auth - Secret Key)

**Query Parameters:**
- `hemocioneId` (optional): Filter by specific user

**Response:**
```json
{
  "eventId": "string",
  "hemocioneId": "string|null",
  "notifications": [...],
  "count": 10
}
```

### New Models

#### NotificationPreference
Stores user preferences for notifications.

```typescript
interface NotificationPreference {
  hemocioneId: string;
  channels: {
    push: { enabled: boolean; token: string | null };
    whatsapp: { enabled: boolean; phone: string | null };
    email: { enabled: boolean; address: string | null };
    sms: { enabled: boolean; phone: string | null };
  };
  eventReminderHours: number[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### EventNotification
Tracks notifications sent to users.

```typescript
interface EventNotification {
  eventId: ObjectId;
  hemocioneId: string;
  type: "24h-reminder" | "2h-reminder" | "1h-reminder" | "custom";
  channel: "push" | "whatsapp" | "email" | "sms";
  status: "pending" | "sent" | "failed" | "bounced";
  sentAt: Date | null;
  failedAt: Date | null;
  errorMessage: string | null;
  messageContent: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### New Cron Job

**Name:** Find Events To Send Reminders

**Schedule:** Every hour at minute 0 (`0 * * * *`)

**Description:** 
- Checks for events starting in 24 hours (with 1-hour window)
- Checks for events starting in 2 hours (with 30-minute window)
- Checks for events starting in 1 hour (with 30-minute window)
- Sends `notify/event-reminder` events to Inngest for each event found

### New Event Handler

**Name:** Send Event Reminder Notifications

**Event:** `notify/event-reminder`

**Description:**
- Processes event reminder notifications
- Fetches all subscriptions for the event
- Sends notifications through available channels (SMS, WhatsApp, Email, Push)
- Respects user preferences
- Tracks notification status
- Sends summary to Discord

## Issue #33 - Location Features

### Updated Event Schema

The `location` field in the Event model now includes optional coordinates:

```typescript
interface EventLocation {
  address: string;
  city: string;
  state: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}
```

### New Endpoint

#### POST /api/v1/event/:eventSlug/location
Submit user location and get distance/directions to event.

**Authentication:** Required (User Auth)

**Request Body:**
```json
{
  "lat": -22.9698,
  "lng": -43.1869,
  "shareWithEvent": false
}
```

**Response:**
```json
{
  "success": true,
  "eventSlug": "string",
  "userLocation": { "lat": -22.9698, "lng": -43.1869 },
  "eventLocation": { "lat": -22.9836, "lng": -43.1986 },
  "distance": {
    "km": 4.2,
    "formatted": "4.2km"
  },
  "shareWithEvent": false,
  "directions": {
    "googleMaps": "https://www.google.com/maps/dir/?api=1&origin=...&destination=...",
    "waze": "https://waze.com/ul?ll=...&navigate=yes"
  }
}
```

**Features:**
- Calculates distance between user and event using Haversine formula
- Returns formatted distance (meters if <1km, kilometers otherwise)
- Provides direct links to Google Maps and Waze for navigation

### Updated Event DTOs

Both `CreateEventDTO` and `UpdateEventDTO` now support the coordinates field:

```typescript
interface CreateEventDTO {
  // ... existing fields
  location?: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}
```

### Frontend Components

#### InteractiveMap.vue
New component that provides:
- Interactive Google Maps embed
- "Ver no Google Maps" button (opens external maps)
- "Compartilhar" button (uses Web Share API or copies link)
- "Como Chegar" button (requests user location and calculates distance)
- Distance display with navigation links

#### NotificationPreferences.vue
New component for managing notification settings:
- Toggle channels (SMS, WhatsApp, Email, Push)
- Select reminder times (24h, 2h, 1h before event)
- Save preferences

### Composables

#### useNotificationPreferences.ts
Composable for managing notification preferences:
- `fetchPreferences()`: Load current preferences
- `updatePreferences(dto)`: Update preferences
- `toggleChannel(channel)`: Toggle specific channel
- `isChannelEnabled(channel)`: Check if channel is enabled

## New Services

### Notification Service (`server/services/notification.ts`)
Provides:
- Preference CRUD operations
- Notification record management
- Multi-channel notification sending (SMS, WhatsApp, Email, Push)
- Notification message building

### Updated Event Service
New methods:
- `getEventsStartingWithinHours(hours, window)`: Get events starting within time window
- `getEventsStartingIn24h()`: Get events starting in ~24 hours
- `getEventsStartingIn2h()`: Get events starting in ~2 hours
- `getEventsStartingIn1h()`: Get events starting in ~1 hour

## Environment Variables

No new environment variables are required. The features use existing configurations:
- `GOOGLE_MAPS_API_KEY`: For maps integration
- `DISCORD_WEBHOOK_URL`: For notification monitoring
- AWS SNS credentials: For SMS notifications

## Testing

### Unit Tests
- `tests/unit/notification.test.ts`: Tests notification message building and status checking
- `tests/unit/location.test.ts`: Tests distance calculation and formatting

### E2E Tests
- `e2e/location-and-notifications.spec.ts`: Tests map display and buttons on event page

## Database Indexes

New indexes created:
- `NotificationPreference.hemocioneId`: Unique index
- `EventNotification.eventId`: Index for queries
- `EventNotification.hemocioneId`: Index for queries
- Compound index on `(eventId, hemocioneId, type, channel)`: Unique constraint to prevent duplicates
