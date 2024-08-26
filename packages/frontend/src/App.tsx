import { Threads } from "@/components/threads";
import { Chat } from "@/components/chat";

function App() {
  return (
    <main className="h-screen grid grid-rows-1 grid-cols-1 md:grid-cols-5">
      <Threads />
      <Chat />
    </main>
  );
}

export default App;
