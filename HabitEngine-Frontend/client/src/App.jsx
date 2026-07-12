import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import router from "./routes/AppRouter";

/**
 * Root application component.
 * Wraps the app with:
 * - ErrorBoundary: catches unexpected render errors
 * - ThemeProvider: dark/light mode context
 * - AuthProvider: JWT authentication state management
 * - RouterProvider: React Router v7 data router
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
