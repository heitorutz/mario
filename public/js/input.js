import inputRouter from './InputRouter.js';
import Keyboard  from './KeyboardState.js';

export const setupKeyboard = (window) => {

    const input = new Keyboard();
    const router = new inputRouter;

    input.listenTo(window);

    input.addMapping('Space', keyState => {
        if(keyState) {
            router.route(entity => entity.jump.start())
        } else {
            router.route(entity => entity.jump.cancel())
        }
    });

    input.addMapping('ShiftLeft', keyState => {
        router.route(entity => entity.turbo(keyState))
    });
    
    input.addMapping('KeyD', keyState => {
        router.route(entity => entity.go.dir += keyState ? 1 : -1)
    });
    input.addMapping('KeyA', keyState => {
        router.route(entity => entity.go.dir += -keyState ? -1 : 1)
    });

    return router;
};