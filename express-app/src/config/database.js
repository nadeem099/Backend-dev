const mongoose = require("mongoose");

const { MONGODB_URL } = process.env;

exports.connect = () => {
  mongoose
    .connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DB CONNECTION SUCCESSFULL"))
    .catch((err) => {
      console.log("DATABASE CONNECTION FAILED");
      console.log(err);
    });
};
