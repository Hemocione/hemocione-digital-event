import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { trace } from "@opentelemetry/api";

export default defineNitroPlugin((nitroApp) => {
  console.log("Tracing initializing...");

  const exporterOptions = {
    url: process.env.OTEL_EXPORTER_OTLP_SPAN_ENDPOINT,
  };

  const traceExporter = new OTLPTraceExporter(exporterOptions);
  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations(),
      new HttpInstrumentation(),
      new FetchInstrumentation(),
      new MongoDBInstrumentation(),
    ],
    serviceName: process.env.OTEL_SERVICE_NAME ?? "hemocione-digital-event",
  });

  sdk.start();

  const tracer = trace.getTracer("nitro-tracer");

  nitroApp.hooks.hook("request", (event) => {
    const span = tracer.startSpan(`${event.node.req.method} ${event.path}`);

    span.setAttribute("http.method", event.node.req.method ?? "GET");
    span.setAttribute("http.route", event.path);
    span.setAttribute("http.url", event.path);
    span.setAttribute("http.headers", JSON.stringify(event.node.req.headers));

    event.context.span = span;
  });

  nitroApp.hooks.hook("beforeResponse", (event) => {
    const span = event.context.span;

    if (span) {
      span.setAttribute("http.status_code", event.node.res.statusCode);
      span.end();
    }
  });

  const handleShutdown = () => {
    sdk
      .shutdown()
      .then(() => console.log("Tracing terminated"))
      .catch((error) => console.log("Error terminating tracing", error))
      .finally(() => process.exit(0));
  };

  process.on("SIGTERM", handleShutdown);
  nitroApp.hooks.hook("close", handleShutdown);
  console.log("Tracing initialized.");
});
