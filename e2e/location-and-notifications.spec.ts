import { test, expect } from "@playwright/test";

test.describe("Event Location Features", () => {
  test("should display map on event page", async ({ page }) => {
    // Navigate to a test event
    await page.goto("/event/test-event");
    
    // Wait for the map to be visible
    await expect(page.locator(".interactive-map-container")).toBeVisible();
    
    // Check for map iframe
    const mapIframe = page.locator(".map-wrapper iframe");
    await expect(mapIframe).toBeVisible();
  });

  test("should have 'Ver no Google Maps' button", async ({ page }) => {
    await page.goto("/event/test-event");
    
    const mapsButton = page.locator("button:has-text('Ver no Google Maps')");
    await expect(mapsButton).toBeVisible();
  });

  test("should have 'Compartilhar' button", async ({ page }) => {
    await page.goto("/event/test-event");
    
    const shareButton = page.locator("button:has-text('Compartilhar')");
    await expect(shareButton).toBeVisible();
  });

  test("should have 'Como Chegar' button", async ({ page }) => {
    await page.goto("/event/test-event");
    
    const directionsButton = page.locator("button:has-text('Como Chegar')");
    await expect(directionsButton).toBeVisible();
  });
});

test.describe("Notification Preferences", () => {
  test("should require authentication", async ({ page }) => {
    await page.goto("/notifications/preferences");
    
    // Should redirect to login or show unauthorized message
    await expect(page.locator("text=401")).toBeVisible();
  });
});
