const dotenv = require("dotenv");
const path = require("path");

const envPath = path.resolve(__dirname, ".env");
const envConfig = dotenv.config({ path: envPath });

module.exports = {
  apps: [
    {
      name: "barcode-plus-front",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      env: envConfig.parsed || {},
    },
  ],
};
