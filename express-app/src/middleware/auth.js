const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // token can come in header as bearer token, cookies, body
  const token =
    req.cookies.token ||
    req.header("Authorization").replace("Bearer ", "") ||
    req.body.token;

    if (!token) {
      return res.status(403).send('token is missing');
    }

    try {
      const decode = jwt.verify(token, process.env.SECRET_KEY);
      console.log(decode);
      req.user = decode;
      // bring in db and fetch more information based on data from the payload
   }  catch(err) {
      res.redirect('/login');
    }
    next();
};

module.exports = auth;