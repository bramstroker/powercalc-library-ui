# Initial rendering and remaining load time

Investigation: 6 September 2026. Baseline: `7d23bd3`, after PR #336. Measurements use the
749-profile performance fixture unless explicitly labelled PageSpeed. These changes have not
been deployed as part of this investigation.

## Findings

The largest remaining cost is loading and executing the client application after the server-rendered
text is visible. The high simulated LCP needs careful interpretation: it does not mean that the
already-rendered title waits for the library API. There is also a real rendering defect on profile
pages: their initial attributes were delivered in a hidden streaming segment that needed JavaScript
to become visible.

Two changes address avoidable initial rendering work:

1. Mount the collapsed setup instructions only when opened. Keep them mounted afterwards so closing
   and reopening preserves the user's expanded sections and selections.
2. Render the synchronous Attributes tab outside Suspense. Keep Suspense for the lazy JSON, graphs
   and sub-profile tabs. The generated HTML now contains the attributes in their final location,
   without a fallback, hidden segment or React script to insert them later.

For the Aeotec fixture, the combined changes reduce HTML from **174,656 to 144,106 bytes (17.5%)**,
gzip HTML from **25,242 to 22,014 bytes (12.8%)**, and inline style tags from **148 to 120**.
The count of opening HTML tags falls from 582 to 487. These counts include style, script and link
elements; they are not the post-hydration DOM count. JavaScript payload is effectively unchanged.

## What the supplied reports show

| Mobile audit                 |      Tuya | Aeotec ZW117 |
| ---------------------------- | --------: | -----------: |
| Performance score            |        80 |           76 |
| FCP                          |     3.2 s |        3.7 s |
| LCP                          |     3.4 s |        3.7 s |
| Total blocking time          |    250 ms |       260 ms |
| JavaScript transfer          | 387.4 KiB |    440.3 KiB |
| Script requests              |        71 |           82 |
| Script evaluation            |    702 ms |     1,298 ms |
| Script parsing / compilation |    152 ms |       349 ms |
| Style and layout             |    179 ms |       439 ms |

