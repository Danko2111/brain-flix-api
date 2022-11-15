const fs = require("fs");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

router
  .route("/")
  // express get method used to respond with json data of the videos arr
  .get((req, res) => {
    fs.readFile("./data/videos.json", (err, data) => {
      // catching errors and sending back a json error message
      if (err) {
        res.status(500).json({
          message: "Something went wrong, please try again later",
          error: err,
        });
      } else {
        // responding with parsed json data
        res.json(
          JSON.parse(data).map(({ id, title, channel, image }) => {
            return { id, title, channel, image };
          })
        );
      }
    });
  })
  .post((req, res) => {
    fs.readFile("./data/videos.json", (err, data) => {
      if (err) {
        res.status(500).json({
          message:
            "Something went wrong while trying to read the file, please try again later",
          error: err,
        });
      }
      const newVideosArr = JSON.parse(data);
      console.log(newVideosArr);
      if (req.body.title && req.body.description) {
        const newVideo = {
          id: uuidv4(),
          title: req.body.title,
          channel: "placeholder",
          image: "https://i.imgur.com/l2Xfgpl.jpg",
          description: req.body.description,
          views: "0",
          likes: "0",
          duration: "3:47",
          video: "https://project-2-api.herokuapp.com/stream",
          timestamp: Date.now(),
          comments: [],
        };
        newVideosArr.push(newVideo);
        fs.writeFile(
          "./data/videos.json",
          JSON.stringify(newVideosArr),
          (err) => {
            if (err) console.log(err);
          }
        );
      } else {
        res.status(500).json({
          message:
            "Your post body must contain ONLY the 'title: value' and the 'description: value' key-value pairs ",
          error: err,
        });
      }
    });
  });

// express get method used to respond with the json data of the specific video that is requested using the url params
router.get("/:id", (req, res) => {
  fs.readFile("./data/videos.json", (err, data) => {
    if (err) {
      res.json({
        message: "Something went wrong, please try again",
        error: err,
      });
    } else {
      res.json(
        JSON.parse(data).find((vid) => {
          return vid.id === req.params.id;
        })
      );
    }
  });
});

module.exports = router;
