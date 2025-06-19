import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { AuthProvider, useAuth } from "./auth";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
  },
});

function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
}
