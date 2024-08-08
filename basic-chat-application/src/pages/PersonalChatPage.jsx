import { useLoaderData, useParams } from "react-router-dom";
import { socket } from "../socket";
import { useContext, useState } from "react";
import ChatProvider from "../provider";
import { UserChatContext, UserMessageContext } from "../context/ChatContext";

export default function PersonalChatPage() {
  const { userid } = useParams();
  const { currentUser } = useLoaderData();
  const [messageData, setMessageData] = useState("");
  const userData = useContext(UserChatContext);
  const { messages } = useContext(UserMessageContext);
  function onMessage() {
    socket.emit("message", {
      content: messageData,
      from: currentUser,
      to: userid,
    });
  }
  return (
    <section className="flex flex-col w-full">
      <div className="w-full h-full flex flex-col overflow-y-scroll">
        {messages.map((data, index) => {
          return (
            <div
              key={index}
              className={`${data.from === currentUser ? "bg-green-200 ml-auto" : "bg-slate-300"} w-96 px-6 py-2 m-2 rounded`}
            >
              <h1>
                {data.from === currentUser
                  ? `You ${data.seen ? "(seen)" : ""}`
                  : userData.user.username}
              </h1>
              <p>{data.content}</p>
            </div>
          );
        })}
      </div>
      <div className="border w-full p-2 flex gap-2">
        <input
          onChange={(event) => setMessageData(event.target.value)}
          className="py-2.5 px-2 w-full outline-gray-300 border-gray-200 border rounded"
          type="text"
        />
        <button
          onClick={() => onMessage()}
          className="px-6 py-2 border-2 border-black rounded"
        >
          Send
        </button>
      </div>
    </section>
  );
}
