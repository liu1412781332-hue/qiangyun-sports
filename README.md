# 强运运动推广网站

这是一个静态运动推广网站，面向青少年和上班族，推广健身、篮球、足球、跑步、拳击、羽毛球活动。

## 本地预览

直接打开 `index.html` 即可预览。

## 完整后端运行

项目已经包含一个零依赖 Node.js 后端，可以接收咨询表和活动报名弹窗的数据。

```bash
npm start
```

启动后访问：

- 网站首页：`http://127.0.0.1:3000/`
- 健康检查：`http://127.0.0.1:3000/api/health`
- 咨询后台：`http://127.0.0.1:3000/admin.html`

后台默认管理密码是 `qiangyun-admin`。正式部署时请设置环境变量 `ADMIN_TOKEN`，不要使用默认密码。

咨询记录会保存到 `data/inquiries.jsonl`。这是轻量文件存储，适合前期试运行；正式长期运营建议以后换成数据库。

## 部署方式

静态展示可以部署到 GitHub Pages：

1. 在 GitHub 创建一个公开仓库。
2. 推送本项目代码。
3. 在仓库 `Settings > Pages` 中选择 `Deploy from a branch`。
4. 分支选择 `main`，目录选择 `/root`。

如果要使用后端，GitHub Pages 不支持运行接口，需要部署到支持 Node.js 的免费平台。项目已包含 `render.yaml`，可以导入到 Render，启动命令是 `npm start`。

## 联系方式

微信：18902543881
