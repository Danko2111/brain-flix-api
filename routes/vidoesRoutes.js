const fs = require("fs");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

// creating a reusable redfile func that takes in a callback func to deal with the return of data
const readFileFunc = (readFileCallback) => {
  fs.readFile("./data/videos.json", "utf8", readFileCallback);
};

const writeFileFunc = (fileToWrite) => {
  fs.writeFile("./data/videos.json", JSON.stringify(fileToWrite), (err) => {
    if (err) console.log(err);
  });
};

router
  .route("/")
  //express get method used to respond with json data of the videos arr
  .get((_req, res) => {
    readFileFunc((err, data) => {
      //catching errors and sending back a json error message
      if (err) {
        res.status(500).json({
          message:
            "Something went wrong while trying to read the file, please try again later",
          error: err,
        });
      } else {
        // responding with parsed json data
        res.status(201).json(
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
    readFileFunc((err, data) => {
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
        writeFileFunc(newVideosArr);
        res.status(200).json({
          message: "Your video successfully was posted",
          video: newVideo,
        });
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
  // reading the json file
  readFileFunc((err, data) => {
    if (err) {
      res.json({
        message:
          "Something went wrong while trying to read the file, please try again later",
        error: err,
      });
    } else {
      // responding with the specific video details that match the req param id
      res.status(201).json(
        JSON.parse(data).find((vid) => {
          return vid.id === req.params.id;
        })
      );
    }
  });
});

router.post("/:id/comments", (req, res) => {
  readFileFunc((err, data) => {
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
      //getting specific video that matches the req params id
      const videoDetails = newVideosArr.find((vid) => {
        return vid.id === req.params.id;
      });
      // pushing the new comment obj into that video comments array
      videoDetails.comments.push(newComment);
      writeFileFunc(newVideosArr);
      res.status(200).json({ message: "Your comment posted sucessfully" });
    } else {
      res.status(500).json({
        message:
          "Your post body must contain ONLY the 'name: value' and the 'comment: value' key-value pairs ",
        error: err,
      });
    }
  });
});
router.delete("/:videoId/comments/:commentsId", (req, res) => {
  readFileFunc((err, data) => {
    const videoId = req.params.videoId;
    const commentId = req.params.commentsId;
    if (err) {
      res.status(500).json({
        message:
          "Something went wrong while trying to read the file, please try again later",
        error: err,
      });
    }
    newVideosArr = JSON.parse(data);
    if (!newVideosArr.find((video) => video.id === videoId)) {
      res.send("This video ID doesnt exist");
    } else {
      const selectedVideo = newVideosArr.find((video) => video.id === videoId);
      if (!selectedVideo.comments.find((comment) => comment.id === commentId)) {
        res.send("This comment ID doesnt exist");
      } else {
        const selectedCommentIndex = selectedVideo.comments.findIndex(
          (comment) => comment.id === commentId
        );
        selectedVideo.comments.splice(selectedCommentIndex, 1);
        writeFileFunc(newVideosArr);
        res
          .status(200)
          .json({ message: "Your comment was sucessfully deleted" });
      }
    }
  });
});
module.exports = router;
