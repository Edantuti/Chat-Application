import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import PersonalChatPage from "./pages/PersonalChatPage.jsx";
import IntroPage from "./pages/IntroPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import { socket } from "./socket.js";
import ChatProvider from "./provider.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<App />}>
        <Route index element={<LoginPage />} />
      </Route>
      <Route path="/chat" element={<ChatPage />}>
        <Route index element={<IntroPage />} />
        <Route
          path="/chat/:userid"
          loader={({ params }) => {
            socket.emit("get_user", {
              currentUserId: localStorage.getItem("userId"),
              userId: params.userid,
            });
            return { currentUser: localStorage.getItem("userId") };
          }}
          element={<PersonalChatPage />}
        />
      </Route>
    </Route>,
  ),
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatProvider>
      <RouterProvider router={router} />
    </ChatProvider>
  </React.StrictMode>,
);
