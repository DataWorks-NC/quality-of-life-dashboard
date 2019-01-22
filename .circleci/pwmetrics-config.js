module.exports = {
  flags: { // AKA feature flags
    runs: 3, // number or runs
    submit: true, // turn on submitting to Google Sheets
    failOnError: true,
  },
  sheets: {
    type: 'GOOGLE_SHEETS', // sheets service type. Available types: GOOGLE_SHEETS
    options: {
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      tableName: 'data'
    },
  },
  clientSecret: {
    "installed": {
      "client_id": process.env.GOOGLE_CLIENT_ID,
      "project_id": process.env.GOOGLE_PROJECT_ID,
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_secret": process.env.GOOGLE_CLIENT_SECRET,
      "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
    }
  },
};
