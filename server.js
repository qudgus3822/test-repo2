import express from "express";
import path from "path";
import compression from "compression";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
