const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const DOWNLOADS_DIR = path.join(__dirname, "downloads");
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR);
}

app.use("/downloads", express.static(DOWNLOADS_DIR));

app.post("/download", (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL obrigatória" });
  }

  const output = path.join(
    DOWNLOADS_DIR,
    `video-${Date.now()}.mp4`
  );

  const cmd = `yt-dlp -f "bv*+ba/b" -o "${output}" "${url}"`;

  exec(cmd, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao baixar vídeo" });
    }

    const fileName = path.basename(output);
    const fileUrl = `${req.protocol}://${req.get("host")}/downloads/${fileName}`;

    res.json({
      success: true,
      download: fileUrl
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
