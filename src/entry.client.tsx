import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { installErrorReporting } from "./sentry";

ReactDOM.hydrateRoot(document, <HydratedRouter />);

// Deliberately after hydration, and it does not load the SDK: see the note in `sentry.ts`.
installErrorReporting();
