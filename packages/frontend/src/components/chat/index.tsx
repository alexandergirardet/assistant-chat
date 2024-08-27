import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { Messages } from "./messages"
import { InputMessage } from "./input-message"
import { useMutation } from "@tanstack/react-query";
import { MessageDeltaEvent } from "openai/resources/beta/threads/messages";

interface TextContent {
    type: string;
    text: {
        value: string;
    };
}

export interface Message {
    role: "user" | "bot";
    content: TextContent[];
}

export const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "user",
            content: [{ type: "text", text: { value: "Hello, how are you?" } }],
        },
        {
            role: "bot",
            content: [{ type: "text", text: { value: "I am fine, thank you!" } }],
        },
    ]);
    console.log("Messages", messages);

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
        setMessages((prev) => [...prev, {
            role: "bot",
            content: [{ type: "text", text: { value: "" } }],
        }])
    }

    const handleMessageDelta = (messageDelta: MessageDeltaEvent) => {
        console.log("Message Delta", messageDelta);
        setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = { ...newMessages[newMessages.length - 1] };
            console.log("Last Message", lastMessage);

            lastMessage.content = [
                {
                    ...lastMessage.content[0],
                    text: {
                        ...lastMessage.content[0].text,
                        value:
                            lastMessage.content[0].text.value +
                            messageDelta.delta.content?.[0].text.value, // Todo: Fix this, it's an issue with the MessageDeltaEvent type
                    },
                },
            ];
            console.log("Last Message After Update", lastMessage);
            newMessages[newMessages.length - 1] = lastMessage;
            return newMessages;
            // return newMessages;
        });
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
                body: JSON.stringify({ message: message.content[0].text.value }),
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
                <InputMessage setMessages={setMessages} mutate={mutate} />
            </CardContent>
        </Card>
    )
}

