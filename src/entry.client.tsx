import * as Sentry from "@sentry/react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

Sentry.init({
  dsn: "https://0d99b37d629842e88ae62be9ecddd530@o4510889348890624.ingest.de.sentry.io/4510889353936976",
  // Leave visitor PII (IP addresses among others) out of reports for this public EU-facing site.
  sendDefaultPii: false,
});

ReactDOM.hydrateRoot(document, <HydratedRouter />);
