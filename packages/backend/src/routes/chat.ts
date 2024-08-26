import { Hono } from "hono";

export const chatRoutes = new Hono()
    .post("/message", (c) => {
        return c.text("Hello Hono!");
    });