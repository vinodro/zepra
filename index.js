const { convertToYMCK, sendToPrinter } = require("./utils/util");

require("dotenv").config();
const express = require("express");

const app = express();

const PORT = process.env.PORT;

app.use(express.json());


app.get("/direct/print", async (req, res) => {
  await sendToPrinter();
  res.status(200).json({
    sucess: true
  });
});

app.get("/zepra", async (req, res) => {
  await convertToYMCK();
  res.status(200).json({
    sucess: true
  });
});
app.listen(PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
