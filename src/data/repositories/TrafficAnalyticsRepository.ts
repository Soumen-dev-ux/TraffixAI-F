import { TrafficAnalytics } from "@/src/domain/models/TrafficAnalytics";

export interface TrafficAnalyticsRepository{
  getAnalytics(): Promise<TrafficAnalytics>;
}