import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { streamSSE } from 'hono/streaming'
import { z } from "zod";
import { openai } from "../lib/ai";
import { AssistantStreamEvent } from "openai/resources/beta/assistants";

let id = 0;


function* generateFragments(sentence: string) {
    const words = sentence.split(' ');
    // let fragment = '';
    for (const word of words) {
        yield {
            event: "thread.message.delta",
            data: {
                "id": "msg_123",
                "object": "thread.message.delta",
                "delta": {
                    "content": [
                        {
                            "index": id++,
                            "type": "text",
                            "text": { "value": word, "annotations": [] }
                        }
                    ]
                }
            }

        }
    }
}

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

            const { message: receivedMessage } = body;
            console.log("Message parsed", receivedMessage);

            const thread = await openai.beta.threads.create();
            const message = await openai.beta.threads.messages.create(
                thread.id,
                {
                    role: "user",
                    content: receivedMessage
                }
            );

            console.log("Thread created", thread);
            console.log("Message created", message);

            const assistantStream = await openai.beta.threads.runs.create(
                thread.id,
                { assistant_id: "asst_2fJJOR7YAxqDeoSfmh1t9BtA", stream: true }
            );

            for await (const event of assistantStream) {
                if (event.event === "thread.message.delta") {
                    await stream.writeSSE({
                        event: event.event,
                        data: JSON.stringify(event.data)
                    });
                }
                if (event.event === "thread.run.completed") {
                    await stream.writeSSE({
                        event: event.event,
                        data: JSON.stringify(event.data)
                    });
                    console.log("Thread run completed", event.data);
                    await stream.close();
                }
                if (event.event === "thread.message.created") {
                    console.log("Message created", event.data);
                    await stream.writeSSE({
                        event: event.event,
                        data: JSON.stringify(event.data)
                    });
                }
            }
        });
    })