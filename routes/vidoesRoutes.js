const fs = require("fs");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const multer = require("multer");

// creating a reusable readfile and writefile func
const readFileFunc = (readFileCallback) => {
  fs.readFile("./data/videos.json", "utf8", readFileCallback);
};

const writeFileFunc = (fileToWrite) => {
  fs.writeFile("./data/videos.json", JSON.stringify(fileToWrite), (err) => {
    if (err) console.log(err);
  });
};

// Multer functional code to store incoming image files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
// -------------------------------------------------

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
  .post(upload.single("image"), (req, res) => {
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
        let imagePath = `http://localhost:5000/upload-video-preview.jpg`;
        if (req.file) {
          imagePath = `http://localhost:5000/${req.file.filename}`;
        }

        const newVideo = {
          id: uuidv4(),
          title: req.body.title,
          channel: "placeholder",
          image: imagePath,
          description: req.body.description,
          views: 0,
          likes: 0,
          duration: "3:47",
          video: "https://project-2-api.herokuapp.com/stream?api_key=Test",
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
      // parsing our json data
      const videosData = JSON.parse(data);
      // finding a video that matches to the incomming post req.params
      const vidData = videosData.find((vid) => {
        return vid.id === req.params.id;
      });
      // overiding the data
      writeFileFunc(videosData);
      // responding with the specific video details that match the req param id
      res.status(201).json(vidData);
    }
  });
});
// express post method used to write a new comment into the specific video's comments array
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
// delete express method used to delete a specific comment by ID from a specific video by ID
router.delete("/:videoId/comments/:commentsId", (req, res) => {
  // read the videos.json
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
    // parse the data into a js obj
    newVideosArr = JSON.parse(data);
    // check for the incomming req vidId being present in the videos onj
    if (!newVideosArr.find((video) => video.id === videoId)) {
      res.send("This video ID doesnt exist");
    } else {
      // if its present then set a var = to the specific video
      const selectedVideo = newVideosArr.find((video) => video.id === videoId);
      //   check incomming req commentId being present in the video comment array
      if (!selectedVideo.comments.find((comment) => comment.id === commentId)) {
        res.send("This comment ID doesnt exist");
      } else {
        // if its present then set a var = to the index of that comment
        const selectedCommentIndex = selectedVideo.comments.findIndex(
          (comment) => comment.id === commentId
        );
        // deleting the comment by index from the comments array
        selectedVideo.comments.splice(selectedCommentIndex, 1);
        writeFileFunc(newVideosArr);
        res
          .status(200)
          .json({ message: "Your comment was sucessfully deleted" });
      }
    }
  });
});
// creating a express put endpoint to increment the video likes
router.put("/:videoId/likes", (req, res) => {
  // reading the videos.json file
  readFileFunc((err, data) => {
    if (err) {
      res.json({
        message:
          "Something went wrong while trying to read the file, please try again later",
        error: err,
      });
    }
    // parsing the json file
    const newVideosArr = JSON.parse(data);
    // finding video by req params
    const selectedVideo = newVideosArr.find(
      (video) => video.id === req.params.videoId
    );
    // incrementing the video likes
    selectedVideo.likes += 1;
    writeFileFunc(newVideosArr);
    res.status(200).json({ message: "sucessfully liked the video" });
  });
});
// creating a express put endpoint to increment a specific comments likes
router.put("/:videoId/comments/:commentId/likes", (req, res) => {
  // reading the videos.json file
  readFileFunc((err, data) => {
    if (err) {
      res.json({
        message:
          "Something went wrong while trying to read the file, please try again later",
        error: err,
      });
    }
    // parsing the json file
    const newVideosArr = JSON.parse(data);
    // finding video by req params
    const selectedVideo = newVideosArr.find(
      (video) => video.id === req.params.videoId
    );
    // finding a video comment by req params
    const selectedVideoComment = selectedVideo.comments.find((comment) => {
      return comment.id === req.params.commentId;
    });
    // incrementing the comment likes
    selectedVideoComment.likes += 1;
    writeFileFunc(newVideosArr);
    res.status(200).json({ message: "sucessfully liked the comment" });
  });
});

module.exports = router;
