import { getUserAuth } from "~/server/services/auth";
import { getEventBySlug } from "~/server/services/event";

interface LocationBody {
  lat: number;
  lng: number;
  shareWithEvent?: boolean;
}

function assertLocationBody(body: any): asserts body is LocationBody {
  if (typeof body !== "object" || body === null) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid body",
    });
  }

  if (typeof body.lat !== "number" || typeof body.lng !== "number") {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid coordinates. lat and lng must be numbers",
    });
  }

  if (
    "shareWithEvent" in body &&
    typeof body.shareWithEvent !== "boolean"
  ) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid shareWithEvent",
    });
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Format distance for display
function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

export default defineEventHandler(async (event) => {
  const user = getUserAuth(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const eventSlug = getRouterParam(event, "eventSlug");
  if (!eventSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event slug is required",
    });
  }

  const body = await readBody(event);
  assertLocationBody(body);

  const hemoEvent = await getEventBySlug(eventSlug);
  if (!hemoEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: "Event not found",
    });
  }

  // Check if event has coordinates
  if (!hemoEvent.location?.coordinates?.lat || !hemoEvent.location?.coordinates?.lng) {
    return {
      success: true,
      eventSlug,
      userLocation: { lat: body.lat, lng: body.lng },
      eventLocation: null,
      distance: null,
      shareWithEvent: body.shareWithEvent || false,
      message: "Event does not have coordinates set",
    };
  }

  const distance = calculateDistance(
    body.lat,
    body.lng,
    hemoEvent.location.coordinates.lat,
    hemoEvent.location.coordinates.lng,
  );

  // Build Google Maps directions URL
  const origin = `${body.lat},${body.lng}`;
  const destination = `${hemoEvent.location.coordinates.lat},${hemoEvent.location.coordinates.lng}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

  // Build Waze URL
  const wazeUrl = `https://waze.com/ul?ll=${hemoEvent.location.coordinates.lat},${hemoEvent.location.coordinates.lng}&navigate=yes`;

  return {
    success: true,
    eventSlug,
    userLocation: { lat: body.lat, lng: body.lng },
    eventLocation: hemoEvent.location.coordinates,
    distance: {
      km: Math.round(distance * 100) / 100,
      formatted: formatDistance(distance),
    },
    shareWithEvent: body.shareWithEvent || false,
    directions: {
      googleMaps: googleMapsUrl,
      waze: wazeUrl,
    },
  };
});
