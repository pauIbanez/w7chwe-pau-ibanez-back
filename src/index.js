require("dotenv").config();
const connectToDB = require("./database");

const connectionString = process.env.CONN_STRING;

(async () => {
  await connectToDB(connectionString);
})();
