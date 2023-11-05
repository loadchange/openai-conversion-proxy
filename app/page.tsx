'use client';

import { useChat, type Message } from 'ai/react';
import {
  makeStyles,
  shorthands,
  useId,
  Input,
  Label,
} from "@fluentui/react-components";
import type { InputProps } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    // Stack the label above the field
    display: "flex",
    flexDirection: "column",
    // Use 2px gap below the label (per the design system)
    ...shorthands.gap("2px"),
    // Prevent the example from taking the full width of the page (optional)
    maxWidth: "400px",
  },
});

export default function Chat() {

  const inputId = useId("input");
  const styles = useStyles();

  const { messages, input, handleInputChange, handleSubmit, data } = useChat({
    experimental_onFunctionCall: async (chatMessages: Message[], functionCall: any) => {
      console.log({ chatMessages, functionCall })
    }
  });
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.length > 0
        ? messages.map(m => (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.content}
          </div>
        ))
        : null}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
