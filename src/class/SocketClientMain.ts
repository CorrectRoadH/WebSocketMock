import { WebSocket } from 'ws';

export default interface SocketClientMain {
  id: string;
  ws: WebSocket;
}
