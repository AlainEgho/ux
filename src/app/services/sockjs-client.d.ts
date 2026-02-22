declare module 'sockjs-client' {
  const SockJS: new (url: string, _reserved?: unknown, options?: Record<string, unknown>) => WebSocket;
  export default SockJS;
}
