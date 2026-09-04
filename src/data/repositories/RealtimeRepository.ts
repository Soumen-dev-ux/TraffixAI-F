import { RealtimeEvent } from "@/src/domain/models/RealTimeEvent";

export interface RealtimeRepository {
  subscribe(
    callback: (event: RealtimeEvent) => void
  ) : ()=> void
}