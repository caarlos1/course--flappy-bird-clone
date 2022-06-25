import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";

const WIDTH = 800;
const HEIGHT = 600;
const BIRD_POSITION = {
    x: WIDTH * 0.1,
    y: HEIGHT / 2,
};

const PIPES_TO_RENDER = 4;

const SHARED_CONFIG = {
    width: WIDTH,
    height: HEIGHT,
    startPosition: BIRD_POSITION,
    pipesToRender: PIPES_TO_RENDER,
};

const config = {
    type: Phaser.AUTO,
    ...SHARED_CONFIG,
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
        },
    },
    scene: [new PlayScene(SHARED_CONFIG)],
};

new Phaser.Game(config);
