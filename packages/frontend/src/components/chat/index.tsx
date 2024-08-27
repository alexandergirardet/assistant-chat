import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => { // Scroll to bottom when messages 
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]); // Scroll to bottom when messages are updated

    const handleEventTypeAndData = (eventType: string, eventData: any) => {
        if (eventType.trim() === "thread.message.delta") {
            console.log("Message Delta Event:", eventData, "Handling message delta");
            handleMessageDelta(eventData);
        }
        if (eventType.trim() === "thread.message.created") {
            console.log("Message created event has been triggered")
            handleMessageCreated(eventData);
        }
    }

    const handleMessageCreated = (messageStart: unknown) => {
        console.log("Message Created Event:", messageStart, "Creating new bot message");
        setMessages((prev) => [...prev, {
            role: "bot",
            content: [{ type: "text", text: { value: "" } }],
        }])
    }

    const handleMessageDelta = (messageDelta: MessageDeltaEvent) => {
        console.log("Message Delta in the message delta function", messageDelta);
        setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = { ...newMessages[newMessages.length - 1] };
            console.log("Last Message in the message delta function", lastMessage);

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
            console.log("Last Message After Update in the message delta function", lastMessage);
            newMessages[newMessages.length - 1] = lastMessage;
            return newMessages;
        });
    }

    /**
     * We are parsing the SSE buffer to get the event type and data. Lines can be event type, event data or empty. 
    * Lines can contain several events, so we keep track of event type and event data and handle them when both are set.
    * When we handle an event, we reset the event type and event data.
    */

    const handleSSEBuffer = (lines: string[]) => {
        let eventType = '';
        let eventData = '';
        for (const line of lines) {
            if (line.startsWith("data: ")) {
                const data = line.trim().slice(5);
                eventData = JSON.parse(data);

            }
            if (line.startsWith("event: ")) {
                eventType = line.trim().slice(6);
            }
            if (eventType && eventData) {
                handleEventTypeAndData(eventType, eventData);
                eventType = '';
                eventData = '';
            }
        }

    }

    const mutation = useMutation({
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
            let buffer = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    console.log("Stream closed");
                    break;
                };
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                handleSSEBuffer(lines);
            }
        },
    });

    return (
        <Card className="col-span-4 h-screen flex flex-col p-4 border-0">
            <CardContent id="card-content" className="flex-grow flex flex-col bg-gray-100 rounded-lg">
                <Messages messages={messages} messagesEndRef={messagesEndRef} />
                <InputMessage setMessages={setMessages} mutation={mutation} />
            </CardContent>
        </Card>
    )
}

