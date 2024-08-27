import { Message } from './index'
import { MemoizedReactMarkdown } from "@/components/markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface MessagesProps {
    messages: Message[];
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const Messages = ({ messages, messagesEndRef }: MessagesProps) => {
    const escapeBackticks = (str: string) => {
        return str.replace(/`/g, "\\`");
    };
    return (
        <div className="flex-grow">
            {messages.map((message: Message, index: number) => {
                return (
                    <div key={index} className={`mb-2 ${message.role === "user" ? "text-right" : "text-left"}`}>
                        <span
                            className={`inline-block rounded-lg p-2 ${message.role === "user"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-800"
                                }`}
                        >
                            {message.content[0].type === "text" ? (
                                <MemoizedReactMarkdown
                                    className="dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 prose break-words"
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    components={{
                                        p({ children }) {
                                            return <p className="mb-2 last:mb-0">{children}</p>;
                                        },
                                        code({ node, className, children, ...props }) {
                                            return <code className={className} {...props}>{children}</code>;
                                        },
                                    }}
                                >
                                    {escapeBackticks(message.content[0]?.text?.value)}
                                </MemoizedReactMarkdown>
                            ) : null}
                        </span>
                        <div ref={messagesEndRef} />
                    </div>
                )
            }
            )
            }
        </div >
    )
}