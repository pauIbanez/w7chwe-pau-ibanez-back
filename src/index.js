require("dotenv").config();
const connectToDB = require("./database");
const app = require("./server");
const startServer = require("./server/startServer");

const connectionString = process.env.CONN_STRING;
const port = process.env.PORT || 4000;

(async () => {
  await connectToDB(connectionString);
  await startServer(port, app);
})();
