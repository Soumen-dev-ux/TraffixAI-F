import { RealtimeEvent } from "../models/RealtimeEvent";
import { RealtimeRepository } from "../../data/repositories/RealtimeRepository";

export class SubscribeToRealtimeUpdates {
  constructor(
    private repository: RealtimeRepository
  ) {}

  execute(
    callback: (event: RealtimeEvent) => void
  ): () => void {
    return this.repository.subscribe(callback);
  }
}