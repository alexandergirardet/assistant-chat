import { SSEStreamingApi } from "hono/streaming";
import OpenAI from "openai";
import { AssistantStreamEvent } from "openai/resources/beta/assistants";

const EventEmitter = require('node:events');

export class AssistantEventHandler extends EventEmitter {

    private client: OpenAI
    private stream: SSEStreamingApi
    public isProcessing: boolean

    constructor(stream: SSEStreamingApi, client: OpenAI) {
        super();
        this.stream = stream;
        this.client = client;
        this.isProcessing = true;
    }

    async onEvent(event: AssistantStreamEvent) {
        console.log("Is the client stream closed?", this.stream.closed);
        try {
            if (event.event === "thread.message.delta") {
                await this.stream.writeSSE({
                    event: event.event,
                    data: JSON.stringify(event.data)
                });
            }
            if (event.event === "thread.run.completed") {
                await this.stream.writeSSE({
                    event: event.event,
                    data: JSON.stringify(event.data)
                });
                console.log("Thread run completed", event.data);
                this.isProcessing = false;
            }
            if (event.event === "thread.message.created") {
                console.log("Message created", event.data);
                await this.stream.writeSSE({
                    event: event.event,
                    data: JSON.stringify(event.data)
                });
            }
            if (event.event === "thread.message.completed") {
                console.log("Message completed", event.data);
            }
            if (event.event === "thread.run.requires_action") {
                console.log("Thread run requires action", event.data);
                await this.stream.writeSSE({
                    event: event.event,
                    data: JSON.stringify(event.data)
                });
                await this.handleRequiresAction(
                    event.data,
                    event.data.id,
                    event.data.thread_id,
                );
            }
            console.log("Event", event);
        } catch (error) {
            console.error("Error handling event:", error);
        }
    }

    async handleRequiresAction(data, runId, threadId) { // TODO: Add type handling
        try {
            const toolOutputs =
                data.required_action.submit_tool_outputs.tool_calls.map((toolCall) => {
                    if (toolCall.function.name === "post_image") {
                        console.log(`Posting image to instagram with arguments: ${toolCall.function.arguments}`);
                        return {
                            tool_call_id: toolCall.id,
                            output: "Image has been posted",
                        };
                    }
                });
            // Submit all the tool outputs at the same time
            await this.submitToolOutputs(toolOutputs, runId, threadId);
        } catch (error) {
            console.error("Error processing required action:", error);
        }
    }

    async submitToolOutputs(toolOutputs, runId, threadId) {
        try {
            // Use the submitToolOutputsStream helper
            const stream = this.client.beta.threads.runs.submitToolOutputsStream(
                threadId,
                runId,
                { tool_outputs: toolOutputs },
            );
            for await (const event of stream) {
                this.emit("event", event);
            }
        } catch (error) {
            console.error("Error submitting tool outputs:", error);
        }
    }
}