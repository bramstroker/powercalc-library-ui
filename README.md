# Powercalc Library Viewer

Repository for the Powercalc library website.
https://library.powercalc.nl/

The website is built with React and Material-UI.
It uses the powercalc API (https://api.powercalc.nl) to fetch the library data.

Uses: 
 - https://www.material-react-table.com/
 - https://mui.com/x/react-charts/

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

Before prerendering, contributor avatars are downloaded from GitHub, resized to 192×192, encoded as
WebP, and written to `public/avatars`. A generated manifest lets prerendered pages serve those images
from `/avatars/` on the library domain.
Set `LIBRARY_API_URL`, `AVATARS_OUTPUT_DIR`, or `AVATAR_SIZE` to override the downloader defaults.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Docker build / push

- docker build --platform=linux/amd64 -tpowercalc-library-ui .
- docker image tag powercalc-library-ui bramgerritsen/powercalc-library-ui:latest
- docker push bramgerritsen/powercalc-library-ui:latest
