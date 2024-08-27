import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card"
import { useState } from "react";
interface Thread {
  id: string;
  title: string;
  content: string;
}

export const Threads = () => {
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "1",
      title: "Thread 1",
      content: "Thread 1 content",
    },
    {
      id: "2",
      title: "Thread 2",
      content: "Thread 2 content",
    },
    {
      id: "3",
      title: "Thread 3",
      content: "Thread 3 content",
    },
  ]);
  return (
    <div className="border-1 col-span-1">
      <Card>
        <CardHeader>
          <CardTitle>Threads</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {threads.map((thread: Thread) => {
              return (
                <div>
                  <li key={thread.id}>
                    Title: {thread.title}
                    Content: <p>{thread.content}</p>
                  </li>
                </div>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}