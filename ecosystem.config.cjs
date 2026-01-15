const dotenv = require("dotenv");
const path = require("path");

const NODE_ENV = process.env.NODE_ENV || "development";
const envFile = NODE_ENV === "production" ? ".env.production" : ".env.development";
const envPath = path.resolve(__dirname, envFile);
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
