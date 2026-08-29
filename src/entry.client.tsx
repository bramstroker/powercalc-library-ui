import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { installErrorReporting } from "./sentry";
import { installStaleDeployRecovery } from "./utils/staleDeploy";

ReactDOM.hydrateRoot(document, <HydratedRouter />);

// Registered before the reporting listeners: a chunk left behind by a deploy is a deployment
// artefact rather than a crash, and recovery claims the event so it is not reported as one.
installStaleDeployRecovery();

// Deliberately after hydration, and it does not load the SDK: see the note in `sentry.ts`.
installErrorReporting();
