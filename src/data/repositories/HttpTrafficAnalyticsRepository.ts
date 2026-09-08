import { TrafficAnalytics } from "@/src/domain/models/TrafficAnalytics";
import { TrafficAnalyticsRepository } from "./TrafficAnalyticsRepository";
import { TrafficAnalyticsApi } from "../api/TrafficAnalyticsApi";

export class HttpTrafficAnalyticsRepository implements TrafficAnalyticsRepository {
  async getAnalytics(): Promise<TrafficAnalytics> {
    return TrafficAnalyticsApi.getAnalytics();
  }
}
