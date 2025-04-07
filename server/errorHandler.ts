import { SpanStatusCode } from "@opentelemetry/api";
import type { H3Error, H3Event } from "h3";

export default defineNitroErrorHandler((error: H3Error, event: H3Event) => {
  console.log("ERROR HANDLER!!!!!!");
  const span = event.otel.span;

  const statusCode = error.statusCode || 500; // Se não houver status, assume 500
  if (span && statusCode >= 500) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    span.recordException(error);
  }

  setResponseHeader(event, "Content-Type", "application/json");

  return {
    statusCode,
    statusMessage:
      statusCode >= 500 ? "Internal Server Error" : error.statusMessage,
  };
});
