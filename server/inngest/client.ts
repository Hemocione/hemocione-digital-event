import { EventSchemas, Inngest } from "inngest";
import { Events } from "./eventHandlers";

const runtimeConfig = useRuntimeConfig();

export const inngest = new Inngest({
  name: "Hemocione - Eventos Digitais",
  schemas: new EventSchemas().fromRecord<Events>(),
  eventKey: runtimeConfig.inngestKey,
});
