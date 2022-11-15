const data = require("./data/videos.json");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());

// express get method used to respond with json data of the videos arr
app
  .route(`/videos`)
  .get((req, res) => {
    res.json(
      data.map(({ id, title, channel, image }) => {
        return { id, title, channel, image };
      })
    );
  })
  .post((req, res) => {
    fs.writeFile();
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
