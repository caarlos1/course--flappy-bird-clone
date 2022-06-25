import Phaser from "phaser";

export class PlayScene extends Phaser.Scene {
    constructor(config) {
        super("PlayScene");

        this.config = config;
        this.bird = null;
        this.pipes = null;

        this.pipeVerticalDistanceRange = [150, 250];
        this.pipeHorizontalDistanceRange = [300, 400];
        this.flapVelocity = 250;
    }

    preload() {
        this.load.image("sky", "assets/sky.png");
        this.load.image("bird", "assets/bird.png");
        this.load.image("pipe", "assets/pipe.png");
    }

    create() {
        this.createBG();
        this.createBird();
        this.createPipes();
        this.createColliders();
        this.handleInputs();
    }

    update() {
        this.checkGameStatus();
        this.recyclePipes();
    }

    createBG() {
        this.add.image(0, 0, "sky").setOrigin(0, 0);
    }

    createBird() {
        this.bird = this.physics.add
            .sprite(
                this.config.startPosition.x,
                this.config.startPosition.y,
                "bird"
            )
            .setOrigin(0);

        this.bird.body.gravity.y = 400;
    }

    createPipes() {
        this.pipes = this.physics.add.group();

        for (let i = 0; i < this.config.pipesToRender; i++) {
            const upperPipe = this.pipes
                .create(0, 0, "pipe")
                .setImmovable(true)
                .setOrigin(0, 1);

            const lowerPipe = this.pipes
                .create(0, 0, "pipe")
                .setImmovable(true)
                .setOrigin(0, 0);

            this.placePipe(upperPipe, lowerPipe);
        }

        this.pipes.setVelocityX(-250);
    }

    createColliders() {
        this.physics.add.collider(
            this.bird,
            this.pipes,
            this.gameOver,
            null,
            this
        );
    }

    handleInputs() {
        this.input.on("pointerdown", this.flap, this);
        this.input.keyboard.on("keydown_SPACE", this.flap, this);
    }

    checkGameStatus() {
        if (this.bird.y > this.config.height || this.bird.y < -this.bird.height)
            this.gameOver();
    }

    placePipe(uPipe, lPipe) {
        const rightMostX = this.getRightMostPipe();

        const pipeVerticalDistance = Phaser.Math.Between(
            ...this.pipeVerticalDistanceRange
        );
        const pipeVerticalPosition = Phaser.Math.Between(
            0 + 20,
            this.config.height - 20 - pipeVerticalDistance
        );

        const pipeHorizontalDistance = Phaser.Math.Between(
            ...this.pipeHorizontalDistanceRange
        );

        uPipe.x = rightMostX + pipeHorizontalDistance;
        uPipe.y = pipeVerticalPosition;

        lPipe.x = uPipe.x;
        lPipe.y = uPipe.y + pipeVerticalDistance;
    }

    recyclePipes() {
        const tempPipes = [];
        this.pipes.getChildren().forEach((pipe) => {
            if (pipe.getBounds().right <= 0) {
                tempPipes.push(pipe);

                if (tempPipes.length == 2) {
                    this.placePipe(...tempPipes);
                }
            }
        });
    }

    flap() {
        this.bird.body.velocity.y = -this.flapVelocity;
    }

    getRightMostPipe() {
        let rightMostX = 0;

        this.pipes.getChildren().forEach(function (pipe) {
            rightMostX = Math.max(pipe.x, rightMostX);
        });

        return rightMostX;
    }

    gameOver() {
        // this.bird.x = this.config.startPosition.x;
        // this.bird.y = this.config.startPosition.y;
        // this.bird.body.velocity.y = -this.flapVelocity / 4;
        // this.bird.body.velocity.x = 0

        this.physics.pause();
        this.bird.setTint(0xf00000);
    }
}

export default PlayScene;
