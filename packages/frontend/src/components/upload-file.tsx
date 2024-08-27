import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type UserFileUpload = {
    file: File;
};

interface UploadFileProps {
    setPreview: (preview: string | null) => void;
    preview: string | null;
    file: File | null;
    setFile: (file: File | null) => void;
}

export const UploadFile = ({ setPreview, preview, file, setFile }: UploadFileProps) => {
    const { control, handleSubmit, reset } = useForm<UserFileUpload>();
    const [uploading, setUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [file]);

    const onSubmit: SubmitHandler<UserFileUpload> = async (data) => {
        console.log("Submitting form ", data.file);
        setUploading(true);

        const formData = new FormData();
        formData.append("userFile", data.file);

        try {
            const response = await fetch('http://localhost:3000/api/chat/upload', {
                method: 'POST',
                body: formData,
            });

            console.log("Response from server: ", response);
            const responseData = await response.json();
            console.log("Data from server: ", responseData);
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setUploading(false);
            reset();
        }
    };

    const handlePaperclipClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="file"
                control={control}
                render={({ field: { onChange, value } }) => (
                    <div>
                        <input
                            id="file"
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                onChange(file);
                                setFile(file);
                                console.log("File selected:", file);
                            }}
                            ref={fileInputRef}
                            className="hidden"
                        />
                        <Button type="button" onClick={handlePaperclipClick}>
                            <Paperclip className="w-6 h-6" />
                        </Button>
                    </div>
                )}
            />
        </form>
    );
};