import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  layout("./route-modules/layouts/library-grid.tsx", [
    index("./route-modules/home.tsx"),
  ]),
  layout("./route-modules/layouts/default.tsx", [
    route("profiles/:manufacturer/:model", "./route-modules/profile.tsx"),
    route("statistics", "./route-modules/statistics-overview.tsx"),
    route("statistics/top-measure-devices", "./route-modules/top-measure-devices.tsx"),
    route("statistics/top-contributors", "./route-modules/top-contributors.tsx"),
    route("statistics/top-manufacturers", "./route-modules/top-manufacturers.tsx"),
    route("statistics/top-device-types", "./route-modules/top-device-types.tsx"),
    route("whats-new", "./route-modules/whats-new.tsx"),
    route("statistics/weekly-contributions", "./route-modules/weekly-contributions.tsx"),
    route("analytics", "./route-modules/analytics-overview.tsx"),
    route("analytics/sensor-dimensions", "./route-modules/sensor-dimensions.tsx"),
    route("analytics/sensor-dimensions/:dimension", "./route-modules/sensor-dimensions.tsx", {
      id: "sensor-dimension",
    }),
    route("analytics/installations", "./route-modules/installations.tsx"),
    route("analytics/profiles", "./route-modules/analytics-profiles.tsx"),
    route("analytics/time-series", "./route-modules/time-series.tsx"),
    route("author/:authorName", "./route-modules/author.tsx"),
    route("manufacturers", "./route-modules/manufacturers.tsx"),
    route("manufacturer/:manufacturerName", "./route-modules/manufacturer.tsx"),
    route("*", "./route-modules/not-found.tsx"),
  ]),
] satisfies RouteConfig;
