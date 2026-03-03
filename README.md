# Way-J

日程策划助手，基于固定一周节奏，支持执行记录与 AI 对话调整。

## 本地开发

```bash
npm install
npm run dev
```

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库（如 `way-j`），**不要**勾选「添加 README」
2. 在本项目目录执行：

```bash
cd /Users/hecongqin/Program/RythomOS
git init
git add .
git commit -m "初始化"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

3. 在仓库 **Settings → Pages**：
   - Source 选择 **GitHub Actions**
   - 保存后，每次推送到 `main` 会自动部署

4. 部署完成后访问：`https://你的用户名.github.io/仓库名/`  
   例如仓库名为 `way-j`，则地址为 `https://xxx.github.io/way-j/`
