import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Message, MessageWithFileUpload } from ".";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { UploadFile, UserFileUpload } from "../upload-file";
import { useState } from "react";
import { X } from "lucide-react";

type UserInputMessage = {
    content: string,
};

type InputMessageProps = {
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    mutation: UseMutationResult<void, Error, MessageWithFileUpload, unknown>;
};



export const InputMessage = ({ setMessages, mutation }: InputMessageProps) => {
    const { control, handleSubmit, reset } = useForm<UserInputMessage>();
    const [file, setFile] = useState<File | null>(null);
    const [showDelete, setShowDelete] = useState(false);
    const [uploadFileURL, setUploadFileURL] = useState<string | null>(null);

    const [preview, setPreview] = useState<string | null>(null);

    const uploadMutation = useMutation({
        mutationFn: async (uploadedData: UserFileUpload) => {
            try {
                const formData = new FormData();
                formData.append("userFile", uploadedData.file);

                const response = await fetch('http://localhost:3000/api/chat/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error('Failed to upload file');
                }
                const data = await response.json();
                console.log("Data from server: ", data);
                console.log("Upload file URL: ", data.fileURL);
                setUploadFileURL(data.fileURL); // TODO: Add type safety here
            } catch (error) {
                console.error("Error uploading file: ", error);
            }
        }
    });

    const onSubmit: SubmitHandler<UserInputMessage> = (data) => {
        console.log(data);
        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: [{ type: "text", text: { value: data.content } }],
            },
        ])

        console.log("Upload file URL: ", uploadFileURL);

        mutation.mutate({
            uploadFileURL: uploadFileURL,
            message: {
                content: [{ type: "text", text: { value: data.content } }],
                role: "user"
            }
        });
    }

    const handleDeleteFile = () => {
        console.log("Deleting file");
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
                <UploadFile setPreview={setPreview} file={file} setFile={setFile} uploadMutation={uploadMutation} />
                <Button type="submit" onClick={handleSubmit(onSubmit)}>
                    Send Message
                </Button>
            </div>
        </div >
    )
}