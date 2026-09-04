import { RealtimeEvent } from "../../domain/models/RealtimeEvent";
import { RealtimeRepository } from "./RealtimeRepository";

export class MockRealtimeRepository
  implements RealtimeRepository
{
  private interval: ReturnType<typeof setInterval> | null =
    null;

  subscribe(
    callback: (event: RealtimeEvent) => void
  ): () => void {
    this.interval = setInterval(() => {
      const event = this.generateEvent();

      callback(event);
    }, 3000);

    return () => {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    };
  }

  private generateEvent(): RealtimeEvent {
    const eventTypes = [
      "camera_status",
      "vehicle_detection",
      "traffic_update",
    ] as const;

    const type =
      eventTypes[
        Math.floor(Math.random() * eventTypes.length)
      ];

    const cameraIds = [
      "CAM_001",
      "CAM_002",
      "CAM_003",
      "CAM_004",
    ];

    const cameraId =
      cameraIds[
        Math.floor(Math.random() * cameraIds.length)
      ];

    if (type === "camera_status") {
      return {
        id: `EVENT_${Date.now()}`,
        type,
        timestamp: new Date().toISOString(),
        data: {
          cameraId,
          status:
            Math.random() > 0.15
              ? "online"
              : "offline",
        },
      };
    }

    if (type === "vehicle_detection") {
      const vehicleTypes = [
        "car",
        "motorcycle",
        "bus",
        "truck",
        "van",
        "taxi",
      ] as const;

      const vehicleType =
        vehicleTypes[
          Math.floor(
            Math.random() * vehicleTypes.length
          )
        ];

      return {
        id: `EVENT_${Date.now()}`,
        type,
        timestamp: new Date().toISOString(),
        data: {
          cameraId,
          vehicleId: `VEH_${Date.now()}`,
          plateNumber: "WB12AB1234",
          vehicleType,
        },
      };
    }

    const congestionLevels = [
      "low",
      "moderate",
      "high",
      "critical",
    ] as const;

    const congestionLevel =
      congestionLevels[
        Math.floor(
          Math.random() * congestionLevels.length
        )
      ];

    return {
      id: `EVENT_${Date.now()}`,
      type,
      timestamp: new Date().toISOString(),
      data: {
        cameraId,
        vehicleCount:
          Math.floor(Math.random() * 30) + 5,
        congestionLevel,
      },
    };
  }
}