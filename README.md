# 弈生圍棋教室 寒暑假課程試算

家長選好上課日期，馬上看到費用與優惠，並可複製報名內容到 LINE。管理者可用密碼進後台修改課程、優惠、日期與設定。

## 專案結構

- `public/index.html`：整個網頁（家長端 + 後台）。檔案內建一份預設設定，當作資料庫還沒有內容時的備份。
- `api/config.js`：家長端載入最新設定。
- `api/login.js`、`api/save.js`：後台登入與「儲存並發布」，需要後台密碼。
- `api/_lib.js`：資料儲存與密碼檢查的共用程式。
- `scripts/dev-server.js`：本機測試用。

## 部署到 Vercel（只需做一次）

1. 在 Vercel 按 **Add New → Project**，匯入這個 GitHub 專案，Framework 選 **Other**，直接 Deploy。
2. 專案頁面進 **Storage**（或 Marketplace），新增 **Upstash Redis**（免費方案），並連接到這個專案。連接後 Vercel 會自動加入資料庫的連線環境變數。
3. 進 **Settings → Environment Variables**，新增：
   - 名稱 `ADMIN_PASSWORD`，值是後台密碼（自己決定，不要放進程式或傳給別人）。
4. 回 **Deployments**，對最新一次部署按 **Redeploy**，讓新設定生效。
5. 進 **Settings → Domains**，加入 `yishengeducation.net`，依畫面指示到 GoDaddy 設定 DNS。

## 使用方式

- 家長端：打開網址即可。
- 後台：網址後面加 `#admin`（例如 `https://yishengeducation.net/#admin`），頁面最下方會出現「編輯內容（後台）」，輸入密碼進入。
- 修改後按「儲存並發布」，家長端重新整理就會看到新內容。
- 系統會自動保留「上一版」設定（資料庫的 `yisheng:config:prev`），改壞時可請開發者還原。

## 本機測試

```
ADMIN_PASSWORD=測試密碼 node scripts/dev-server.js
```

打開 http://localhost:3000 。本機測試使用內建的假資料庫，不會動到正式資料。
