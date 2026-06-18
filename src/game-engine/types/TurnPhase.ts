export const TurnPhase = {
  Reinforcement: "reinforcement",
  Attack: "attack",
  Fortify: "fortify",
} as const;

export type TurnPhase = (typeof TurnPhase)[keyof typeof TurnPhase];
// type is: "reinforcement" | "attack" | "fortify"
