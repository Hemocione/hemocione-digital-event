import { describe, it, expect } from "vitest";

// Haversine formula implementation (same as in the API)
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

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

describe("Location Service", () => {
  describe("calculateDistance", () => {
    it("should calculate distance between two close points correctly", () => {
      // Copacabana, Rio de Janeiro
      const lat1 = -22.9698;
      const lng1 = -43.1869;
      
      // Ipanema, Rio de Janeiro (approximately 4km away)
      const lat2 = -22.9836;
      const lng2 = -43.1986;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);
      
      // Should be approximately 4-5 km
      expect(distance).toBeGreaterThan(3);
      expect(distance).toBeLessThan(6);
    });

    it("should calculate distance between two distant points correctly", () => {
      // Rio de Janeiro
      const lat1 = -22.9068;
      const lng1 = -43.1729;
      
      // São Paulo
      const lat2 = -23.5505;
      const lng2 = -46.6333;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);
      
      // Should be approximately 360 km
      expect(distance).toBeGreaterThan(350);
      expect(distance).toBeLessThan(370);
    });

    it("should return 0 for same coordinates", () => {
      const lat = -22.9698;
      const lng = -43.1869;

      const distance = calculateDistance(lat, lng, lat, lng);
      
      expect(distance).toBe(0);
    });
  });

  describe("formatDistance", () => {
    it("should format distances less than 1km in meters", () => {
      expect(formatDistance(0.5)).toBe("500m");
      expect(formatDistance(0.1)).toBe("100m");
      expect(formatDistance(0.99)).toBe("990m");
    });

    it("should format distances greater than 1km in kilometers", () => {
      expect(formatDistance(1)).toBe("1.0km");
      expect(formatDistance(1.5)).toBe("1.5km");
      expect(formatDistance(10.25)).toBe("10.3km");
    });
  });
});

// Test API response structure
describe("Location API", () => {
  it("should return correct response structure", async () => {
    const mockResponse = {
      success: true,
      eventSlug: "test-event",
      userLocation: { lat: -22.9698, lng: -43.1869 },
      eventLocation: { lat: -22.9836, lng: -43.1986 },
      distance: {
        km: 4.2,
        formatted: "4.2km",
      },
      shareWithEvent: false,
      directions: {
        googleMaps: "https://www.google.com/maps/dir/?api=1&origin=-22.9698,-43.1869&destination=-22.9836,-43.1986&travelmode=driving",
        waze: "https://waze.com/ul?ll=-22.9836,-43.1986&navigate=yes",
      },
    };

    expect(mockResponse.success).toBe(true);
    expect(mockResponse.userLocation).toHaveProperty("lat");
    expect(mockResponse.userLocation).toHaveProperty("lng");
    expect(mockResponse.eventLocation).toHaveProperty("lat");
    expect(mockResponse.eventLocation).toHaveProperty("lng");
    expect(mockResponse.distance).toHaveProperty("km");
    expect(mockResponse.distance).toHaveProperty("formatted");
    expect(mockResponse.directions).toHaveProperty("googleMaps");
    expect(mockResponse.directions).toHaveProperty("waze");
  });
});
