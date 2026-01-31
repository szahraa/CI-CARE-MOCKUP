import express from "express";
import serverless from "serverless-http";

const app = express();
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "CI-CARE API running" });
});

export default serverless(app);
 