const express = require('express');
const NotificationSystem = require('../Service/NotificationSystem');
const router = express.Router();

router.get("/test", (req, res) => res.json({ data: { ok: true, msg: "notification router ok" } }));

router.post("/send", async (req, res)=>{
  try {
    const response = await NotificationSystem.send(req.body);

    res.status(201).json({ data: response });

  } catch (error) {
    res.status(400).json({ error: error.message || String(error) });
  }
});

router.get("/unread", async(req, res)=>{
  try {
    const userId = req.query.userId;

    const data = await NotificationSystem.getUnread(userId);

    res.json({ data });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.patch("/:id/read", async(req, res)=>{
  try{
    const data = await NotificationSystem.markRead(req.params.id);
    res.json({ data });


  }catch (err) {

    res.status(404).json({ error: err.message });
  }
});

router.get("/recent", async(req,res)=>{
  try{
    const limit = Number(req.query.limit || 20);

    const data = await NotificationSystem.getRecent(limit);
    res.json({ data });

  }catch(error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/analytics", async(req,res)=>{
  try {
    const type = req.query.type;

    const data = await NotificationSystem.getAnalytics(type);

    res.json({ data });

  } catch (err) {
    res.status(400).json({ error: err.message || String(err) });
  }
});

module.exports = router;
