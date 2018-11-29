let privateConfig = {
  mapboxAccessToken: "MAPBOX_ACCESS_TOKEN", // This gets replaced with the actual token by a sed command.
  rollbarAccessToken: "ROLLBAR_ACCESS_TOKEN",
  environment: process.env.NODE_ENV,
};

module.exports = privateConfig;
