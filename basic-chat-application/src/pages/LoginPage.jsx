import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { useState } from "react";

export default function LoginPage() {
  const [data, setData] = useState("");
  const navigate = useNavigate();
  function createUser() {
    socket.auth = { username: data };
    socket.connect();
    socket.on("session", (data) => {
      localStorage.setItem("sessionId", data.sessionId);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);
    });
    navigate("/chat");
  }
  return (
    <section className="max-h-full min-h-screen relative">
      <div className="w-80 h-96 border shadow absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-10 py-10 rounded">
        <h2 className="w-fit mx-auto text-2xl">Login</h2>
        <input
          onChange={(e) => setData(e.target.value)}
          type="text"
          name="username"
          placeholder="Enter your username"
          className="px-2 py-2.5 mx-2 rounded border outline-slate-400"
        />
        <button
          onClick={() => createUser()}
          className="px-4 py-2.5 w-fit mx-auto bg-green-100 rounded"
        >
          Submit
        </button>
      </div>
    </section>
  );
}
