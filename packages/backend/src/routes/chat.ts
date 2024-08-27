import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { streamSSE } from 'hono/streaming'
import { z } from "zod";
import { openai } from "../lib/ai";
import { AssistantEventHandler } from "../lib/assistant";

export const chatRoutes = new Hono()
    .post("/message",
        async (c) => {
            const body = await c.req.json()
            // console.log(id, content, sender);
            console.log("Received message", body);
            const { id, content } = body;
            return c.json({
                id: id + 1,
                content: "I am a bot and you sent me " + content,
                sender: "bot",
            });
        })
    .post('/sse', async (c) => {
        return streamSSE(c, async (stream) => {
            const body = await c.req.json()
            console.log("Received message", body);

            const { message: receivedMessage, uploadFileURL } = body; // Todo: Add type safety here
            console.log("Message parsed", receivedMessage);

            const thread = await openai.beta.threads.create(); // TODO: Need somewhere to persist the thread id
            console.log("Thread created", thread);
            let message;

            if (uploadFileURL) {
                console.log("This message contains a file upload", uploadFileURL);
                message = await openai.beta.threads.messages.create(
                    thread.id,
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "The user uploaded a file, stored at " + uploadFileURL },
                            { type: "text", text: receivedMessage }
                        ]
                    },
                );
            } else {
                message = await openai.beta.threads.messages.create(
                    thread.id,
                    {
                        role: "user",
                        content: receivedMessage
                    }
                );
            }

            console.log("Message created", message);

            const streamPromise = new Promise(async (resolve, reject) => {
                try {
                    const assistantEventHandler = new AssistantEventHandler(stream, openai);
                    assistantEventHandler.on("event", assistantEventHandler.onEvent.bind(assistantEventHandler));

                    const assistantStream = await openai.beta.threads.runs.stream(
                        thread.id,
                        { assistant_id: "asst_2fJJOR7YAxqDeoSfmh1t9BtA", stream: true },
                        assistantEventHandler
                    );

                    for await (const event of assistantStream) {
                        assistantEventHandler.emit("event", event);
                    }
                    // Wait for any ongoing processing to complete
                    // !NOTE: This is a result of one OAI stream ends for tools
                    //   - but it can open another one for the tool response
                    while (assistantEventHandler.isProcessing) {
                        await new Promise((resolve) =>
                            setTimeout(resolve, 100)
                        )
                    }

                    resolve(0)
                } catch (error) {
                    reject(error)
                }
            })
            await streamPromise;
        })
    }).post('/upload', async (c) => {
        console.log("Uploading file");
        const body = await c.req.parseBody()
        console.log("Form data", body);

        const file = body['userFile'] as File;
        if (!file) {
            return c.json({ error: 'No file uploaded' }, 400);
        }

        // Generate a unique filename
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `/Users/alexandergirardet/code/projects/assistant-chat-streaming/data/uploads/${fileName}`;

        // Write the file to local storage
        await Bun.write(filePath, file);

        // Generate a URL for the file
        const fileURL = `/Users/alexandergirardet/code/projects/assistant-chat-streaming/data/uploads/${fileName}`;

        return c.json({ fileURL: fileURL });
    })
