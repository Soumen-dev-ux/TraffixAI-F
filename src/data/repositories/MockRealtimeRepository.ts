import { RealtimeEvent } from "../../domain/models/RealtimeEvent";
import { RealtimeRepository } from "./RealtimeRepository";

export class MockRealtimeRepository implements RealtimeRepository {
  subscribe(callback: (event: RealtimeEvent) => void): () => void {
    // Zero demo data: no interval, no fake vehicle spam
    return () => {};
  }
}