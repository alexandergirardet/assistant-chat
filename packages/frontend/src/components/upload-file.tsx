import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

export type UserFileUpload = {
    file: File;
};

interface UploadFileProps {
    setPreview: (preview: string | null) => void;
    file: File | null;
    setFile: (file: File | null) => void;
    uploadMutation: UseMutationResult<void, Error, UserFileUpload, unknown>;
}

export const UploadFile = ({ setPreview, file, setFile, uploadMutation }: UploadFileProps) => {
    const { control, handleSubmit, reset } = useForm<UserFileUpload>();
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

        const formData = new FormData();
        formData.append("userFile", data.file);

        uploadMutation.mutate(data);
        reset();
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
                        <Button type="submit">
                            Upload
                        </Button>
                    </div>
                )}
            />
        </form>
    );
};