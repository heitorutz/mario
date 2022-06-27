import { Trait, Sides } from "../entity.js";


export default class Physics extends Trait {
    constructor() {
        super('physics');
    }
    update(entity, gameContext, level) {

        const {deltaTime} = gameContext;
        entity.pos.x += entity.vel.x * deltaTime;
        level.TileCollider.checkX(entity, gameContext, level);
        
        entity.pos.y += entity.vel.y * deltaTime;
        level.TileCollider.checkY(entity, gameContext, level);

        entity.vel.y += level.gravity * deltaTime;
    }

};