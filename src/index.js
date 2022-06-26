import Phaser from "phaser";
import PreloadScene from "./scenes/PreloadScene";
import MenuScene from "./scenes/MenuScene";
import PlayScene from "./scenes/PlayScene";
import ScoreScene from "./scenes/ScoreScene";
import PauseScene from "./scenes/PauseScene";

const WIDTH = window.innerWidth <= 400 ? window.innerWidth - 30 : 350;
console.log(WIDTH);
const HEIGHT = 600;
const PIPES_TO_RENDER = 4;
const BIRD_POSITION = {
    x: WIDTH * 0.1,
    y: HEIGHT / 2,
};

const SHARED_CONFIG = {
    width: WIDTH,
    height: HEIGHT,
    startPosition: BIRD_POSITION,
    pipesToRender: PIPES_TO_RENDER,
};

const Scenes = [PreloadScene, MenuScene, ScoreScene, PlayScene, PauseScene];
const createScene = (Scene) => new Scene(SHARED_CONFIG);
const initScenes = () => Scenes.map(createScene);

const config = {
    type: Phaser.AUTO,
    parent: "game-app",
    pixelArt: true,
    ...SHARED_CONFIG,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
    scene: initScenes(),
};

new Phaser.Game(config);
