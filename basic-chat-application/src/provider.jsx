import { UserChatContext, UserMessageContext } from "./context/ChatContext";
import { useState } from "react";

export default function ChatProvider({ children }) {
  const [user, setUser] = useState({});
  const [messages, setMessage] = useState([]);
  return (
    <UserChatContext.Provider value={{ user, setUser }}>
      <UserMessageContext.Provider value={{ messages, setMessage }}>
        {children}
      </UserMessageContext.Provider>
    </UserChatContext.Provider>
  );
}
