const data = require("./data/videos.json");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// express get method used to respond with json data of the videos arr
app.get("/videos", (req, res) => {
  res.json(
    data.map(({ id, title, channel, image }) => {
      return { id, title, channel, image };
    })
  );
});
// express get method used to respond with the json data of the specific video that is requested using the url params
app.get("/videos/:id", (req, res) => {
  res.json(
    data.find((vid) => {
      return vid.id === req.params.id;
    })
  );
});

app.listen(5000, () => {
  console.log("The app is hosted on http://localhost:" + 5000);
});
