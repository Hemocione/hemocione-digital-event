import { describe, it, expect, beforeEach } from "vitest";
import {
  buildNotificationMessage,
  hasNotificationBeenSent,
} from "~/server/services/notification";
import { EventNotification } from "~/server/models/eventNotification";
import { Types } from "mongoose";

// Mock the EventNotification model
vi.mock("~/server/models/eventNotification", () => ({
  EventNotification: {
    findOne: vi.fn(),
  },
}));

describe("Notification Service", () => {
  describe("buildNotificationMessage", () => {
    it("should build 24h reminder message correctly", () => {
      const eventName = "Doação de Sangue";
      const eventStartAt = new Date("2026-03-25T10:00:00");
      const eventAddress = "Rua das Flores, 123";

      const message = buildNotificationMessage(
        "24h-reminder",
        eventName,
        eventStartAt,
        eventAddress,
      );

      expect(message).toContain("Doação de Sangue");
      expect(message).toContain("amanhã");
      expect(message).toContain("Rua das Flores, 123");
      expect(message).toContain("documento com foto");
    });

    it("should build 2h reminder message correctly", () => {
      const eventName = "Doação de Sangue";
      const eventStartAt = new Date("2026-03-25T10:00:00");

      const message = buildNotificationMessage(
        "2h-reminder",
        eventName,
        eventStartAt,
      );

      expect(message).toContain("Doação de Sangue");
      expect(message).toContain("2 horas");
    });

    it("should build 1h reminder message correctly", () => {
      const eventName = "Doação de Sangue";
      const eventStartAt = new Date("2026-03-25T10:00:00");

      const message = buildNotificationMessage(
        "1h-reminder",
        eventName,
        eventStartAt,
      );

      expect(message).toContain("Doação de Sangue");
      expect(message).toContain("1 hora");
    });
  });

  describe("hasNotificationBeenSent", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should return true if notification exists", async () => {
      const mockFindOne = vi.mocked(EventNotification.findOne);
      mockFindOne.mockResolvedValue({ _id: new Types.ObjectId() } as any);

      const result = await hasNotificationBeenSent(
        new Types.ObjectId(),
        "user123",
        "24h-reminder",
        "sms",
      );

      expect(result).toBe(true);
    });

    it("should return false if notification does not exist", async () => {
      const mockFindOne = vi.mocked(EventNotification.findOne);
      mockFindOne.mockResolvedValue(null);

      const result = await hasNotificationBeenSent(
        new Types.ObjectId(),
        "user123",
        "24h-reminder",
        "sms",
      );

      expect(result).toBe(false);
    });
  });
});
