# OAuth Setup Guide for Bookaryao

## 1. Google OAuth

### Шаг 1: Создай проект в Google Cloud Console
1. Перейди на https://console.cloud.google.com/
2. Нажми на выпадающее меню проектов (вверху слева рядом с "Google Cloud")
3. Нажми **"New Project"** (Новый проект)
4. Название: `Bookaryao`
5. Нажми **"Create"**

### Шаг 2: Настрой OAuth Consent Screen
1. В боковом меню: **APIs & Services** → **OAuth consent screen**
2. Выбери **External** → **Create**
3. Заполни:
   - App name: `Bookaryao`
   - User support email: твой email
   - Developer contact email: твой email
4. Нажми **"Save and Continue"**
5. На странице Scopes нажми **"Save and Continue"** (ничего добавлять не надо)
6. На странице Test Users добавь свой email → **"Save and Continue"**
7. Нажми **"Back to Dashboard"**

### Шаг 3: Создай OAuth Client ID
1. В боковом меню: **APIs & Services** → **Credentials**
2. Нажми **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **Web application**
4. Name: `Bookaryao Web`
5. В секции **Authorized redirect URIs** добавь:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Нажми **"Create"**
7. Скопируй **Client ID** и **Client Secret**

### Шаг 4: Вставь в .env.local
```
AUTH_GOOGLE_ID=скопированный_client_id
AUTH_GOOGLE_SECRET=скопированный_client_secret
```

---

## 2. GitHub OAuth

### Шаг 1: Создай OAuth App
1. Перейди на https://github.com/settings/developers
2. Нажми **"OAuth Apps"** (в левом меню)
3. Нажми **"New OAuth App"**

### Шаг 2: Заполни форму
- **Application name:** `Bookaryao`
- **Homepage URL:** `http://localhost:3000`
- **Authorization callback URL:**
  ```
  http://localhost:3000/api/auth/callback/github
  ```
4. Нажми **"Register application"**

### Шаг 3: Получи ключи
1. На странице приложения скопируй **Client ID**
2. Нажми **"Generate a new client secret"**
3. Скопируй **Client Secret** (он показывается только один раз!)

### Шаг 4: Вставь в .env.local
```
AUTH_GITHUB_ID=скопированный_client_id
AUTH_GITHUB_SECRET=скопированный_client_secret
```

---

## Проверка

После заполнения `.env.local` должно быть так:

```env
AUTH_GOOGLE_ID=123456789-xxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxxxxxxxxxx
AUTH_GITHUB_ID=Ov23liXXXXXXXXXX
AUTH_GITHUB_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Запусти проект:
```bash
npm run dev
```

Перейди на http://localhost:3000 → нажми "Get Started" или "Sign In" → выбери Google или GitHub.
