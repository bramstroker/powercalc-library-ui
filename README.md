# Powercalc Library Viewer

Contains a small react app to make a searchable UI for the Powercalc profile library.

Uses: https://www.material-react-table.com/

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Docker build / push

- docker build -t library_ui .
- docker image tag downloader bramgerritsen/powercalc-download-proxy:latest
- docker push bramgerritsen/powercalc-download-proxy:latest