class DiscordNotificationService {
  private webhookUrl: string | undefined;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  /**
   * Send a basic message to Discord
   * @param {string} message - The message to send
   * @param {string} [username] - Optional custom username for the webhook
   * @returns {Promise<void>}
   */
  async sendMessage(message: string, username?: string) {
    if (!this.webhookUrl) return;

    try {
      const payload = {
        content: message,
        ...(username && { username }),
      };

      await fetch(this.webhookUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      console.error("Failed to send Discord notification:", error.message);
    }
  }

  /**
   * Send an embed message to Discord
   * @param {Object} embed - The embed object to send
   * @param {string} [username] - Optional custom username for the webhook
   * @returns {Promise<void>}
   */
  async sendEmbed(embed: any, username?: string) {
    if (!this.webhookUrl) return;

    try {
      const payload = {
        embeds: [embed],
        ...(username && { username }),
      };

      await fetch(this.webhookUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      console.error(
        "Failed to send Discord embed notification:",
        error.message,
      );
    }
  }

  /**
   * Send an error notification to Discord
   * @param {Error} error - The error object
   * @param {string} [context] - Additional context about where the error occurred
   * @returns {Promise<void>}
   */
  async sendErrorNotification(error: any, context = "") {
    if (!this.webhookUrl) return;

    const embed = {
      title: "🚨 Error Notification - Hemocione Eventos",
      color: 0xff0000, // Red color
      fields: [
        {
          name: "Error Message",
          value: error.message || "No error message provided",
        },
        {
          name: "Stack Trace",
          value: error.stack || "No stack trace available",
        },
      ],
      timestamp: new Date().toISOString(),
    };

    if (context) {
      embed.fields.unshift({
        name: "Context",
        value: context,
      });
    }

    await this.sendEmbed(embed, "Error Monitor - Hemocione Eventos");
  }

  /**
   * Send a success notification to Discord
   * @param {string} title - The title of the success message
   * @param {string} description - The description of the success
   * @returns {Promise<void>}
   */
  async sendSuccessNotification(title: string, description: string) {
    if (!this.webhookUrl) return;

    const embed = {
      title: `✅ ${title}`,
      description,
      color: 0x00ff00, // Green color
      timestamp: new Date().toISOString(),
    };

    await this.sendEmbed(embed, "Success Monitor - Hemocione Eventos");
  }
}

let discordNotificationService: DiscordNotificationService | null = null;

export const getDiscordNotificationService = () => {
  if (!discordNotificationService) {
    discordNotificationService = new DiscordNotificationService(
      useRuntimeConfig().discordWebhookUrl,
    );
  }
  return discordNotificationService;
};
