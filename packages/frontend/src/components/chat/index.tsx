import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { Messages } from "./messages"
import { InputMessage } from "./input-message"
import { useMutation } from "@tanstack/react-query";
import { MessageDeltaEvent } from "openai/resources/beta/threads/messages";


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

    const handleEventTypeAndData = (eventType: string, eventData: any) => {
        if (eventType.trim() === "thread.message.delta") {
            handleMessageDelta(eventData);
        }
        if (eventType.trim() === "thread.message.created") {
            handleMessageCreated(eventData);
        }
    }

    const handleMessageCreated = (messageStart: unknown) => {
        console.log("Message Start", messageStart);
    }

    const handleMessageDelta = (messageDelta: MessageDeltaEvent) => {
        console.log("Message Delta", messageDelta);
    }

    const handleSSEEvent = (SSEEvent: string) => {
        const lines = SSEEvent.split('\n');
        let eventType = '';
        let eventData = '';
        for (const line of lines) {
            if (line.startsWith("data: ")) {
                const data = line.trim().slice(5); // Need to slice the first 5 characters to remove the "data: " prefix
                eventData = JSON.parse(data);
                console.log("This is the data:", eventData);

            }
            if (line.startsWith("event: ")) {
                eventType = line.trim().slice(6); // Need to slice the first 6 characters to remove the "event: " prefix
                console.log("This is the event", eventType);
            }
        }

        if (eventType && eventData) {
            handleEventTypeAndData(eventType, eventData);
        }
    }

    const { mutate } = useMutation({
        mutationFn: async (message: Message) => {
            console.log("Sending message", message);
            const response = await fetch("http://localhost:3000/api/chat/sse", {
                method: "POST",
                headers: {
                    "Content-Type": "text/event-stream",
                },
                body: JSON.stringify(message),
            });
            if (!response.ok) {
                throw new Error("Response is not ok");
            }
            if (!response.body) {
                throw new Error("Response is null");
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    console.log("Stream closed");
                    break;
                };
                console.log("Received", decoder.decode(value));
                handleSSEEvent(decoder.decode(value));
            }
        },
    });

    return (
        <Card className="col-span-4 h-screen flex flex-col p-4 border-0">
            <CardContent id="card-content" className="flex-grow flex flex-col bg-gray-100 rounded-lg">
                <Messages messages={messages} />
                <InputMessage messages={messages} setMessages={setMessages} mutate={mutate} />
            </CardContent>
        </Card>
    )
}

