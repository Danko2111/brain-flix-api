const fs = require("fs");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

router
  .route("/")
  //express get method used to respond with json data of the videos arr
  .get((req, res) => {
    fs.readFile("./data/videos.json", (err, data) => {
      //catching errors and sending back a json error message
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
  //express post method used to update the json with the new incomming video obj
  .post((req, res) => {
    // reading the json
    fs.readFile("./data/videos.json", (err, data) => {
      //throwing an error if there is an issue reading the file
      if (err) {
        res.status(500).json({
          message:
            "Something went wrong while trying to read the file, please try again later",
          error: err,
        });
      }
      //   parsing the read json file and setting it into an array
      const newVideosArr = JSON.parse(data);
      // if else statement to catch any errors with the incomming request body
      if (req.body.title && req.body.description) {
        // creating a new videos obj with incomming req data
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
        // pushing the new video obj into our array
        newVideosArr.push(newVideo);
        // writing the new array into json data and overriding the old json data
        fs.writeFile(
          "./data/videos.json",
          JSON.stringify(newVideosArr),
          (err) => {
            if (err) console.log(err);
          }
        );
        res.status(200).json(newVideo);
        // catching errors with the incoming request body
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

router.post("/:id/comments", (req, res) => {
  fs.readFile("./data/videos.json", (err, data) => {
    // throwing an error if there is an issue reading the file
    if (err) {
      res.status(500).json({
        message:
          "Something went wrong while trying to read the file, please try again later",
        error: err,
      });
    }
    //   parsing the read json file and setting it into an array
    const newVideosArr = JSON.parse(data);
    if (req.body.name && req.body.comment) {
      // creating a new comment obj with incomming req data
      const newComment = {
        id: uuidv4(),
        name: req.body.name,
        comment: req.body.comment,
        likes: 0,
        timestamp: Date.now(),
      };
      const videoDetails = newVideosArr.find((vid) => {
        return vid.id === req.params.id;
      });
      videoDetails.comments.push(newComment);
      fs.writeFile(
        "./data/videos.json",
        JSON.stringify(newVideosArr),
        (err) => {
          if (err) console.log(err);
        }
      );
      res.json({ message: "Your comment posted successfully" });
    } else {
      res.status(500).json({
        message:
          "Your post body must contain ONLY the 'name: value' and the 'comment: value' key-value pairs ",
        error: err,
      });
    }
  });
});

module.exports = router;
