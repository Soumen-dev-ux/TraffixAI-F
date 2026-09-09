import { RealtimeEvent } from "../../domain/models/RealtimeEvent";
import { RealtimeRepository } from "./RealtimeRepository";

const DEFAULT_WS_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000')
  .replace(/^http/, 'ws')
  .replace(/\/$/, '') + '/api/v1/ws/traffic';

export class WebSocketRealtimeRepository implements RealtimeRepository {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private isWsActive = false;
  private reconnectTimer: any = null;

  constructor(wsUrl: string = DEFAULT_WS_URL) {
    this.wsUrl = wsUrl;
  }

  subscribe(callback: (event: RealtimeEvent) => void): () => void {
    let isSubscribed = true;

    const connectWs = () => {
      if (!isSubscribed) return;

      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this.isWsActive = true;
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (
              data.type === 'vehicle_detection' ||
              data.type === 'traffic_update' ||
              data.type === 'camera_status' ||
              data.type === 'camera_added' ||
              data.type === 'camera_updated' ||
              data.type === 'camera_deleted' ||
              data.type === 'cameras_reset'
            ) {
              callback({
                id: data.id || `WS_EVT_${Date.now()}`,
                type: data.type,
                timestamp: data.timestamp || new Date().toISOString(),
                data: data.data || data,
              });
            }
          } catch (e) {
            // Ignore non-json ping/ack messages
          }
        };

        this.ws.onerror = () => {
          this.isWsActive = false;
        };

        this.ws.onclose = () => {
          this.isWsActive = false;
          // Reconnect cleanly with zero fake demo fallbacks
          if (isSubscribed && !this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => {
              this.reconnectTimer = null;
              connectWs();
            }, 3000);
          }
        };
      } catch (err) {
        this.isWsActive = false;
        if (isSubscribed && !this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            connectWs();
          }, 3000);
        }
      }
    };

    connectWs();

    return () => {
      isSubscribed = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      if (this.ws) {
        try {
          this.ws.close();
        } catch {}
        this.ws = null;
      }
    };
  }
}
