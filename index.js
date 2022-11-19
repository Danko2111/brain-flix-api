const express = require("express");
const cors = require("cors");
const videosRoutes = require("./routes/vidoesRoutes");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public/images"));

app.use("/videos", videosRoutes);

let PORT = process.env.DEV_PORT;
app.listen(PORT, () => {
  console.log("The app is listening on http://localhost:" + PORT);
});
