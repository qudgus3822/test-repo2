const express = require("express");
const path = require("path");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;

// Gzip 압축
app.use(compression());

// 정적 파일 서빙 (캐싱 설정)
app.use(
  express.static(path.join(__dirname, "dist"), {
    maxAge: "1d",
    etag: true,
  })
);

// SPA 라우팅 - 모든 경로에서 index.html 반환
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
