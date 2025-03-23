// copy-standalone.js
const fs = require('fs');
const path = require('path');

// 确保目标目录存在
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 复制目录
const copyDir = (src, dest) => {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

// 主要路径
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const staticDir = path.join(__dirname, '.next', 'static');
const publicDir = path.join(__dirname, 'public');
const nextStaticDir = path.join(standaloneDir, '.next', 'static');

// 确保 standalone/.next 目录存在
ensureDir(path.join(standaloneDir, '.next'));

// 复制 static 文件到 standalone/.next/static
console.log('复制 static 文件到 standalone...');
copyDir(staticDir, nextStaticDir);

// 复制 public 文件到 standalone/public
console.log('复制 public 文件到 standalone...');
copyDir(publicDir, path.join(standaloneDir, 'public'));

console.log('验证文件结构...');
console.log('standalone 目录:', fs.existsSync(standaloneDir) ? '存在' : '不存在');
console.log('server.js 文件:', fs.existsSync(path.join(standaloneDir, 'server.js')) ? '存在' : '不存在');
console.log('static 目录:', fs.existsSync(nextStaticDir) ? '存在' : '不存在');

console.log('复制完成！'); 