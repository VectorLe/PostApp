//Packages
let expressSanitizer = require("express-sanitizer"), 
    methodOverride   = require("method-override"),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    express          = require("express"),
    app              = express();

//Config
mongoose.connect("mongodb://localhost:27017/restful_blog_app", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//Mongoose schema setup
let postSchema = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   created: {type: Date, default: Date.now()}
});
let Post = mongoose.model("Post", postSchema);

//RESTFUL routes
//INDEX
app.get("/", function(req, res){
   res.redirect("/posts");
});

app.get("/posts", function(req, res){
   Post.find({}, function(err, posts){
      if(err) console.log(err);
      else res.render("index", {posts: posts});
   });
});

//NEW
app.get("/posts/new", function(req, res){
   res.render("new");
});

//CREATE
app.post("/posts", function(req, res){
   req.body.post.body = req.sanitize(req.body.post.body);
   Post.create(req.body.post, function(err, newPost){
      if(err) res.render("new");
      else res.redirect("/posts");
   });
});

//SHOW
app.get("/posts/:id", function(req, res){
   Post.findById(req.params.id, function(err, foundPost){
      if(err) res.redirect("/");
      else res.render("show", {post: foundPost});
   });
});

//EDIT
app.get("/posts/:id/edit", function(req, res){
   Post.findById(req.params.id, function(err, foundPost){
      if(err) {
         res.redirect("/posts");
      } else {
         res.render("edit", {post: foundPost});   
      }
   });
});

//UPDATE
app.put("/posts/:id", function(req, res){
   req.body.post.body = req.sanitize(req.body.post.body);
   Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
       if(err){
           console.log(err);
       } else {
         res.redirect("/posts/" + updatedPost._id);
       }
   });
});

//DESTROY
app.delete("/posts/:id", function(req, res){
   Post.findByIdAndRemove(req.params.id, function(err, deletedPost){
      if(err){
         res.redirect("/posts");
      } else {
         res.redirect("/posts");
      }
   });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started.");    
});