Sources: [Tuya PageSpeed report](https://pagespeed.web.dev/analysis/https-library-powercalc-nl-manufacturers-tuya/2wstae7pkh?form_factor=mobile)
and [Aeotec PageSpeed report](https://pagespeed.web.dev/analysis/https-library-powercalc-nl-profiles-aeotec-zw117/oi5vq3uow4?form_factor=mobile).
Both use Lighthouse 13.4.1. Their CPU benchmark indices differ (447 and 215), so the difference in
CPU time between these pages cannot be attributed entirely to page complexity.

## LCP: distinguish simulation, painting and interactivity

The LCP elements are text: Tuya's introductory paragraph and the Aeotec heading. Both are already
in the HTML. Their waterfall contains neither an initial full-library request nor an image/font
download needed to draw that text. In the supplied reports, document server response time is about
4 ms. Backend response time and the size of `/library/full` are therefore not the cause of these
particular deep-link loads.

Lighthouse normally observes an unthrottled load and then models a slower device/network. The trace
and the headline metric consequently describe different timelines. This is documented in
[Lighthouse's throttling guide](https://github.com/GoogleChrome/lighthouse/blob/v13.4.1/docs/throttling.md).

On the unchanged local Aeotec build, default Lighthouse simulation reported **3,944 ms LCP**, while
the underlying unthrottled trace painted its LCP at **67 ms**. A separate run using Lighthouse's
DevTools throttling reported **675 ms LCP**, but **9,268 ms time to interactive**. That second run
really delayed requests and CPU execution; it is still an emulation, not a measurement of users.

The production HTML preloads 80 JavaScript modules for Aeotec and 69 for Tuya in the fixture build.
Inspection of Lighthouse's installed Lantern FCP/LCP dependency-graph code shows why these matter:
early-finished module requests can enter the simulated paint dependency graph even though the
server-rendered text does not need their execution. The following isolated experiments support
that explanation:

| Aeotec experiment                            | Simulated FCP | Simulated LCP | Simulated TTI |
| -------------------------------------------- | ------------: | ------------: | ------------: |
| Unchanged baseline                           |      3,944 ms |      3,944 ms |      4,021 ms |
| Final rendering changes                      |      4,109 ms |      4,109 ms |      4,109 ms |
| Lower priority on all modulepreloads         |        824 ms |      4,106 ms |      4,106 ms |
| Remove all modulepreloads                    |      1,612 ms |      2,411 ms |      4,482 ms |
| Increase shared UI merge threshold to 64 KiB |      3,935 ms |      3,938 ms |      3,938 ms |
| Separate React and Router runtime bundles    |      4,183 ms |      4,183 ms |      4,183 ms |

These are individual diagnostic runs, not repeated benchmark estimates. Removing preloads improved
the simulated paint score while worsening simulated interactivity by roughly 460 ms. Increasing
the shared merge threshold also increased downloaded JavaScript. None of these experiments is
included in the implementation. A separately lazy-loaded setup form saved little JavaScript and
exposed a circular shared-MUI chunk initialization error on the desktop grid; the shipped change
uses `mountOnEnter` instead.

The final Lighthouse simulation remains around four seconds: **no simulated LCP improvement has
been demonstrated by these rendering changes**. Their measurable gains are smaller markup, direct
visibility of the attributes without JavaScript, and removal of the locally reproduced profile shift.
The final DevTools-throttled run reports 712 ms LCP and 9,240 ms TTI, compared with 675 ms and
9,268 ms before the changes. These differences do not establish a timing improvement.

**Do not claim that the PageSpeed LCP target is solved merely because the emulated browser paints
quickly.** The committed changes remove actual work and a JavaScript-dependent rendering step;
they do not establish a sub-2.5-second PageSpeed score. A new production report and real-user data
are needed to assess the live outcome. Google's [LCP guidance](https://web.dev/articles/optimize-lcp)
also recommends checking field experience alongside lab results.

## Remaining work, ordered by expected value

### 1. Reduce client rendering and styling work

The Aeotec report assigns about 1.13 seconds of total CPU time to the React entry chunk, including
about 948 ms of script evaluation. Combined evaluation and compilation account for roughly 61%
of its reported main-thread work. This makes client rendering a much stronger target than small
changes to cache headers or the Cloudflare beacon.

A separate local CPU-sampled trace also places React and the shared Emotion/MUI primitives at
the top of JavaScript self time. It supports this attribution but cannot be used as a production
CPU estimate: it was taken on a faster host and with an experimental chunk layout.

Concrete next experiment: replace repeated presentational MUI wrappers in `HeadlineFact`,
`ProfileAttributeGrid` and collection cards with semantic elements and reusable static CSS, while
retaining their current compact appearance. Measure each small conversion against HTML size,
script size, hydration time and a CPU trace. Start with repeated attribute cells/cards, where one
component change affects many instances. Do not migrate the entire UI framework without evidence.

### 2. Reduce module fan-out without increasing eager dependencies

The routes fetch dozens of small modules, in addition to the larger React, Router and MUI chunks.
Bandwidth, module parsing and dependency scheduling continue after the initial text is readable.
In local production tests this leaves a gap of several seconds between first paint and the
hydration marker.

Local HTTP/1.1 delivery exaggerates connection queuing relative to the supplied production
waterfalls, which use HTTP/2. Accordingly, local hydration times are useful regression numbers,
not predictions of the production waterfall. Future chunk changes should be checked with an
HTTP/2 production preview as well as the desktop grid and lazy tabs. Check both transferred bytes
and time until a control actually responds; request count alone is not a sufficient success metric.

### 3. Reduce runtime style/layout work

The Aeotec report contains **338 ms of forced reflow**, of which **308 ms is unattributed** and
about **30 ms maps to MUI Tabs measurements** (`offsetHeight`, `clientHeight`, and bounding boxes).
The report's top-call row repeats the latter time and must not be added again.

Emotion's browser cache moves server-generated style tags into the document head during startup.
The initial page has many such tags; the changes in this branch reduce that number. This is a
plausible contributor to style recalculation, but the unattributed 308 ms cannot be assigned to
Emotion from this evidence alone. Capture a CPU/layout trace around cache initialization and
hydration before changing the Emotion integration.

For profiles with only two tabs, a simpler non-scrolling tab bar is another bounded experiment.
Its maximum demonstrated benefit is around the attributed 30 ms, so it should not be presented
as the solution to all blocking time.

### 4. Reserve the final dimensions of wide manufacturer logos

The local Tuya desktop trace identifies a separate **0.009 CLS**: the introduction moves from
x=201 to x=265 when the logo arrives. `ManufacturerLogo` initially reserves a square while
`useManufacturerLogoAsset` loads the SVG after hydration, then changes to the SVG's wide aspect
ratio. This is a confirmed cause, not a guess based on a Lighthouse suggestion.

Next fix: make the logo's aspect ratio available before its asynchronous SVG loads, or reserve a
stable wrapper with the intended dimensions. Keep the existing artwork and its proportions.
This needs only logo metadata; it does not require a new generated library index.

### 5. Keep the desktop profile shift under observation

The supplied Aeotec desktop report has **0.178 CLS**, with the main content as a shift source.
Local tests before the Attributes change reproduced a smaller **0.046–0.066 CLS**, associated
with the footer disappearing from the viewport when the hidden attributes were inserted.
These are different observed shift sources. Removing the hidden segment fixes the reproduced
rendering problem, but does not prove that every cause of the original 0.178 score is eliminated.

The regression suite now exercises this route on mobile and desktop, twice with fresh contexts,
and saves the actual shifted elements. Recheck the original route after deployment.

## Validation and reproducibility

The final production budget run passed all **32 tests**. The two cold runs per route yielded:

| Route / viewport   |        LCP | Hydration marker + content |   CLS | JS transferred |
| ------------------ | ---------: | -------------------------: | ----: | -------------: |
| Homepage / mobile  | 244–332 ms |             3,552–3,602 ms | 0.000 |      280.0 KiB |
| Tuya / mobile      | 240–248 ms |             3,316–3,326 ms | 0.000 |      274.0 KiB |
| Aeotec / mobile    | 256–260 ms |             3,425–3,494 ms | 0.000 |      310.8 KiB |
| Homepage / desktop |     264 ms |             4,910–4,924 ms | 0.003 |      452.3 KiB |
| Tuya / desktop     | 252–260 ms |                   3,326 ms | 0.009 |      274.0 KiB |
| Aeotec / desktop   | 252–260 ms |             3,391–3,410 ms | 0.000 |      310.8 KiB |

These are local measurements under the conditions below, not production PageSpeed scores.
JavaScript transfer includes response headers and dynamically loaded scripts. The production
PageSpeed reports and fixture builds use different builds/content and delivery, so their byte
counts must not be used as a before/after savings claim.
The [measurement extract](performance-measurements.json) preserves the individual runtime results,
Lighthouse settings, timestamps and observed versus simulated timings.

The full functional suite also passed: **110 end-to-end tests, 339 unit tests and 36 script tests**.
Lint, TypeScript, formatting and all static bundle/payload budgets passed. The setup flow was
additionally checked in the in-app browser without console warnings or errors.

Run the deterministic production build and all performance checks:

```sh
npm ci
npm run performance:build
npm run performance:check
```

The runtime suite now covers `/`, `/manufacturers/tuya` and `/profiles/aeotec/zw117`, using gzip,
4× CPU slowdown, 150 ms request latency and 1.6 Mbps download throughput. It checks LCP, observed
interaction latency, CLS, request count, transferred JavaScript and the existing readiness budget.
The logged readiness time ends at the hydration marker and visible page content; the test then
separately verifies that Explore opens. It is not a field interactivity percentile. A separate
JavaScript-disabled test ensures the profile attributes are already visible in the document.

For additional shift details, use `PERFORMANCE_DEBUG=1 npm run performance:check`. Keep Playwright
tracing disabled during timing runs. Existing tests also cover setup disclosure/reopening, profile
tabs, search, pagination, API failures and a catalogue four times larger.

For independent Lighthouse diagnostics, install Lighthouse 13.4.1 outside the repository and start
`node e2e/performance/server.mjs` in another terminal:

```sh
lighthouse http://127.0.0.1:3200/profiles/aeotec/zw117 \
  --only-categories=performance --chrome-flags='--headless --no-first-run' \
  --output=json --output-path=aeotec-simulated.json --save-assets

lighthouse http://127.0.0.1:3200/profiles/aeotec/zw117 \
  --only-categories=performance --chrome-flags='--headless --no-first-run' \
  --throttling-method=devtools --output=json --output-path=aeotec-throttled.json --save-assets
```

Use `--additional-trace-categories=disabled-by-default-v8.cpu_profiler` for a separate CPU
investigation. Run builds and other tests outside the measurement window, restart the cached
static server after each build, and compare like-for-like settings. No dependency, library API,
cache policy or production deployment was changed by this investigation.
