import { Application, Graphics } from "pixi.js";

export class PixiMapRenderer {
  app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  drawDemoMap() {
    const north = new Graphics();

    north.rect(50, 50, 150, 100).fill(0x3498db);

    this.app.stage.addChild(north);

    const center = new Graphics();

    center.rect(250, 50, 150, 100).fill(0xe74c3c);

    this.app.stage.addChild(center);

    const south = new Graphics();

    south.rect(450, 50, 150, 100).fill(0x2ecc71);

    this.app.stage.addChild(south);
  }
}
