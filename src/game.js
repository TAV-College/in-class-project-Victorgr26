var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
};

var game = new Phaser.Game(config);
var score = 0;
var scoreText;
var gameOver = false;
var player;

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  this.add.image(400, 300, "sky");

  const platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, "ground").setScale(2).refreshBody();
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  player = this.physics.add.sprite(200, 150, 'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  
  // Player animations
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }],
    frameRate: 20
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });
  player.body.setGravityY(300)

  this.physics.add.collider(player, platforms);

  stars = this.physics.add.group({
    key: 'star',
    repeat: 10,
    setXY: { x: 12, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);

  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
}

function collectStar(player, star) {
  star.disableBody(true, true);
  scoreupdate = score
  score += 10;
  scoreText.setText('Score: ' + score);
  if (score != scoreupdate) {

    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, 'bomb');

    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 30);


  if (stars.countActive(true) === 0) {
    this.physics.pause();
    player.setTint(0x00FF00);
    player.anims.play('turn');
    gameOver = true;
    this.add.text(200, 300, 'You Won', { fontSize: '100px', fill: '#000' });
    createRestartButton.call(this);
  }
  }
}

function hitBomb(player) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play('turn');
  gameOver = true;
  this.add.text(200, 300, 'Loser', { fontSize: '100px', fill: '#000' });
  createRestartButton.call(this);
}

function createRestartButton() {
  var restartButton = this.add.text(300, 400, 'Restart', { fontSize: '32px', fill: '#fff' })
    .setInteractive()
    .on('pointerdown', () => { restart.call(this); })
    .on('pointerover', () => {
      restartButton.setStyle({ fill: '#ff0' }); // Change color on hover
      restartButton.setFontSize(40); // Increase font size on hover
    })
    .on('pointerout', () => {
      restartButton.setStyle({ fill: '#fff' }); // Reset color when not hovering
      restartButton.setFontSize(32); // Reset font size
    });
}

function restart() {
  score = 0;
  scoreText.setText('Score: ' + score);
  gameOver = false;
  this.scene.restart();
}

function update() {

  var cursors = this.input.keyboard.createCursorKeys();

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-470);
  }

  if (this.input.keyboard.checkDown(this.input.keyboard.addKey('R'), 500) && gameOver) {
    restart.call(this);
  }
}
