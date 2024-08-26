import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Message } from ".";
import { Textarea } from "../ui/textarea";
import { Paperclip } from "lucide-react";
import { Button } from "../ui/button";
type UserInputMessage = {
    content: string,
};

type InputMessageProps = {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
};



export const InputMessage = ({ messages, setMessages }: InputMessageProps) => {
    const { control, handleSubmit, reset } = useForm<UserInputMessage>();
    const onSubmit: SubmitHandler<UserInputMessage> = (data) => {
        console.log(data);
        setMessages([...messages, {
            id: (messages.length + 1).toString(),
            content: data.content,
            sender: "user",
        }]);
        reset();
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white rounded-lg">
                <Controller
                    name="content"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <Textarea
                            placeholder="Type your message here..."
                            className="min-h-12 border-0 resize-none focus-visible:ring-0"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(onSubmit)();
                                }
                            }}
                            {...field}
                        />
                    )}
                />
                <div className="flex justify-between">
                    <Paperclip className="size-5" />
                    <Button type="submit">Send Message</Button>
                </div>
            </div>
        </form>
    )
}