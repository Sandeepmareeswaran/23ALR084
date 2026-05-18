const express = require("express");
const cors = require("cors");
const router = require("./Router/NotificationRouter");
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send('Notification backend (simple)'));
app.use("/api/notification", router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


