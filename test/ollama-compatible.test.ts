import { describe, it, expect } from "vitest";
import {
  ToolMessage,
  HumanMessage,
  AIMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import {
  ChatOllamaCompatible,
  coerceToolMessageContent,
} from "../src/agent/ollama.js";

describe("coerceToolMessageContent", () => {
  it("coerces Uint8Array tool content to a string", () => {
    const bytes = new TextEncoder().encode("hello-bytes");
    const msg = new ToolMessage({
      content: bytes as unknown as string,
      tool_call_id: "call-1",
    });
    const [coerced] = coerceToolMessageContent([msg]);

    expect(coerced).toBeInstanceOf(ToolMessage);
    expect(typeof coerced.content).toBe("string");
    expect(coerced.content).toBe("hello-bytes");
    expect((coerced as ToolMessage).tool_call_id).toBe("call-1");
  });

  it("coerces content-block array to concatenated text", () => {
    const msg = new ToolMessage({
      content: [
        { type: "text", text: "part-a" },
        { type: "text", text: "part-b" },
      ] as unknown as string,
      tool_call_id: "call-2",
    });
    const [coerced] = coerceToolMessageContent([msg]);

    expect(typeof coerced.content).toBe("string");
    expect(coerced.content).toBe("part-apart-b");
  });

  it("coerces object content to JSON string", () => {
    const msg = new ToolMessage({
      content: { error: "boom", code: 42 } as unknown as string,
      tool_call_id: "call-3",
    });
    const [coerced] = coerceToolMessageContent([msg]);

    expect(typeof coerced.content).toBe("string");
    expect(JSON.parse(coerced.content as string)).toEqual({
      error: "boom",
      code: 42,
    });
  });

  it("leaves string tool content untouched", () => {
    const msg = new ToolMessage({
      content: "already-string",
      tool_call_id: "call-4",
    });
    const [coerced] = coerceToolMessageContent([msg]);

    expect(coerced).toBe(msg);
    expect(coerced.content).toBe("already-string");
  });

  it("passes through non-tool messages unchanged", () => {
    const messages: BaseMessage[] = [
      new HumanMessage("hi"),
      new AIMessage("hello"),
    ];
    const coerced = coerceToolMessageContent(messages);

    expect(coerced[0]).toBe(messages[0]);
    expect(coerced[1]).toBe(messages[1]);
  });

  it("preserves tool_call_id and name", () => {
    const bytes = new TextEncoder().encode("x");
    const msg = new ToolMessage({
      content: bytes as unknown as string,
      tool_call_id: "call-5",
      name: "read_file",
    });
    const [coerced] = coerceToolMessageContent([msg]);

    expect((coerced as ToolMessage).tool_call_id).toBe("call-5");
    expect(coerced.name).toBe("read_file");
  });
});

describe("ChatOllamaCompatible", () => {
  it("is a ChatOllama subclass", () => {
    const model = new ChatOllamaCompatible({ model: "llama3.2" });
    expect(model).toBeInstanceOf(ChatOllamaCompatible);
    expect(model._llmType()).toBe("ollama");
  });
});
