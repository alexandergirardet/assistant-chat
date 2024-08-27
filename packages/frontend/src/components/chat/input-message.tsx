import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Message } from ".";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { UseMutationResult } from "@tanstack/react-query";
import { UploadFile } from "../upload-file";
import { useState } from "react";
import { X } from "lucide-react";
type UserInputMessage = {
    content: string,
};

type InputMessageProps = {
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    mutation: UseMutationResult<void, Error, Message, unknown>;
};



export const InputMessage = ({ setMessages, mutation }: InputMessageProps) => {
    const { control, handleSubmit, reset } = useForm<UserInputMessage>();
    const [file, setFile] = useState<File | null>(null);
    const [showDelete, setShowDelete] = useState(false);

    const [preview, setPreview] = useState<string | null>(null);

    const onSubmit: SubmitHandler<UserInputMessage> = (data) => {
        console.log(data);
        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: [{ type: "text", text: { value: data.content } }],
            },
        ]);

        reset();
        mutation.mutate({
            content: [{ type: "text", text: { value: data.content } }],
            role: "user"
        });
    };

    const handleDeleteFile = () => {
        console.log("Deleting file");
        // console.log(file, preview, showDelete, uploading);
        console.log("preview", preview);
        setFile(null);
        setPreview('');
        reset();
    };
    return (
        <div className="bg-white rounded-lg p-2">
            {preview && (
                <div
                    className="mt-2 relative inline-block"
                    onMouseEnter={() => setShowDelete(true)}
                    onMouseLeave={() => setShowDelete(false)}
                >
                    <img
                        src={preview}
                        alt="preview"
                        className="max-w-xs max-h-24 object-contain rounded-md"
                    />
                    {showDelete && (
                        <Button
                            type="button"
                            onClick={handleDeleteFile}
                            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full"
                        >
                            <X className="w-4 h-4 text-white" />
                        </Button>
                    )}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="content"
                    control={control}
                    defaultValue=""
                    render={({ field }) => {
                        return (<div>
                            <Textarea
                                placeholder="Type your message here..."
                                className="min-h-12 border-0 resize-none focus-visible:ring-0"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(onSubmit)();
                                    }
                                }}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        </div>
                        )
                    }}
                />
            </form >
            <div className="flex justify-between">
                <UploadFile setPreview={setPreview} preview={preview} file={file} setFile={setFile} />
                <Button type="submit" onClick={handleSubmit(onSubmit)}>
                    Send Message
                </Button>
            </div>
        </div >
    )
}