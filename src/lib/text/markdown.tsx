import React from "react"
import ReactMarkdown from "react-markdown"

export function Markdown({ children }: { children: string }) {
  return <ReactMarkdown>{children}</ReactMarkdown>
}
