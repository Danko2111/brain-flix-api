const express = require("express");
const cors = require("cors");
const videosRoutes = require("./routes/vidoesRoutes");
const multer = require("multer");

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
app.use(express.static("public/images"));

app.use("/videos", videosRoutes);

app.listen(PORT, () => {
  console.log("The app is hosted on http://localhost:" + PORT);
});
