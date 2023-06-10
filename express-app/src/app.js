require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const swagger_path = path.resolve(__dirname, "./swagger.yaml");
const swaggerDocument = YAML.load(swagger_path);
const fileupload = require("express-fileupload");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
var cors = require('cors');
const User = require("./model/User");
const auth = require("./middleware/auth");
const users = [];

app.use(cors());
app.use(express.json()); // if body is of type applicatin/json
app.use(express.urlencoded({extended: true})) // if body type is of application/x-www-form-urlencoded
// use multer middleware if body type is of multipart/form-data
app.use(cookieParser());
app.use(fileupload());

//home route for testing docs
app.get("/", (req, res) => {
  res.send({ status: 200, message: "Server is live" });
});

//returning array route for testing docs
let posts = [
  { id: 1, posted_by: "teacher" },
  { id: 2, posted_by: "student" },
  { id: 3, posted_by: "both" },
];
app.get("/posts", (req, res) => {
  res.send(posts);
});
//post request for testing docs
app.post("/posts", (req, res) => {
  console.log(req.body);
  posts.push(req.body);
  res.send(true);
});
//query params route for testing docs
app.get("/filteredPosts", (req, res) => {
  let filteredPosts = posts.find(
    (post) => post.id == req.query.id && post.posted_by == req.query.posted_by
  );
  res.send(filteredPosts);
});

//path params route for testing docs
app.get("/token-testing/:token", (req, res) => {
  res.send({ token: req.params.token });
});

//path to handle file for testing docs
app.post("/userProfileUpload", (req, res) => {
  console.log(req.headers);
  const file = req.files.file;
  console.log(req.files);
  let pathFile = __dirname + Date.now() + ".jpg";

  file.mv(pathFile, (err) => {
    res.send(true);
  });
});

//route for api docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//register route
app.post("/register", async (req, res) => {
  try {
    let { firstname, username, email, password } = req.body;
    if (!(firstname && username && email && password)) {
      res.status(400).send("All fields are required");
      return;
    }
    const existingUser = await User.findOne({ email }); //PROMISE: types of promises
    await User.deleteMany();
    if (existingUser) {
      res.status(409).send("Uses already exists");
      return;
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstname,
      username,
      email: email.toLowerCase(),
      password: hashedPass,
    });

    //after registeration you can send token and show the authorized routes
    //or send the user success message and ask to login then send the token
    //token
    // treat token as your car key - anyone who has it can acess your car
    // expire the token
    // token -> header, payload, signature
    // jwts are credential, which can grant access to resources
    const token = jwt.sign({ userId: user._id, email }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });

    //update or not in the db
    user.token = token;
    //handle sending password back to the front-end
    user.password = undefined;
    //send token or send a success message and ask user to loggin
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});
app.get("/Dashboard", auth, (req, res) => {
  res.status(200).send('Welcome to Dashboard');
});
//login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // const { email, password } = req.query;
    console.log(req.body)
    console.log(email, password);
    if (!(email && password)) {
      res.status(400).send("all fields are required");
    }
    const user = await User.findOne({ email });
    console.log(user);
    //to send proper message if password doesn't match hold compare result in a variable;
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { userId: user._id, email },
        process.env.SECRET_KEY,
        { expiresIn: '2h' }
      );
      user.token = token;
      user.password = undefined;
      // res.status(200).json(user);
      // if you want to send cookies
      const options = {
        expires: new Date(Date.now() + 3),
        httpOnly: true //only the backend can see the cookie
      }
      return res.status(200).cookie('token', token, options).json({
        success: true,
        token,
        user
      });
    }
    res.status(400).send("user and password combination didn't match");
  } catch (err) {
    console.log(err);
    // res.status(500).send(err);
  }
});

server.listen(process.env.PORT || 4000);
console.log(`server is running at port ${process.env.PORT}`);
