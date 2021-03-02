var express = require("express");
//Merge params for :id
var router = express.Router({ mergeParams: true });
var Blog = require("../models/blog");
var Comment = require("../models/comment");



//Comments route
router.get("/new",isLoggedIn, function (req, res) {
    //find blog by id
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            res.redirect("/blog");
        } else {
            res.render("comments/new", { blog: foundBlog });
            //console.log(foundBlog)
        }
    });

})


router.post("/", isLoggedIn, function (req, res) {
    var mComment = req.body.comment;

    //lookup blog by id
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            res.redirect("/blog");
        } else {
            Comment.create(mComment, function (err, comment) {
                if (err) {
                    console.log(err)
                } else {
                    //add user name and id
                   // console.log("User ID " + req.user._id)
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //save comment

                    foundBlog.comments.push(comment);
                    foundBlog.save();
                    res.redirect("/blog/" + foundBlog._id);
                }
            });

        }
    });

})

//Edit comment route
router.get("/:comment_id/edit",isLoggedIn, checkCommentOwnership, function (req, res) {

    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            console.log(err)

        } else {
            res.render("comments/edit", { blog_id: req.params.id, comment: foundComment });
            //res.send("Edit your comment")
        }


    });


});

//Comment update put request
router.put("/:comment_id",isLoggedIn, function (req, res) {
    Comment.findOneAndUpdate(req.params.comment_id, req.body.comment, function (err, editComment) {
        if (err) {
            res.redirect("back");
        } else {
            //Save what was edited
            editComment.save();
           // console.log("Edit comment? " + req.body.comment.text + " comment id " + req.params.comment_id);
            res.redirect("/blog/" + req.params.id);
        }
    });
});


//Comment destroy route
router.delete("/:comment_id",isLoggedIn, checkCommentOwnership, function (req, res) {
    //Find by id and delete
    Comment.findByIdAndDelete(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back")
        } else {
            res.redirect("/blog/" + req.params.id)
        }
    })


});



//funtion to verify if user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login")
}



//Check who owns blog.
function checkCommentOwnership(req, res, next) {
    //is user logged in
    if (req.isAuthenticated()) {
        //find blog by id
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("/blog");
            } else {
                //does user own campground
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }

            }
        });
    } else {
        res.redirect("back");
    }
}


//Export data
module.exports = router;