var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var Comment = require("../models/comment");
//Testing fileupload
const fileupload = require("express-fileupload");
//Testing file removal
const fs = require('fs');

//default options, https://github.com/richardgirges/express-fileupload/tree/master/example retrieved from
router.use(fileupload());

//Path test, careful using the / infront of paths
var pathSet = 'public/img/';

//Get all blogs from system
router.get("/", function (req, res) {
    //Testing showing user id
    console.log(req.user)

    Blog.find({}, function (err, blogs) {
        if (err) {
            console.log("ERROR!!");
        } else {
            //Adding user here req.user
            res.render('pages/blog', { blogs: blogs, currentUser: req.user });
        }

    });

});

//create new blog 
router.post("/", isLoggedIn, function (req, res) {
    //Create blog
    //Sanitize data
   // var mBody = req.sanitize(req.body.blog)
   // req.body.blog = mBody

    //Handle empty file, if no file is uploaded redirect back to new
    //if (!req.files) {
    //  //res.redirect("back");        
    //    console.log("Error  " + req.files)
    //}
    //this can work also testing null files
    if (req.files == null) {
        console.log("File is null  " + req.files)
        res.redirect("back");
    } else {
        
    }

    //Image object/file
    let sampleFile = req.files.sampleFile;


    console.log("File uploading name " + req.files.sampleFile.name)
    console.log("File uploading size " + req.files.sampleFile.size)
    console.log("File uploading type " + req.files.sampleFile.mimetype)
    console.log("File uploading path " + pathSet)
    //TODO If statement for file size

    var mfileName = req.files.sampleFile.name

    //Use the MV() method to move the file
    //Have to modify pathSet, currently testing. Works but some fine tuning needed
    if (req.files.sampleFile.mimetype == "image/jpeg" || req.files.sampleFile.mimetype == "image/tiff" || req.files.sampleFile.mimetype == "image/png") {
        pathSet = 'public/img/'
    }
    if (req.files.sampleFile.mimetype == "video/mp4") {
        pathSet = 'public/vid/'
    }

    sampleFile.mv(pathSet + mfileName, function (err) {
        if (err) {
            console.log(err)
            console.log("did not upload")
        } else {
            console.log(pathSet + req.files.sampleFile.name)
            console.log("File upload")
        }
    })


    //req.body.image
    var mTitle = req.body.title
    //Testing file types. Works some fine tuning later, possible adding to the above if statement
    if (req.files.sampleFile.mimetype == "image/jpeg" || req.files.sampleFile.mimetype == "image/tiff" || req.files.sampleFile.mimetype == "image/png") {
        var mImage = '/img/' + req.files.sampleFile.name
       
    } else {
        var mImage = '/vid/' + req.files.sampleFile.name
    }
    
    console.log("Testing location " + mImage)

    var mDescription = req.body.description
    var mAuthor = {
        id: req.user._id,
        username: req.user.username
    }
    //TODO Testing if image file name is empty, then later test if image is video
    if (mImage == null || mImage == "") {
        //Create array of blog variables
        var mNewBlog = { title: mTitle, image: "Empty or Null", body: mDescription, author: mAuthor }
    } else {
    //Create array of blog variables
    var mNewBlog = { title: mTitle, image: mImage, body: mDescription, author: mAuthor }
    }  



    Blog.create(mNewBlog, function (err, newBlog) {
        if (err) {
            res.render("pages/new")
        } else {
            //then redirect to index
            res.redirect("/blog")
        }
    });

});


//Get new blog page
router.get("/new", isLoggedIn, function (req, res) {
    res.render("pages/new");

});

//Show route
router.get("/:id", function (req, res) {

    Blog.findById(req.params.id).populate("comments").exec(function (err, foundBlog) {
        if (err) {
            res.redirect("/blog");
        } else {
            console.log(req.params.id)
            console.log(foundBlog)
            res.render("pages/show", { blog: foundBlog });
        }

    });

});

//Edit route
router.get("/:id/edit",isLoggedIn, checkBlogOwnership, function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        res.render("pages/edit", { blog: foundBlog });
    });

});

//Update route
router.put("/:id/",isLoggedIn, function (req, res) {
    //Sanitize data
    // req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findOneAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
        if (err) {
            res.redirect("/blog")
        } else {
            //save what was edited
            // console.log("save edit blog " + req.body + " id of blog " + req.params.id);
            updatedBlog.save();
            res.redirect("/blog/" + req.params.id)
        }
    })
})

//Delete route
router.delete("/:id",isLoggedIn, checkBlogOwnership, function (req, res) {

    //Delete picture
    Blog.findById(req.params.id, function (err, deletePic) {
        let sampleFile = deletePic.image;

        //Testing file removal
        fs.unlink('public' + sampleFile, (err) => {
            if (err) {
                console.error(err)
                return
            } else {
                console.log("file removed")
            }
        })

    });

    //Delete blog
    Blog.findByIdAndDelete(req.params.id, function (err, blogRemove) {
        if (err) {
            res.redirect("/blog")
        } else {
            //Delete all comments associated with blog
            Comment.deleteMany({ _id: { $in: blogRemove.comments } }, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Comments deleted");
                }
            })
            res.redirect("blog");
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
function checkBlogOwnership(req, res, next) {
    //is user logged in
    if (req.isAuthenticated()) {
        //find blog by id
        Blog.findById(req.params.id, function (err, foundBlog) {
            if (err) {
                res.redirect("/blog");
            } else {
                //does user own campground
                if (foundBlog.author.id.equals(req.user._id)) {
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



module.exports = router;
