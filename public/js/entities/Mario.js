import Entity from "../entity.js";
import Jump from '../traits/Jump.js';
import Go from '../traits/Go.js';
import { loadSpriteSheet } from '../loaders/sprite.js';
import Stomper from "../traits/Stomper.js";
import Killable from "../traits/Killable.js";
import Solid from "../traits/Solid.js";
import Physics from "../traits/Physics.js";
import { loadAudioBoard } from "../loaders/audio.js";


const SLOW_DRAG = 1/1000;
const FAST_DRAG = 1/5000;

export const loadMario = (audioContext) => {
    return Promise.all([
        loadSpriteSheet('mario'),
        loadAudioBoard('mario', audioContext)
    ])
    .then(([sprite, audio]) => {
        return createMarioFactory(sprite, audio);
    })
}; 

const createMarioFactory = (sprite, audio) => {
    const runAnim = sprite.animations.get('run');

    const routeFrame = (mario) => {
        if(mario.jump.falling) {
            return 'jump';
        }
        if(mario.go.distance > 0) {
            if ((mario.vel.x > 0 && mario.go.dir < 0) || (mario.vel.x < 0 && mario.go.dir > 0)) {
                return 'break';
            }
                return runAnim(mario.go.distance);
            };
            return 'idle';
        };

        function setTurboState(turboOn){
            this.go.dragFactor = turboOn ? FAST_DRAG : SLOW_DRAG;
        };

        function drawMario(context){
            sprite.draw(routeFrame(this), context, 0, 0, this.go.heading < 0);
        };

        return function createMario() {
            const mario = new Entity();
            mario.audio = audio;
            mario.size.set(14,16);

            mario.addTrait(new Physics());
            mario.addTrait(new Solid());
            mario.addTrait(new Go());
            mario.addTrait(new Jump());
            mario.addTrait(new Stomper());
            mario.addTrait(new Killable());

            mario.killable.removeAfter = 0;

            mario.turbo = setTurboState;
            mario.draw = drawMario;

            mario.turbo(false);

            return mario;
        }
}
