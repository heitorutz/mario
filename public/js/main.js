import {createLevelLoader} from './loaders/level.js';
import Timer from './timer.js';
import { setupKeyboard } from './input.js';
import { loadEntities } from './entities.js';
import { createCollisionLayer } from './layers/Collision.js';
import { loadFont } from './loaders/font.js';
import { createDashboardLayer } from './layers/Dashboard.js';
import { createColorLayer } from './layers/Color.js';
import { createPlayerEnv, createPlayer } from './player.js';
import SceneRunner from './SceneRunner.js';
import { createPlayerProgressLayer } from './layers/player-progress.js';
import CompositionScene from './CompositionScene.js';
import Level from './Level.js';

const main = async (canvas) => {
    const videoContext = canvas.getContext('2d');
    videoContext.imageSmoothingEnabled = false;
    const audioContext = new AudioContext();
    
    const [entityFactory, font] = await Promise.all([
        loadEntities(audioContext),
        loadFont()
    ]);

    const loadLevel = await createLevelLoader(entityFactory);

    const sceneRunner = new SceneRunner;

    const mario = createPlayer(entityFactory.mario());
    mario.player.name = "MARIO";
    const inputRouter = setupKeyboard(window);
    inputRouter.addReceiver(mario);



    const runLevel = async (name) => {
        const level = await loadLevel(name);

        level.events.listen(Level.EVENT_TRIGGER, (spec, trigger, touches) => {
            if (spec.type === "goto") {
                for (const entity of touches) {
                    if (entity.player) {
                        runLevel(spec.name);
                        return;
                    }
                }
            }
        });

        const playerProgressLayer = createPlayerProgressLayer(font, level);
        const dashboardLayer = createDashboardLayer(font, level);

        mario.pos.set(0, 0);
        level.entities.add(mario);
    
        const playerEnv = createPlayerEnv(mario);
        level.entities.add(playerEnv);

        const waitScreen = new CompositionScene();
        waitScreen.comp.layers.push(createColorLayer('#000'));
        waitScreen.comp.layers.push(dashboardLayer);
        waitScreen.comp.layers.push(playerProgressLayer);
        sceneRunner.addScene(waitScreen);

        
        level.comp.layers.push(dashboardLayer);
        sceneRunner.addScene(level);
        sceneRunner.runNext();
    }

    const gameContext = {
        audioContext,
        videoContext,
        entityFactory,
        deltaTime: null
    };

    const timer = new Timer(1/60);
    timer.update = function update(deltaTime) {
        gameContext.deltaTime = deltaTime;
        sceneRunner.update(gameContext);
    };

    timer.start();

    runLevel('1-1');
}

const canvas = document.getElementById('screen');

const start = () => {
    window.removeEventListener('click', start);
    main(canvas);
};

window.addEventListener('click', start);
