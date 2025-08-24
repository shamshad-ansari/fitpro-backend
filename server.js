import express from "express";

const app = express(); // Create an Express application
const PORT = 3000; // Hardcoded port for now

// Define a basic route
app.get("/", (req, res) => {
  res.send("Hello from FitPro backend!");
});

// Start listening on the given port
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
