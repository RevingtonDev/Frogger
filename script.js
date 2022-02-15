const canvas = document.getElementsByTagName("canvas")[0],
    ctx = canvas.getContext("2d", { antialias: true });

function resize() {
    canvas.width = scaleByPixelRatio(window.innerWidth);
    canvas.height = scaleByPixelRatio(window.innerHeight);
}

function scaleByPixelRatio(input) {
    return input * (devicePixelRatio || 1);
}

resize();

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

let isPlaying = true;
let level = 1;

let enemies = [];

class Frog {
    constructor() {
        Frog.prototype.size = 50;
        this.x = canvas.width / 2 - this.size;
        this.y = canvas.height - this.size;
        this.d = 25;

        document.addEventListener("keydown", (e) => {
            if (isPlaying) {
                switch (e.keyCode) {
                    case 37:
                        if (this.x - this.d > 0) {
                            this.x -= this.d;
                        }
                        break;
                    case 38:
                        this.y -= this.d;
                        break;
                    case 39:
                        if (this.x + this.d < canvas.width - this.size) {
                            this.x += this.d;
                        }
                        break;
                    case 40:
                        if (this.y + this.d <= canvas.height - this.size) {
                            this.y += this.d;
                        }
                        break;
                }
            }
        });
    }

    draw() {
        let frog = new Image();
        frog.src = "frog.png";
        ctx.drawImage(frog, this.x, this.y, this.size, this.size);
    }

    update(enemies) {
        this.draw();
        if (this.y < this.size) {
            end(0, this, "You WON.", 0);
        }

        let x = this.x + this.size / 2;
        let y = this.y + this.size / 2;
        enemies.forEach((enemy) => {
            if (
                x <= enemy.x + enemy.w &&
                x >= enemy.x &&
                y <= enemy.y + enemy.h &&
                y >= enemy.y
            ) {
                end(1, this, "Game Over.", this.y);
            }
        });
    }
}

function end(i, frog, out, y) {
    ctx.fillStyle = "White";
    ctx.font = "35px Arial";
    ctx.fillText(out, canvas.width - 200, 40);
    isPlaying = false;
    frog.y = y;

    if (i === 0) {
        level++;
        for (let i = 0; i < level * 2; i++) {
            enemies.push(
                new Enemy(
                    Math.random(),
                    Math.random() * canvas.width,
                    Frog.prototype.size +
                    5 +
                    Math.random() * (canvas.height / 2 - (Frog.prototype.size + 5 + 30))
                )
            );
        }
        for (let i = 0; i < level * 2; i++) {
            enemies.push(
                new Enemy(
                    0.7,
                    Math.random() * canvas.width,
                    canvas.height / 2 +
                    Math.random() * (canvas.height / 2 - (Frog.prototype.size + 5 + 20))
                )
            );
        }
        replay();
    }
}

class Enemy {
    constructor(i, x, y) {
        this.i = i;
        this.x = x;
        this.y = y;
        this.d = 0;
        this.sprite = i >= 0.5 ? 1 : 3;
        this.f = 0;
        this.w = 0;
        this.h = 0;
    }

    draw() {
        if (this.y <= canvas.height / 2 - this.w) {
            let croc = new Image();
            croc.src = "crocodile.png";
            ctx.drawImage(
                croc,
                (this.d * croc.width) / 3,
                (this.sprite * croc.height) / 4,
                croc.width / 3,
                croc.height / 4,
                this.x,
                this.y,
                croc.width / 3,
                croc.height / 4
            );
            this.w = croc.width / 3;
            this.h = croc.height / 4;
        } else if (
            this.y > canvas.height / 2 + 25 &&
            this.y <= canvas.height - (Frog.prototype.size + 50)
        ) {
            let scale = 0.08;
            let vehicle = new Image();
            vehicle.src = "wcar.png";
            ctx.drawImage(
                vehicle,
                this.x,
                this.y,
                vehicle.width * scale,
                vehicle.height * scale
            );
            this.w = vehicle.width * scale;
            this.h = vehicle.height * scale;
        } else {
            this.x = -50;
            this.y = -50;
        }
    }

    update() {
        this.draw();
        if (isPlaying) {
            if (this.f >= 30) {
                this.d = (this.d + 1) % 3;
                this.f = 0;
            }
            this.f++;
            if (this.i >= 0.5) {
                this.x += this.i * 3;
                if (this.x >= canvas.width) {
                    this.x = -this.w;
                }
            } else {
                this.x -= this.i * 3;
                if (this.x <= -this.w) {
                    this.x = canvas.width;
                }
            }
        }
    }
}

class Ground {
    constructor() {}
    draw() {
        ctx.fillStyle = "rgb(150, 75, 0)";
        ctx.rect(
            0,
            canvas.height - (Frog.prototype.size + 5),
            canvas.width,
            Frog.prototype.size + 5
        );
        ctx.rect(0, 0, canvas.width, Frog.prototype.size + 5);
        ctx.fill();

        let water = new Image();
        water.src = "water.jpg";
        for (let i = 0; i < 6; i++) {
            ctx.drawImage(
                water,
                (i * canvas.width) / 6,
                Frog.prototype.size + 5,
                canvas.width / 6,
                canvas.height / 2 - (Frog.prototype.size + 5)
            );
        }

        let road = new Image();
        road.src = "road.png";
        for (let i = 0; i < 2; i++) {
            ctx.drawImage(
                road,
                (i * canvas.width) / 2,
                canvas.height / 2,
                canvas.width / 2,
                canvas.height / 2 - (Frog.prototype.size + 5)
            );
        }
        ctx.font = "35px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Level " + level, 5, 40);
    }

    update(frog, enemies) {
        this.draw();
        enemies.forEach((enemy) => {
            enemy.update();
        });
        frog.update(enemies);
    }
}

let ground = new Ground();
let frog = new Frog();

for (let i = 0; i < 10; i++) {
    enemies.push(
        new Enemy(
            Math.random(),
            Math.random() * canvas.width,
            Frog.prototype.size +
            5 +
            Math.random() * (canvas.height / 2 - (Frog.prototype.size + 5 + 30))
        )
    );
}
for (let i = 0; i < 10; i++) {
    enemies.push(
        new Enemy(
            0.7,
            Math.random() * canvas.width,
            canvas.height / 2 +
            Math.random() * (canvas.height / 2 - (Frog.prototype.size + 5 + 20))
        )
    );
}

function replay() {
    isPlaying = true;
    ground = new Ground();
    frog = new Frog();
}

addEventListener("keyup", (e) => {
    if (e.key === "c") {
        replay();
    }
});

async function animate() {
    await sleep(1);
    requestAnimationFrame(animate);
    resize();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ground.update(frog, enemies);
}

animate();