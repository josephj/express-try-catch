const express = require("express");
const app = express();
const fs = require("fs");

app.get("/", (req, res) => res.send("Hello World!"));

// Express will catch the errors in synchrous code #1
app.get("/error", (req, res) => {
  throw new Error("Trigger error #1"); // try-catch is not necessary
});

// Express will catch the errors in synchrous code #2
const foo = () => {
  throw new Error("foo is broken");
};
app.get("/error-method", () => {
  foo(); // try-catch is not necessary.
});

// Express can't handle error which happens in asynchrous code
// App breaks even if you place try-catch outside.
// The try-catch must happen inside.
// The error won't be swallowed.
app.get("/error-settimeout", (req, res, next) => {
  setTimeout(() => {
    try {
      throw new Error("Trigger error #2");
    } catch (e) {
      next(e);
    }
  }, 1000);
});

// For both .then and async/await syntax
// App will keep loading if we don't resolve nor reject.
const promiseFn = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("/file-does-not-exist", "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

// The error will be swallowed if you don't use catch with next to re-throw the error
// The App will keep loading if you don't use catch with next to re-throw the error
app.get("/error-promise", (req, res, next) => {
  promiseFn()
    .then(data => {
      console.log(data);
    })
    .catch(e => {
      // It keeps loading if I don't specify catch.
      next("Catched promise error - " + e);
    });
});

// The error will be swallowed if you don't use try-catch with next to re-throw the error
// The App will keep loading if you don't use try-catch with next to re-throw the error
app.get("/error-async-await", async (req, res, next) => {
  try {
    const data = await promiseFn();
  } catch (e) {
    // It keeps loading if I don't specify catch.
    next("Catched async/await error with try-catch: " + e);
  }
  console.log(data);
});

app.listen(process.env.PORT || 3000, () => console.log("Example app listening on port 3000!"));
