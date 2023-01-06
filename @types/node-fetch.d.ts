import type { RequestInfo, RequestInit, Response } from "node-fetch"

export type FetchFunc = (
  url: RequestInfo,
  init?: RequestInit
) => Promise<Response>
