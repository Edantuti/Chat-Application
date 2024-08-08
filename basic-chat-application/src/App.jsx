import { Outlet } from "react-router-dom";

function App() {
  return (
    <main className="min-h-screen">
      <h1 className="text-2xl px-10 py-4">Chat Application</h1>
      <Outlet />
    </main>
  );
}

export default App;
