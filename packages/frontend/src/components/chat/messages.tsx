import { Message } from './index'

interface MessagesProps {
    messages: Message[];
}

export const Messages = ({ messages }: MessagesProps) => {
    return (
    <div className="flex-grow">
        {messages.map((message: Message) => {
            return (
            message.sender === "user" ? (
                <div key={message.id} className="w-full flex justify-end">
                    <p className="text-sm">{message.content}</p>
                </div>
            ) : (
                <div key={message.id} className="w-full flex justify-start">
                    <p className="text-sm">{message.content}</p>
                </div>
            )
        )}
        )
        }
    </div>
    )
}