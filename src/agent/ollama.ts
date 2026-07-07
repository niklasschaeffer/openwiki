import { ChatOllama } from "@langchain/ollama";
import { BaseMessage, ToolMessage } from "@langchain/core/messages";
import { ChatGenerationChunk } from "@langchain/core/outputs";
import { ChatModelStreamEvent } from "@langchain/core/language_models/event";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import type { ChatOllamaCallOptions } from "@langchain/ollama";

function contentToString(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (block === null || typeof block !== "object") {
          return String(block);
        }

        if (typeof block.text === "string") {
          return block.text;
        }

        return JSON.stringify(block);
      })
      .join("");
  }

  if (content === null || content === undefined) {
    return "";
  }

  if (typeof content === "object") {
    if (content instanceof Uint8Array) {
      return new TextDecoder().decode(content);
    }
    return JSON.stringify(content);
  }

  return String(content);
}

export function coerceToolMessageContent(
  messages: BaseMessage[],
): BaseMessage[] {
  return messages.map((message) => {
    if (message._getType() !== "tool" || typeof message.content === "string") {
      return message;
    }

    return new ToolMessage({
      content: contentToString(message.content),
      tool_call_id: (message as ToolMessage).tool_call_id,
      name: message.name,
      id: message.id,
      additional_kwargs: message.additional_kwargs,
      response_metadata: message.response_metadata,
    });
  });
}

export class ChatOllamaCompatible extends ChatOllama {
  async *_streamResponseChunks(
    messages: BaseMessage[],
    options: ChatOllamaCallOptions,
    runManager?: CallbackManagerForLLMRun,
  ): AsyncGenerator<ChatGenerationChunk> {
    yield* super._streamResponseChunks(
      coerceToolMessageContent(messages),
      options,
      runManager,
    );
  }

  async *_streamChatModelEvents(
    messages: BaseMessage[],
    options: ChatOllamaCallOptions,
    runManager?: CallbackManagerForLLMRun,
  ): AsyncGenerator<ChatModelStreamEvent> {
    yield* super._streamChatModelEvents(
      coerceToolMessageContent(messages),
      options,
      runManager,
    );
  }
}
