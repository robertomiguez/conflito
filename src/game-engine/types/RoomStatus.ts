export const RoomStatus = {
  Waiting: "waiting",
  InProgress: "in_progress",
  Finished: "finished",
} as const;

export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];
