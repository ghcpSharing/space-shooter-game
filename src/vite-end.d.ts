/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

// SVG module declarations
declare module '*.svg' {
  const content: string
  export default content
}