# Level Up AI — Frontend

> Last updated: 2026-07-11

---

## Technology Stack

| Technology      | Version  | Status   | Purpose                        |
|-----------------|----------|----------|--------------------------------|
| React           | 19       | ✅ Active | UI component library           |
| Vite            | 8        | ✅ Active | Build tool & dev server        |
| Material UI     | 6+       | 🔜 Planned | Component library & theming   |
| React Router    | v7       | 🔜 Planned | Client-side routing           |
| Axios           | Latest   | 🔜 Planned | HTTP client for API calls     |
| React Context   | Built-in | 🔜 Planned | Global state management       |

---

## Development Server

```bash
# Start the Vite dev server
npm run dev
```

| Item           | Value                          |
|----------------|--------------------------------|
| Dev URL        | `http://localhost:5173`         |
| API Proxy      | Proxied to `http://localhost:8080/api/v1` |
| Hot Reload     | Enabled (Vite HMR)            |

---

## Planned Folder Structure

```
src/
├── api/                  # Axios instance, API service functions
│   ├── axiosInstance.js
│   ├── habitApi.js
│   └── authApi.js
├── assets/               # Static assets (images, fonts, icons)
├── components/           # Reusable UI components
│   ├── common/           # Buttons, inputs, modals, loaders
│   └── layout/           # Header, Sidebar, Footer, MainLayout
├── context/              # React Context providers
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── hooks/                # Custom React hooks
├── pages/                # Route-level page components
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── HabitDetail.jsx
├── routes/               # Route definitions
│   └── AppRoutes.jsx
├── styles/               # Global styles, theme config
│   ├── global.css
│   └── theme.js
├── utils/                # Helper/utility functions
├── App.jsx               # Root component
└── main.jsx              # Entry point
```

---

## State Management

| Scope          | Approach          | Use Case                              |
|----------------|-------------------|---------------------------------------|
| Global Auth    | React Context     | User session, JWT token               |
| Theme          | React Context     | Dark/light mode preference            |
| Component      | `useState`        | Local UI state (form inputs, toggles) |
| Server State   | Axios + `useEffect` | API data fetching (upgrade to React Query later) |

---

## API Integration

### Axios Instance (Planned)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor — attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Global error handling
    return Promise.reject(error);
  }
);

export default api;
```

---

## Theming (Planned)

MUI theme customization will define:

- Primary & secondary color palette
- Typography scale
- Dark / light mode toggle
- Component-level overrides (buttons, cards, inputs)

---

## Routing (Planned)

| Route           | Page Component  | Auth Required |
|-----------------|-----------------|---------------|
| `/`             | Dashboard       | Yes           |
| `/login`        | Login           | No            |
| `/register`     | Register        | No            |
| `/habits`       | HabitList       | Yes           |
| `/habits/:id`   | HabitDetail     | Yes           |
| `/goals`        | GoalList        | Yes           |
| `*`             | NotFound (404)  | No            |
