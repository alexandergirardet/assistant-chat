import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { Messages } from "./messages"
import { InputMessage } from "./input-message"
import { useMutation } from "@tanstack/react-query";

export interface Message {
    id: string;
    content: string;
    sender: "user" | "bot";
}


export const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "Hello, how are you?",
            sender: "bot",
        },
        {
            id: "2",
            content: "I'm fine, thank you!",
            sender: "user",
        },
        {
            id: "3",
            content: "What is your name?",
            sender: "bot",
        },
    ]);

    const { mutate } = useMutation({
        mutationFn: async (message: Message) => {
            const response = await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                body: JSON.stringify(message),
            });
            const data = await response.json();
            return data;
        },
    });

    return (
        <Card className="col-span-4 h-screen flex flex-col p-4 border-0">
            <CardContent id="card-content" className="flex-grow flex flex-col bg-gray-100 rounded-lg">
                <Messages messages={messages} />
                <InputMessage messages={messages} setMessages={setMessages} />
            </CardContent>
        </Card>
    )
}

