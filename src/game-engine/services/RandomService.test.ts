import { describe, it, expect } from "vitest";
import { RandomService } from "./RandomService";

describe("RandomService", () => {
  it("should be deterministic for the same seed", () => {
    const service1 = new RandomService(12345);
    const service2 = new RandomService(12345);

    const rolls1 = Array.from({ length: 5 }, () => service1.rollDie());
    const rolls2 = Array.from({ length: 5 }, () => service2.rollDie());

    expect(rolls1).toEqual(rolls2);
    expect(service1.getSeed()).toEqual(service2.getSeed());
  });

  it("should return different rolls for different seeds", () => {
    const service1 = new RandomService(12345);
    const service2 = new RandomService(54321);

    const rolls1 = Array.from({ length: 10 }, () => service1.rollDie());
    const rolls2 = Array.from({ length: 10 }, () => service2.rollDie());

    expect(rolls1).not.toEqual(rolls2);
  });

  it("should produce die rolls between 1 and 6 inclusive", () => {
    const service = new RandomService(42);
    for (let i = 0; i < 100; i++) {
      const roll = service.rollDie();
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(6);
    }
  });
});
