import { EventSchemas, Inngest } from "inngest";
import { Events } from "./eventHandlers";

export const inngest = new Inngest({
  name: "Hemocione - Eventos Digitais",
  schemas: new EventSchemas().fromRecord<Events>(),
});
