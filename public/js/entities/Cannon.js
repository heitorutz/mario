import Entity from "../entity.js";
import Emitter from '../traits/Emitter.js';
import { loadAudioBoard } from "../loaders/audio.js";
import { findPlayers } from "../player.js";

const HOLD_FIRE_THRESHOLD = 30;

export const loadCannon = (audioContext, entityFactories) => {
    return loadAudioBoard('cannon', audioContext)
    .then(audio => {
        return createCannonFactory(audio);
    })
}; 

const createCannonFactory = (audio) => {

    let dir = 1;

    const emitBullet = (cannon, gameContext, level) => {
        for (const player of findPlayers(level)) {
            if (player.pos.x > cannon.pos.x - HOLD_FIRE_THRESHOLD
                && player.pos.x < cannon.pos.x + HOLD_FIRE_THRESHOLD) {
                    return;
                }

            if (player.pos.x < cannon.pos.x) {
                dir = -1
            } else {
                dir = 1
            }
        }

        const bullet = gameContext.entityFactory.bullet();

        bullet.pos.copy(cannon.pos);
        bullet.vel.set(80 * dir, 0); 

        cannon.sounds.add('shoot');
        level.entities.add(bullet);
    }
  
    return function createCannon() {
        const cannon = new Entity();
        cannon.audio = audio;

        const emitter = new Emitter();
        emitter.interval = 4;
        emitter.emitters.push(emitBullet);

        cannon.addTrait(emitter);
        return cannon;
    }
}
