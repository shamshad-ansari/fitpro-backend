import express from "express";

const app = express();

// Test route
app.get("/", (req, res) => {
  res.send("Hello from FitPro backend!");
});

export default app;
