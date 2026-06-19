import { Application, Graphics, Text, TextStyle } from "pixi.js";
import type { GameState } from "../../game-engine/domain/GameState";
import type { GameMap } from "../../game-engine/maps/GameMap";
import { TerritoryPathService } from "../../game-engine/services/TerritoryPathService";
import { TerritoryColorService } from "./TerritoryColorService";
import { WORLD_MAP_DEFINITION } from "../../constants/mapDefinition";

export class PixiMapRenderer {
  app: Application;
  game: GameState;
  map: GameMap;
  selectedTerritoryId: string | null;
  onTerritoryClick: (territoryId: string) => void;

  constructor(
    app: Application,
    game: GameState,
    map: GameMap,
    selectedTerritoryId: string | null,
    onTerritoryClick: (territoryId: string) => void,
  ) {
    this.app = app;
    this.game = game;
    this.map = map;
    this.selectedTerritoryId = selectedTerritoryId;
    this.onTerritoryClick = onTerritoryClick;
  }

  draw() {
    // Clear all children first to support redraws
    this.app.stage.removeChildren();

    // 1. Draw connection lines between neighbors
    const connectionGraphics = new Graphics();
    connectionGraphics.stroke({ width: 2, color: 0x334155, alpha: 0.4 }); // Sleek slate connection lines

    for (const territoryDef of this.map.territories) {
      const logicalDef = WORLD_MAP_DEFINITION.territories.find(
        (t) => t.id === territoryDef.id,
      );
      if (!logicalDef) continue;

      const fromX = territoryDef.x + territoryDef.width / 2;
      const fromY = territoryDef.y + territoryDef.height / 2;

      for (const neighborId of logicalDef.neighbors) {
        const neighborDef = this.map.territories.find(
          (t) => t.id === neighborId,
        );
        if (!neighborDef) continue;

        // Draw line once (lexicographical order)
        if (territoryDef.id < neighborId) {
          const toX = neighborDef.x + neighborDef.width / 2;
          const toY = neighborDef.y + neighborDef.height / 2;
          connectionGraphics.moveTo(fromX, fromY);
          connectionGraphics.lineTo(toX, toY);
        }
      }
    }
    this.app.stage.addChild(connectionGraphics);

    // 2. Setup text styles
    const labelStyle = new TextStyle({
      fontFamily: "Outfit, Inter, Arial, sans-serif",
      fontSize: 11,
      fill: 0xf1f5f9,
      align: "center",
    });

    const troopsStyle = new TextStyle({
      fontFamily: "Outfit, Inter, Arial, sans-serif",
      fontSize: 16,
      fill: 0xffffff,
      fontWeight: "bold",
      align: "center",
    });

    // 3. Draw territories
    for (const territoryDef of this.map.territories) {
      const territoryState = this.game.territories[territoryDef.id];
      if (!territoryState) continue;

      const ownerId = territoryState.ownerId ?? "";
      const isSelected = territoryDef.id === this.selectedTerritoryId;
      const selectedTerritory = this.selectedTerritoryId
        ? this.game.territories[this.selectedTerritoryId]
        : null;

      // Determine border outline styling
      let strokeColor = 0x475569; // default slate border
      let strokeWidth = 2;

      if (isSelected) {
        strokeColor = 0xf59e0b; // Amber highlight for selected source
        strokeWidth = 4;
      } else if (selectedTerritory) {
        const isNeighbor = selectedTerritory.neighbors.includes(
          territoryDef.id,
        );
        const isFortifyDestination =
          this.game.phase === "fortify" &&
          !this.game.hasFortified &&
          territoryState.ownerId === this.game.currentPlayerId &&
          TerritoryPathService.getReachableOwnedTerritories(
            this.game,
            this.game.currentPlayerId,
            this.selectedTerritoryId!,
          ).includes(territoryDef.id);

        if (isNeighbor) {
          if (
            this.game.phase === "attack" &&
            territoryState.ownerId !== this.game.currentPlayerId
          ) {
            strokeColor = 0xef4444;
            strokeWidth = 3;
          } else if (isFortifyDestination) {
            strokeColor = 0x10b981;
            strokeWidth = 3;
          }
        } else if (isFortifyDestination) {
          strokeColor = 0x10b981;
          strokeWidth = 3;
        }
      }

      const cardGraphics = new Graphics();
      cardGraphics.eventMode = "static";
      cardGraphics.cursor = "pointer";

      // Rounded rectangle for cards
      cardGraphics
        .roundRect(
          territoryDef.x,
          territoryDef.y,
          territoryDef.width,
          territoryDef.height,
          8,
        )
        .fill({
          color: TerritoryColorService.getColor(ownerId, this.game.players),
          alpha: isSelected ? 0.95 : 0.85,
        })
        .stroke({
          width: strokeWidth,
          color: strokeColor,
        });

      cardGraphics.on("pointertap", () => {
        this.onTerritoryClick(territoryDef.id);
      });

      this.app.stage.addChild(cardGraphics);

      // Add Name Text Label
      const displayName =
        WORLD_MAP_DEFINITION.territories.find((t) => t.id === territoryDef.id)
          ?.name || territoryDef.id;

      const nameText = new Text({
        text: displayName,
        style: labelStyle,
      });
      nameText.anchor.set(0.5);
      nameText.x = territoryDef.x + territoryDef.width / 2;
      nameText.y = territoryDef.y + territoryDef.height / 3;
      this.app.stage.addChild(nameText);

      // Add Troops Count Text
      const troopsText = new Text({
        text: territoryState.troops.toString(),
        style: troopsStyle,
      });
      troopsText.anchor.set(0.5);
      troopsText.x = territoryDef.x + territoryDef.width / 2;
      troopsText.y = territoryDef.y + (territoryDef.height * 2) / 3;
      this.app.stage.addChild(troopsText);
    }
  }
}
