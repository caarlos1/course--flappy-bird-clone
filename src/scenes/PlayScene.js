import BaseScene from "./BaseScene";

class PlayScene extends BaseScene {
    constructor(config) {
        super("PlayScene", config);

        this.bird = null;
        this.pipes = null;

        this.flapVelocity = 250;

        this.gravityGame = 500;
        this.pipesXVelocity = 300;

        this.score = 0;
        this.scoreText = null;

        this.countDownText = null;
        this.initialTime = 0;

        this.pauseEvent = null;
        this.isPaused = false;

        this.currentDifficulty = "easy";
        this.difficulties = {
            easy: {
                pipeVerticalDistanceRange: [300, 350],
                pipeHorizontalDistanceRange: [150, 200],
            },
            normal: {
                pipeVerticalDistanceRange: [280, 330],
                pipeHorizontalDistanceRange: [140, 190],
            },
            hard: {
                pipeVerticalDistanceRange: [250, 310],
                pipeHorizontalDistanceRange: [120, 150],
            },
        };
    }

    create() {
        super.create(); // run create() of BaseScene
        this.currentDifficulty = "easy";
        this.createBird();
        this.createAnimations();
        this.createPipes();
        this.createColliders();
        this.createScore();
        this.createPause();
        this.handleInputs();
        this.listenToEvents();
    }

    update() {
        this.checkGameStatus();
        this.recyclePipes();
    }

    listenToEvents() {
        if (this.pauseEvent) return;

        this.pauseEvent = this.events.on("resume", () => {
            this.initialTime = 3;
            this.countDownText = this.add
                .text(
                    ...this.screenCenter,
                    `Fly in ${this.initialTime}`,
                    this.fontOptions
                )
                .setOrigin(0.5);

            this.timeEvent = this.time.addEvent({
                delay: 1000,
                callback: () => this.countDown(),
                loop: true,
            });
        });
    }

    countDown() {
        this.initialTime--;
        this.countDownText.setText(`Fly in ${this.initialTime}`);

        if (this.initialTime <= 0) {
            this.isPaused = false;
            this.countDownText.setText("");
            this.physics.resume();
            this.timeEvent.remove();
        }
    }

    createBird() {
        this.bird = this.physics.add
            .sprite(
                this.config.startPosition.x,
                this.config.startPosition.y,
                "bird"
            )
            .setFlipX(true)
            .setScale(3)
            .setOrigin(0);

        this.bird.setBodySize(this.bird.width, this.bird.height - 8);

        this.bird.body.gravity.y = this.gravityGame;
        this.bird.setCollideWorldBounds(true);
    }

    createAnimations() {
        this.anims.create({
            key: "fly",
            frames: this.anims.generateFrameNumbers("bird", {
                start: 8,
                end: 15,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.bird.play("fly");
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

        this.pipes.setVelocityX(-this.pipesXVelocity);
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

    createScore() {
        this.score = 0;
        this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
            fontSize: "32px",
            fill: "#000",
            fontStyle: "bold",
        });

        const bestScoreStorage = localStorage.getItem("bestScore");
        const bestScore = bestScoreStorage && parseInt(bestScoreStorage, 10);
        this.add.text(16, 44, `Best Score: ${bestScore || 0}`, {
            fontSize: "18px",
            fill: "#000",
            fontStyle: "bold",
        });
    }

    createPause() {
        this.isPaused = false;

        const pauseButton = this.add
            .image(this.config.width - 10, this.config.height - 10, "pause")
            .setInteractive()
            .setScale(3)
            .setOrigin(1);

        pauseButton.on(
            "pointerdown",
            () => {
                this.isPaused = true;
                this.physics.pause();
                this.scene.pause();
                this.scene.launch("PauseScene");
            },
            this
        );
    }

    handleInputs() {
        this.input.on("pointerdown", this.flap, this);
        this.input.keyboard.on("keydown_SPACE", this.flap, this);
    }

    checkGameStatus() {
        if (
            this.bird.getBounds().top <= 0 ||
            this.bird.getBounds().bottom >= this.config.height
        ) {
            this.gameOver();
        }
    }

    placePipe(uPipe, lPipe) {
        const difficulty = this.difficulties[this.currentDifficulty];
        const rightMostX = this.getRightMostPipe();

        const pipeVerticalDistance = Phaser.Math.Between(
            ...difficulty.pipeVerticalDistanceRange
        );
        const pipeVerticalPosition = Phaser.Math.Between(
            0 + 20,
            this.config.height - 20 - pipeVerticalDistance
        );

        const pipeHorizontalDistance = Phaser.Math.Between(
            ...difficulty.pipeHorizontalDistanceRange
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
                    this.increaseScore();
                    this.saveBestScore();
                    this.increaseDifficulty();
                }
            }
        });
    }

    increaseDifficulty() {
        if (this.score > 40) {
            this.difficulty = "hard";
            return;
        }
        if (this.score > 20) {
            this.difficulty = "normal";
            return;
        }

        this.difficulty = "easy";
    }

    getRightMostPipe() {
        let rightMostX = 500;

        this.pipes.getChildren().forEach(function (pipe) {
            rightMostX = Math.max(pipe.x, rightMostX);
        });

        return rightMostX;
    }

    saveBestScore() {
        const bestScoreStorage = localStorage.getItem("bestScore");
        const bestScore = bestScoreStorage && parseInt(bestScoreStorage, 10);

        if (!bestScore || this.score > bestScore) {
            localStorage.setItem("bestScore", this.score);
        }
    }

    gameOver() {
        this.physics.pause();
        this.bird.setTint(0xf00000);

        this.saveBestScore();

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.scene.restart();
            },
            loop: false,
        });
    }

    flap() {
        if (this.isPaused) return;
        this.bird.body.velocity.y = -this.flapVelocity;
    }

    increaseScore() {
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
    }
}

export default PlayScene;
