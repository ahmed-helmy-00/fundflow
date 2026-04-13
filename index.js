const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const ejs = require("ejs");
require("dotenv").config();

const PORT = process.env.PORT;
const saltRounds = process.env.saltRounds;
const JWT_SECRET = process.env.JWT_SECRET;

var connection = mysql.createConnection({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.db_name,
  port: process.env.db_port,
});

connection.connect();

const server = http.createServer(async (req, res) => {
  // 1. Parse the URL to get the path and query parameters
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // 2. Set the response header (JSON)
  res.setHeader("Content-Type", "application/json");

  // 3. Helper function to extract ID from path (e.g., /items/1 -> 1)
  const getIdFromPath = (pathname) => {
    const parts = pathname.split("/");
    return parts[2];
  };

  // 4. Helper function to send response
  const sendResponse = (statusCode, data) => {
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
  };

  // 5. Helper function to parse request body based on content type
  const parseRequestBody = (body, contentType) => {
    if (contentType === "application/json") {
      return body ? JSON.parse(body) : {};
    } else if (contentType === "application/x-www-form-urlencoded") {
      const params = new URLSearchParams(body);
      return Object.fromEntries(params);
    } else {
      return {};
    }
  };

  // 6. Helper function to collect request body data
  const collectBody = (callback) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const contentType = req.headers["content-type"];
        const data = parseRequestBody(body, contentType);
        callback(data);
      } catch (error) {
        sendResponse(400, { error: "Invalid body data" });
      }
    });
  };

  // 7. Helper function to get auth token from cookies
  const getAuthToken = () => {
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/authToken=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  // 10. Routes - HOME PAGE (GET)
  if (method === "GET" && path === "/") {
    res.setHeader("Content-Type", "text/html");
    ejs.renderFile("./views/home.ejs", {}, (err, html) => {
      if (err) {
        res.statusCode = 500;
        res.end("<h1>500 - Error rendering template</h1>");
      } else {
        res.statusCode = 200;
        res.end(html);
      }
    });
  }

  // 11. Routes - REGISTRATION PAGE (GET)
  else if (method === "GET" && path === "/register") {
    res.setHeader("Content-Type", "text/html");
    const filePath = "./views/regester.html";
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end("<h1>404 - File Not Found</h1>");
      } else {
        res.statusCode = 200;
        res.end(data);
      }
    });
  }

  // 7. Routes - LOGIN PAGE (GET)
  else if (method === "GET" && path === "/login") {
    res.setHeader("Content-Type", "text/html");
    const filePath = "./views/login.html";
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end("<h1>404 - File Not Found</h1>");
      } else {
        res.statusCode = 200;
        res.end(data);
      }
    });
  } else if (method === "GET" && path === "/donor-dashboard") {
    console.log("headers", req.headers);
    console.log("cookies", req.headers.cookie);
    // Check for auth token in cookies
    const token = getAuthToken();
    if (!token) {
      res.statusCode = 302;
      res.setHeader("Location", "/");
      res.end();
      return;
    }

    try {
      // Verify the token and get user info
      const user = jwt.verify(token, JWT_SECRET);
      console.log("Verified user", user);

      // Render the test page with user info
      connection.query(
        "SELECT * FROM users WHERE id = ?",
        [user.id],
        (error, results) => {
          if (error) {
            res.statusCode = 500;
          }
          if (results.length === 0) {
            res.statusCode = 401;
          }
          const user = results[0];
          console.log("User from DB", user);
          ejs.renderFile("./views/test.ejs", { user: user }, (err, html) => {
            if (err) {
              console.error("Error rendering template", err);
              res.statusCode = 500;
              res.end("<h1>500 - Error rendering template</h1>");
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "text/html");
              res.end(html);
            }
          });
        },
      );
    } catch (error) {
      res.statusCode = 302;
      res.setHeader("Location", "/");
      res.end();
    }
  }

  // 8. Routes - USER REGISTRATION (POST)
  else if (method === "POST" && path === "/register") {
    collectBody((data) => {
      console.log("User Registration Data:", data);
      try {
        connection.query(
          "SELECT * FROM users WHERE email = ?",
          [data.email],
          (error, results) => {
            if (error) {
              return sendResponse(500, {
                error: "Error checking existing user",
              });
            }
            if (results.length > 0) {
              return sendResponse(400, { error: "Email already registered" });
            }
          },
        );
        try {
          bcrypt.hash(data.password, saltRounds, (err, hash) => {
            if (err) {
              return sendResponse(500, { error: "Error hashing password" });
            }
            // Continue with user creation logic
            console.log("Hashed Password:", hash);
            // Here you would typically save the user to the database
            connection.query(
              "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
              [data.name, data.email, hash, data.role],
              (error, results) => {
                if (error) {
                  return sendResponse(500, { error: "Error creating user" });
                }
                // Get the newly created user
                connection.query(
                  "SELECT id, name, email, role FROM users WHERE email = ?",
                  [data.email],
                  (selectError, selectResults) => {
                    if (selectError) {
                      return sendResponse(500, {
                        error: "Error fetching user",
                      });
                    }
                    const user = selectResults[0];

                    // Create JWT token
                    const token = jwt.sign(
                      {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                      },
                      JWT_SECRET,
                      { expiresIn: "1d" },
                    );

                    // Set httpOnly cookie with JWT
                    res.setHeader(
                      "Set-Cookie",
                      `authToken=${encodeURIComponent(token)}; HttpOnly; Max-Age=${24 * 60 * 60}; Path=/; SameSite=Strict`,
                    );

                    // Send response with redirect URL
                    // Redirect based on user role
                    if (user.role === "donor") {
                      sendResponse(200, {
                        message: "User logged in successfully",
                        redirect: "/donor-dashboard",
                        user: {
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          role: user.role,
                        },
                      });
                    } else if (user.role === "creator") {
                      sendResponse(200, {
                        message: "User logged in successfully",
                        redirect: "/beneficiary-dashboard",
                        user: {
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          role: user.role,
                        },
                      });
                    }
                  },
                );
              },
            );
          });
        } catch (error) {
          return sendResponse(500, { error: "Error processing registration" });
        }
      } catch (error) {
        return sendResponse(500, { error: "Database query error" });
      }
    });
  }

  // 9. Routes - USER LOGIN (POST)
  else if (method === "POST" && path === "/login") {
    collectBody((data) => {
      console.log("User Login Data:", data);
      connection.query(
        "SELECT * FROM users WHERE email = ?",
        [data.email],
        (error, results) => {
          if (error) {
            return sendResponse(500, { error: "Error fetching user" });
          }
          if (results.length === 0) {
            return sendResponse(401, { error: "Invalid email" });
          }
          const user = results[0];
          bcrypt.compare(data.password, user.password_hash, (err, result) => {
            if (err) {
              return sendResponse(500, {
                error: "Error comparing passwords",
              });
            }
            if (!result) {
              return sendResponse(401, {
                error: "Invalid password",
              });
            }

            // Create JWT token
            const token = jwt.sign(
              {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              },
              JWT_SECRET,
              { expiresIn: "1d" },
            );

            // Set httpOnly cookie with JWT
            res.setHeader(
              "Set-Cookie",
              `authToken=${encodeURIComponent(token)}; HttpOnly; Max-Age=${24 * 60 * 60}; Path=/; SameSite=Strict`,
            );
            console.log("req headers", req.headers);
            console.log("Set-Cookie header", res.getHeader("Set-Cookie"));

            // Send response with redirect URL
            // Redirect based on user role
            if (user.role === "admin") {
              sendResponse(200, {
                message: "User logged in successfully",
                redirect: "/admin-dashboard",
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                },
              });
            } else if (user.role === "donor") {
              sendResponse(200, {
                message: "User logged in successfully",
                redirect: "/donor-dashboard",
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                },
              });
            } else if (user.role === "creator") {
              sendResponse(200, {
                message: "User logged in successfully",
                redirect: "/beneficiary-dashboard",
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                },
              });
            }
          });
        },
      );
    });
  }

  // 8. Routes - TEST PAGE (GET)
  else if (method === "GET" && path === "/test") {
    console.log("headers", req.headers);
    console.log("cookies", req.headers.cookie);
    // Check for auth token in cookies
    const token = getAuthToken();
    if (!token) {
      res.statusCode = 302;
      res.setHeader("Location", "/");
      res.end();
      return;
    }

    try {
      // Verify the token and get user info
      const user = jwt.verify(token, JWT_SECRET);
      console.log("Verified user", user);

      // Render the test page with user info
      connection.query(
        "SELECT * FROM users WHERE id = ?",
        [user.id],
        (error, results) => {
          if (error) {
            res.statusCode = 500;
          }
          if (results.length === 0) {
            res.statusCode = 401;
          }
          const user = results[0];
          console.log("User from DB", user);
          ejs.renderFile("./views/test.ejs", { user: user }, (err, html) => {
            if (err) {
              console.error("Error rendering template", err);
              res.statusCode = 500;
              res.end("<h1>500 - Error rendering template</h1>");
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "text/html");
              res.end(html);
            }
          });
        },
      );
    } catch (error) {
      res.statusCode = 302;
      res.setHeader("Location", "/");
      res.end();
    }
  }

  // 10. Routes - USER LOGOUT (GET)
  else if (method === "GET" && path === "/logout") {
    // Clear the auth token cookie
    res.setHeader("Set-Cookie", "authToken=; Max-Age=0; Path=/; HttpOnly");

    res.setHeader("Content-Type", "text/html");
    res.statusCode = 302;
    res.setHeader("Location", "/");
    res.end();
  }

  // 12. Routes - CHECK AUTH STATUS (GET)
  else if (method === "GET" && path === "/auth-status") {
    const token = getAuthToken();
    if (!token) {
      return sendResponse(200, { authenticated: false });
    }
    try {
      const user = jwt.verify(token, JWT_SECRET);
      sendResponse(200, { authenticated: true, user });
    } catch (error) {
      sendResponse(200, { authenticated: false });
    }
  }

  // 13. UPDATE - Modify item (PUT /items/:id)
  else if (method === "GET" && path === "/test") {
    const token = getAuthToken();
    if (!token) {
      return sendResponse(200, { authenticated: false });
    }
    try {
      const user = jwt.verify(token, JWT_SECRET);
      sendResponse(200, { authenticated: true, user });
      console.log("Verified user", user);
    } catch (error) {
      sendResponse(200, { authenticated: false });
    }
  }

  // 14. DELETE - Remove item (DELETE /items/:id)
  else if (method === "DELETE" && path.startsWith("/items/")) {
    const id = parseInt(getIdFromPath(path));
    const itemIndex = items.findIndex((i) => i.id === id);

    if (itemIndex === -1) {
      return sendResponse(404, { error: "Item not found" });
    }

    const deletedItem = items.splice(itemIndex, 1);
    sendResponse(200, {
      message: "Item deleted successfully",
      data: deletedItem[0],
    });
  }

  // 15. Fallback for 404 Not Found
  else {
    sendResponse(404, { error: "Route not found" });
  }
});

// Start the server on port 3000
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log("\nAvailable endpoints:");
  console.log("GET http://localhost:3000/");
  console.log("GET http://localhost:3000/register");
  console.log("POST http://localhost:3000/register");
  console.log("GET http://localhost:3000/items");
  console.log("GET http://localhost:3000/items/1");
  console.log("PUT http://localhost:3000/items/1");
  console.log("DELETE http://localhost:3000/items/1");
});
