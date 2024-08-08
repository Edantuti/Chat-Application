import { useContext, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { socket } from "../socket";
import { UserChatContext, UserMessageContext } from "../context/ChatContext";
import { GiHamburgerMenu } from "react-icons/gi";
//w-80 h-full bg-gray-400 flex flex-col gap-2 py-10 px-2
export default function ChatPage() {
  const [menu, setMenu] = useState(true);
  const [users, setDUsers] = useState([]);
  const ChatUser = useContext(UserChatContext);
  const ChatMessage = useContext(UserMessageContext);
  const username = localStorage.getItem("username");
  function loadNewUsers(data) {
    setDUsers(data);
  }
  //TODO: Handle state of the application on refreshes
  function setMessages(data) {
    ChatMessage.setMessage([...ChatMessage.messages, data]);
  }
  useEffect(() => {
    socket.on("users", (data) => {
      loadNewUsers(data);
    });
    socket.on("private chat", (data) => {
      ChatUser.setUser(data.toUser);
      data.messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
      console.log(data.messages);
      ChatMessage.setMessage(data.messages);
    });
    socket.on("message", (data) => {
      setMessages(data);
    });
    return () => {
      socket.off("users");
      socket.off("private chat");
      socket.off("message");
    };
  }, [users]);
  return (
    <section className="flex h-screen relative">
      {/* NOTE:Fixed required here, for mobile view */}
      <button
        onClick={() => {
          setMenu(!menu);
        }}
        className="z-20 absolute top-10 -translate-x-1/2 left-5"
      >
        <GiHamburgerMenu />
      </button>
      <nav
        className={
          menu
            ? "md:relative fixed left-0 top-0 z-10 h-full w-full bg-white shadow-lg transition-all sm:w-80 flex flex-col gap-2 px-2.5 py-2.5 pt-20"
            : "fixed -left-96 top-0 z-10 mb-4 h-full w-96 bg-white transition-all sm:w-96 space-y-2 pt-20"
        }
      >
        {users?.map((user) => (
          <Link to={`/chat/${user._id}`} key={user._id}>
            <div
              className={`${user.status ? "bg-green-200 " : "bg-slate-200 "}p-2 border rounded`}
            >
              {user?.username === username ||
              user?.username === socket.auth.usernamee
                ? `You (${user?.username})`
                : `${user?.username}`}
            </div>
          </Link>
        ))}
      </nav>
      <Outlet />
    </section>
  );
}
