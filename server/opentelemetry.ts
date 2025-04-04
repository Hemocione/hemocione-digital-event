import process from "process";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";

console.log("Starting OpenTelemetry...");
console.log(
  "OTEL_EXPORTER_OTLP_SPAN_ENDPOINT",
  process.env.OTEL_EXPORTER_OTLP_SPAN_ENDPOINT,
);
console.log("OTEL_SERVICE_NAME", process.env.OTEL_SERVICE_NAME);

const exporterOptions = {
  url: process.env.OTEL_EXPORTER_OTLP_SPAN_ENDPOINT,
};

const traceExporter = new OTLPTraceExporter(exporterOptions);

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations(),
    new UndiciInstrumentation(),
    new MongoDBInstrumentation({
      enhancedDatabaseReporting: true,
    }),
  ],
  serviceName: process.env.OTEL_SERVICE_NAME ?? "hemocione-digital-event",
});

sdk.start();

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing OpenTelemetry...");
  sdk
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error))
    .finally(() => process.exit(0));
});
