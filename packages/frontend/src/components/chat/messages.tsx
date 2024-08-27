import { Message } from './index'
import { MemoizedReactMarkdown } from "@/components/markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface MessagesProps {
    messages: Message[];
}

export const Messages = ({ messages }: MessagesProps) => {
    const escapeBackticks = (str: string) => {
        return str.replace(/`/g, "\\`");
    };
    return (
        <div className="flex-grow">
            {messages.map((message: Message) => {
                return (
                    message.role === "user" ? (
                        <div className="w-full flex justify-end">
                            <p className="text-sm">{message.content[0].text.value}</p>
                        </div>
                    ) : (
                        <div className="w-full flex justify-start">
                            <p className="text-sm">{message.content[0].text.value}</p>
                        </div>
                    )
                )
            }
            )
            }
        </div>
    )
}

// {msg.content[0].type === "text" ? (
//     <MemoizedReactMarkdown
//       className="dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 prose break-words"
//       remarkPlugins={[remarkGfm, remarkMath]}
//       components={{
//         p({ children }) {
//           return <p className="mb-2 last:mb-0">{children}</p>;
//         },
//         code({ node, inline, className, children, ...props }) {
//           // ... (code block component remains unchanged)
//         },
//       }}
//     >
//       {escapeBackticks(msg.content[0]?.text?.value)}
//     </MemoizedReactMarkdown>
//   ) : null}