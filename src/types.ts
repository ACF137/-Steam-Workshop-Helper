export type MessageAction =
  | "PING"
  | "GET_PAGE_INFO"
  | "HIGHLIGHT_ELEMENTS"
  | "CONSOLE_LOG"
  | "CONSOLE_WARN"
  | "CONSOLE_ERROR"
  | "RUN_SCRIPT";

export interface ExtensionMessage {
  action: MessageAction;
  payload?: unknown;
}

export interface PageInfo {
  title:        string;
  url:          string;
  elementCount: number;
}

export interface HighlightPayload {
  selector: string;
  color?:   string;
}

export interface ConsolePayload {
  message: string;
}

export interface ScriptPayload {
  code: string;
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?:   T;
  error?:  string;
}