import { RealtimeEvent } from "@/src/domain/models/RealtimeEvent";

export interface RealtimeRepository {
  subscribe(
    callback: (event: RealtimeEvent) => void
  ) : ()=> void
}