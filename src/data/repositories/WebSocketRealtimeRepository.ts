import { RealtimeEvent } from "../../domain/models/RealtimeEvent";
import { RealtimeRepository } from "./RealtimeRepository";
import { MockRealtimeRepository } from "./MockRealtimeRepository";

const DEFAULT_WS_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000')
  .replace(/^http/, 'ws')
  .replace(/\/$/, '') + '/api/v1/ws/traffic';

export class WebSocketRealtimeRepository implements RealtimeRepository {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private mockFallback: MockRealtimeRepository;
  private mockUnsub: (() => void) | null = null;
  private isWsActive = false;

  constructor(wsUrl: string = DEFAULT_WS_URL) {
    this.wsUrl = wsUrl;
    this.mockFallback = new MockRealtimeRepository();
  }

  subscribe(callback: (event: RealtimeEvent) => void): () => void {
    let isSubscribed = true;

    const connectWs = () => {
      if (!isSubscribed) return;

      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this.isWsActive = true;
          // Disconnect mock fallback if it was active
          if (this.mockUnsub) {
            this.mockUnsub();
            this.mockUnsub = null;
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'vehicle_detection' || data.type === 'traffic_update' || data.type === 'camera_status') {
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
          // If WS fails, start fallback mock stream
          if (!this.isWsActive && !this.mockUnsub && isSubscribed) {
            this.mockUnsub = this.mockFallback.subscribe(callback);
          }
        };

        this.ws.onclose = () => {
          this.isWsActive = false;
          // Trigger fallback while reconnecting
          if (!this.mockUnsub && isSubscribed) {
            this.mockUnsub = this.mockFallback.subscribe(callback);
          }
          // Reconnect attempt after 5 seconds
          if (isSubscribed) {
            setTimeout(connectWs, 5000);
          }
        };
      } catch (err) {
        if (!this.mockUnsub && isSubscribed) {
          this.mockUnsub = this.mockFallback.subscribe(callback);
        }
      }
    };

    connectWs();

    return () => {
      isSubscribed = false;
      if (this.mockUnsub) {
        this.mockUnsub();
        this.mockUnsub = null;
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
