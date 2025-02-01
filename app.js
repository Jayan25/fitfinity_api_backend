const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv")
const mysql = require("mysql2")
const Router = require("./src/routes/trainer.router.js");
const common = require("./src/routes/common.router.js");
const webRouter = require("./src/routes/web.router.js");
const userRouter = require("./src/routes/user.router.js");
const adminRouter = require("./src/routes/admin.router.js");
const { sequelize } = require('./src/models');
const { ValidationError } = require("express-validation");
const app = express();

dotenv.config({
  path: './env'
})

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());



app.use("/trainer", Router);
app.use("/common", common);
app.use("/user", userRouter);
app.use("/web", webRouter);
app.use("/admin", adminRouter);


app.use("/", function (_, res) {
  res.statusCode = 200;
  res.json({ status: "success", message: "Parcel Pending API", data: {} });
});

app.use((err, _req, res, _) => {
  console.log("I a insideeeeeeeeeeeeeeeeeeeeeeeeeeeee", err)
  if (err instanceof ValidationError) {
    if (err.details && err.details.body && err.details.body.length && err.details.body[0].message) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.details.body[0].message.replace(/"/g, ""),
      });
    } else {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        response: err,
      });
    }
  }

  return res.status(500).json(err);
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected!");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

module.exports = app;





