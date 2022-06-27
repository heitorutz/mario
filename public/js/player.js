import PlayerController from "./traits/PlayerController.js";
import Entity from "./entity.js";
import Player from "./traits/Player.js";


export const createPlayerEnv = (playerEntity) => {
    const playerEnv = new Entity();
    const playerControl = new PlayerController();
    playerControl.checkpoint.set(64,64)
    playerControl.setPlayer(playerEntity);
    playerEnv.addTrait(playerControl);
    return playerEnv;
}

export const createPlayer = (entity) => {
    entity.addTrait(new Player());
    return entity;
}

export function* findPlayers(level) {
    for (const entity of level.entities) {
        if (entity.player) {
            yield entity;
        }
    }
}