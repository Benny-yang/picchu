# fe-web — Picchu 前端

以 React + TypeScript + Vite 建構的攝影社群平台前端。

## 技術棧

- **框架**：React 18 + TypeScript
- **路由**：`react-router-dom` v7（BrowserRouter）
- **建構**：Vite
- **CSS**：Tailwind CSS
- **HTTP**：Axios（含 JWT token 自動攜帶及 401 重定向）

## 啟動方式

```bash
# 安裝依賴
npm install

# 本地開發（需搭配 be-api）
npm run dev

# 型別檢查
npx tsc --noEmit

# 建構 production
npm run build
```

## 環境變數

在 `.env.local` 設定以下變數：

```env
VITE_API_URL=http://localhost:8080
VITE_IMG_BASE_URL=http://localhost:8080
```

## 路由結構

| 路徑 | 頁面 | 需要登入 |
|---|---|---|
| `/` | 作品牆 | ❌ |
| `/activities` | 揪團活動 | ❌ |
| `/activities/create` | 建立/編輯活動 | ✅ |
| `/profile` | 我的主頁 | ❌ |
| `/profile/:uid` | 指定用戶主頁 | ❌ |
| `/settings` | 設定 | ✅ |
| `/applications` | 活動申請紀錄 | ✅ |
| `/login` | 登入/註冊 | ❌ |
| `/edit-profile` | 編輯個人資料 | ✅ |
| `/reset-password` | 密碼重設 | ❌ |

## 目錄結構

```
src/
├── App.tsx            # BrowserRouter + Routes 定義、RequireAuth 守衛
├── config.ts          # API URL 環境變數讀取
├── context/
│   └── UserContext.ts # 全域 currentUser 狀態共享
├── types/
│   └── index.ts       # TypeScript 介面（User、Activity、Work…）
├── services/          # Axios API 呼叫封裝
├── utils/
│   ├── dateUtils.ts   # 相對時間格式化
│   └── roleUtils.ts   # parseRoles 角色解析（集中管理）
├── pages/             # 路由對應的頁面元件
│   ├── UserProfilePage.tsx    # useParams(:uid) 取用 UID
│   ├── CreateActivityPage.tsx # useSearchParams 讀取 edit mode
│   ├── ResetPasswordPage.tsx  # useSearchParams 讀取 token
│   └── ...
└── components/        # 可重用元件
    ├── layout/        # MainHeader、MobileMenu、ProfileDropdown…
    ├── works/         # WorkCard、WorkDetailModal…
    ├── activities/    # ActivityCard、ActivityDetailModal…
    └── user/          # UserInfo、ReviewHistoryModal…
```

## 導航模式

所有導航使用 `react-router-dom` 標準做法：

```tsx
// 元件內部導航
const navigate = useNavigate();
navigate('/profile/123');

// 標籤式導航
<Link to="/activities">活動</Link>

// Axios interceptor（React context 外部）
window.location.replace('/login'); // 401 強制登出
```
