import Level from "../Level.js";
import { Matrix } from "../math.js";
import { createSpriteLayer } from "../layers/Sprites.js";
import { loadJSON } from "../load.js";
import { createBackgroundLayer } from "../layers/Background.js";
import { loadMusicSheet } from "./music.js";
import { loadSpriteSheet } from "./sprite.js";
import Entity from "../entity.js";
import LevelTimer from '../traits/LevelTimer.js';
import Trigger from '../traits/Trigger.js';

const createTimer = () => {
    const timer = new Entity();
    timer.addTrait(new LevelTimer());
    return timer;
}

const createTrigger = () => {
    const entity = new Entity();
    entity.addTrait(new Trigger());
    return entity;
}

const loadPattern = (name) => {
    return loadJSON(`./sprites/patterns/${name}.json`);
}

const setupBehavior = (level) => {
    const timer = createTimer();
    level.entities.add(timer);

    level.events.listen(LevelTimer.EVENT_TIMER_OK, () => {
        level.music.playTheme();
    });
    
    level.events.listen(LevelTimer.EVENT_TIMER_HURRY, () => {
        level.music.playHurryTheme();
    });
}

const setupBackground = (levelSpec, level, backgroundSprites, patterns) => {
    levelSpec.layers.forEach(layer => {
        const grid = createGrid(layer.tiles, patterns);
        const backgroundLayer = createBackgroundLayer(level, grid, backgroundSprites);
        level.comp.layers.push(backgroundLayer);
        level.TileCollider.addGrid(grid);
    });
}

const setupEntities = (levelSpec, level, entityFactory) => {
    levelSpec.entities.forEach(({name, pos: [x, y]}) => {
        const createEntity = entityFactory[name];
        const entity = createEntity();
        entity.pos.set(x,y)
        level.entities.add(entity);
    })
    const spriteLayer = createSpriteLayer(level.entities);
    level.comp.layers.push(spriteLayer);
}

const setupTriggers = (levelSpec, level) => {
    if (!levelSpec.triggers) {
        return
    }

    for (const triggerSpec of levelSpec.triggers) {
        const entity = createTrigger();
            entity.trigger.conditions.push((entity, touches, gc, level) => {
                level.events.emit(Level.EVENT_TRIGGER, triggerSpec, entity, touches)
            })
            entity.size.set(64, 64);
            entity.pos.set(triggerSpec.pos[0], triggerSpec.pos[1]);
            level.entities.add(entity);
        }
}

export const createLevelLoader = (entityFactory) => {
    return function loadLevel(name) {
        return loadJSON(`./levels/${name}.json`)
        .then(levelSpec => Promise.all([
            levelSpec,
            loadSpriteSheet(levelSpec.tileSheet),
            loadMusicSheet(levelSpec.musicSheet),
            loadPattern(levelSpec.patternSheet)
        ]))
        .then(([levelSpec, backgroundSprites, musicPlayer, patterns]) => {
            
            const level = new Level();
            level.name = name;
            level.music.setPlayer(musicPlayer);

            setupBackground(levelSpec, level, backgroundSprites, patterns);
            setupEntities(levelSpec, level, entityFactory);
            setupTriggers(levelSpec, level);
            setupBehavior(level);
            
            return level;
        });
    }
}


const createGrid = (tiles, patterns) => {
    const grid = new Matrix();

    for(const {tile, x, y} of expandTiles(tiles, patterns)) {
        grid.set(x, y, tile);
    }

    return grid;
}

function* expandSpan(xStart, xLen, yStart, yLen) {
    const xEnd = xStart + xLen;
    const yEnd = yStart + yLen;
    for (let x = xStart; x < xEnd; ++x) {
        for (let y = yStart; y < yEnd; ++y) {
           yield {x,y};
        }
    }
}

const expandRange = (range) => {
    if (range.length === 4) {
        const [xStart, xLen, yStart, yLen] = range;
        return expandSpan(xStart, xLen, yStart, yLen);

    } else if (range.length === 3) {
        const [xStart, xLen, yStart] = range;
        return expandSpan(xStart, xLen, yStart, 1);

    } else if (range.length === 2) {
        const [xStart, yStart] = range;
        return expandSpan(xStart, 1, yStart, 1);
    }
}

function* expandRanges(ranges) {
    for (const range of ranges) {
        yield* expandRange(range);
    }
}

function* expandTiles(tiles, patterns) {
    function* walkTiles(tiles, offsetX, offsetY) {
        for(const tile of tiles) {
            for (const {x,y} of expandRanges(tile.ranges)) {
                const derivedX = x + offsetX;
                const derivedY = y + offsetY;

                if(tile.pattern) {
                    const tiles = patterns[tile.pattern].tiles;
                    yield* walkTiles(tiles, derivedX, derivedY);
                } else {
                    yield {
                        tile,
                        x: derivedX,
                        y: derivedY
                    }
                }
            }
        }
    }

    yield * walkTiles(tiles, 0, 0);
}
