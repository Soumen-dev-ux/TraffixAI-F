import { TrafficAnalytics } from "../models/TrafficAnalytics";
import { TrafficAnalyticsRepository } from "@/src/data/repositories/TrafficAnalyticsRepository";

export class GetTrafficAnalytics {
  constructor(
    private repository: TrafficAnalyticsRepository
  ) {}

  async execute(): Promise<TrafficAnalytics> {
    return this.repository.getAnalytics();
  }
}

