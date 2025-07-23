import crypto from "crypto";
import { createCanvas } from "canvas";
import fs from "fs";

export function generateIcon(
  id: string,
  name: string,
  size = 256,
  outputPath = "icon.png"
) {
  // 1. 基于ID生成确定性随机种子
  const seed = crypto.createHash("md5").update(id).digest("hex");
  const seedNum = parseInt(seed.slice(0, 8), 16);

  // 2. 创建画布
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // 3. 生成背景色 (基于种子)
  const hue = seedNum % 360;
  ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
  ctx.fillRect(0, 0, size, size);

  // 4. 生成随机图案
  const patternType = seedNum % 4;
  ctx.fillStyle = "rgba(255,255,255,0.3)";

  switch (patternType) {
    case 0: // 圆形
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 1: // 三角形
      ctx.beginPath();
      ctx.moveTo(size / 2, size / 4);
      ctx.lineTo(size / 4, (size * 3) / 4);
      ctx.lineTo((size * 3) / 4, (size * 3) / 4);
      ctx.closePath();
      ctx.fill();
      break;
    case 2: // 条纹
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(0, (i * size) / 5, size, size / 10);
      }
      break;
    case 3: // 随机多边形
      ctx.beginPath();
      const sides = 3 + (seedNum % 5);
      const radius = size / 3;
      for (let i = 0; i <= sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const x = size / 2 + radius * Math.cos(angle);
        const y = size / 2 + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.fill();
      break;
  }

  // 5. 添加文字
  if (name) {
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 自动调整字体大小
    let fontSize = size / 4;
    ctx.font = `bold ${fontSize}px Arial`;

    // 确保文字不超出画布
    while (ctx.measureText(name).width > size * 0.8 && fontSize > 10) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px Arial`;
    }

    ctx.fillText(name, size / 2, size / 2);
  }

  // 6. 保存为PNG
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputPath, buffer);
}
