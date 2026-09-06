# Performance dataset

`library.json` is a snapshot of the public Powercalc library API taken on 2026-09-06:
749 profiles from 133 manufacturers. Contributor email fields have been removed.
It retains real aliases, measurement descriptions and metadata so payload and search tests
cannot accidentally pass using a handful of simplified profiles.

The performance build generates the compact browse index from this full dataset. The growth
scenario duplicates each model four times with unique IDs (2,996 profiles) to test CPU/render
cost. That scenario intercepts the index response and does not measure network payload growth.

Update the fixture deliberately when library size changes, then review measured budgets.
The ordinary functional E2E suite continues to use its small, independently maintained fixture.
