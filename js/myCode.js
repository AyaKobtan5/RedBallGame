// Aya Kobtan ---- April 18 , 2025 ---- Red Ball Game ----

// Class: StartScreen
/*-- StartScreen ----------------------------------------------------------------------------
    
       This class represents the game’s start screen, displaying the background, title,
       instructions, and two interactive buttons (Start / Exit). It also manages looping
       start‐screen music and dispatches level changes or window close on button clicks.

       Key Functions:
          - constructor(game)                                 : Initializes references to the game engine, canvas,
                                                                audio, buttons, and background image.
          - update(sprites, keys, mouse)                      : Checks for clicks on Start/Exit buttons, toggles
                                                                music playback, and triggers level loading or exit.
          - draw(ctx)                                        : Renders the background, text (title & instructions),
                                                                and draws the Start/Exit buttons each frame.

       Dependencies:
          - Sprite                                            : Base class for all drawable/updatable game elements.
          - Game                                              : Provides main game engine context and canvas.
          - Level1, Level2                                    : Level classes added to the game on “Start”.
          - Audio                                             : HTMLAudioElement for looping start‐screen music.
          - Image                                             : HTMLImageElement for the background image.

--------------------------------------------------------------------------------------------*/
class StartScreen extends Sprite {
    constructor(game) {
      super();
      this.game = game;
      this.canvas = game.canvas;
      this.startMusic = new Audio('sounds/StartSound.mp3');
      this.startMusic.loop = true;

      this.startBtn = {};
      this.startBtn.x = (this.canvas.width  - 150) / 2;
      this.startBtn.y = ((this.canvas.height / 2) - 150) - 10;
      this.startBtn.w = 150;
      this.startBtn.h = 50;
  
      this.exitBtn = {};
      this.exitBtn.x = (this.canvas.width  - 150) / 2;
      this.exitBtn.y = (this.canvas.height / 2) + 10;
      this.exitBtn.w = 150;
      this.exitBtn.h = 50;
      this.backgroundImage = new Image();
      this.backgroundImage.src = "images/startScreen.jpg";


    }
  
    update(sprites, keys, mouse) {

      if (mouse.clicked &&  mouse.x >= this.startBtn.x  && mouse.x <= this.startBtn.x + this.startBtn.w
          && mouse.y >= this.startBtn.y && mouse.y <= this.startBtn.y + this.startBtn.h) {

        this.startMusic.pause();
        this.startMusic.currentTime = 0;
        this.game.addLevel(new Level1(this.game));
        this.game.addLevel(new Level2(this.game));
        mouse.clicked = false;
        this.game.changeLevel(0);

        return true;   
      }
  
      if ( mouse.clicked &&  mouse.x >= this.exitBtn.x &&  mouse.x <= this.exitBtn.x + this.exitBtn.w
             &&  mouse.y >= this.exitBtn.y && mouse.y <= this.exitBtn.y + this.exitBtn.h) {
            window.close();
            mouse.clicked = false;
            return true;  
      }

      if (mouse.clicked && this.startMusic.paused) {
        this.startMusic.play();
      }
    
        mouse.clicked = false;
        return false;   
    }
  
    draw(ctx) {
        ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);

        this.startBtn.x = 260;                
        this.startBtn.y = 500;           
        this.exitBtn.x = 260;                
        this.exitBtn.y = this.startBtn.y + this.startBtn.h + 5;  
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
    
        ctx.font = 'bold 50px Arial';
        ctx.fillText(' RED BALL ', 240, 60);

        ctx.font = '20px Arial';
        ctx.fillText('A Single red ball rolls through lush hills and dark forests to stop the Evil Boxes', 30, 150);
        ctx.fillText(' from cubifying your world and rescue your friends!!!', 150, 180);
        ctx.font = '20px Arial';
        ctx.fillText("Patrolers move left and right, Rams follow your path, Ninjas jump in place to stomp you,",
            30, 230 );
        ctx.fillText("Shooters fire bullets and can take two hits, and the Boss shoots in all directions with five lives.",
            30, 260 );
        ctx.fillText( "Defeat enemies by stomping or shooting them; Colliding with any enemy costs you a life.",
            30, 290);
        ctx.font = 'bold 20px Arial';
        ctx.fillText("Collect star coins to regain health.",210, 320);
        ctx.font = '18px Arial';
        ctx.fillText('Press "Arrow up" for jump', 240, 360);
        ctx.fillText('Press "Arrow left" for moving left.', 240, 390);
        ctx.fillText('Press "Arrow right" for moving right', 240, 420);
        ctx.fillText('Press "Space" to shoot', 240, 450);

        ctx.fillStyle = "#0a0";
        ctx.fillRect( this.startBtn.x, this.startBtn.y, this.startBtn.w, this.startBtn.h);
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText( "Start Game",this.startBtn.x + this.startBtn.w/2, this.startBtn.y + this.startBtn.h/2);
        ctx.fillStyle = "#a00";
        ctx.fillRect( this.exitBtn.x, this.exitBtn.y, this.exitBtn.w, this.exitBtn.h);
        ctx.fillStyle = "#fff";
        ctx.fillText("Exit Game", this.exitBtn.x + this.exitBtn.w/2, this.exitBtn.y + this.exitBtn.h/2);
      }
}

// Class: Square
/*-- Square -------------------------------------------------------------------------------
    
       This class represents the player’s character (the red ball), handling movement
       (walking, jumping), shooting, gravity, collision detection with obstacles/enemies/pickups,
       health and score management, animations, and sound effects.

       Key Functions:
          - constructor(x, y, radius, speed, game)           : Initializes position, physics parameters,
                                                                sprite sheets, sounds, score display, and state variables.
          - determineState(keys)                             : Updates animation state and selects the
                                                                correct sprite sheet based on input and velocity.
          - update(sprites, keys)                            : Applies gravity, processes input (move/jump/shoot),
                                                                resolves collisions, manages cooldowns, and updates animation.
          - isCollidingWithObstacle(sprite, x, y)            : Checks for circular collision against a
                                                                rectangular obstacle at the given coordinates.
          - takeDamage(amount)                               : Deducts health with a cooldown and plays the hurt sound.
          - draw(ctx)                                        : Renders the current animation frame at the
                                                                ball’s position and draws health hearts.

       Dependencies:
          - Sprite                                            : Base class for all drawable/updatable game elements.
          - GameEngine                                        : Provides canvas dimensions and sprite management.
          - ScoreDisplay                                      : Renders and tracks the player’s score.
          - Bullet                                            : Projectile class fired by the Square.
          - Obstacle                                          : Represents obstacle for collision checks.
          - Potion                                            : Collectible that restores health and awards points.
          - BossLaser                                         : Enemy projectile that inflicts damage.
          - Image                                             : Used for sprite sheets and heart icons.
          - Audio                                             : Used for shooting, jumping, hurt, and star sounds.

--------------------------------------------------------------------------------------------*/
class Square extends Sprite {
        constructor(x, y, radius, speed, game) {
            super();
            this.startX = x;
            this.startY = y;
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.speed = speed;
            this.game = game;
            this.dy = 0;
            this.dx = 0;
            this.jumpForce = -15;
            this.gravity = 1;
            this.canJump = true;
            this.jumpCount = 0;
            this.maxJumps = 2;
            this.ScoreDisplay = new ScoreDisplay(20, 20);
            this.health = 3;
            this.enemiesKilled = 0;
            this.groundLevel = this.game.canvas.height - this.radius;
            this.hitCooldown = 30;
            this.hitCooldownTimer = 0;
    
            this.shootCooldown = 20;
            this.shootCooldownTimer = 0;
    
            this.state = 'idle';
            this.frameIndex = 0;
            this.frameTimer = 0;
            this.timePerFrame = 120;
            this.numberOfFrames = 1;
            this.lastUpdate = Date.now();
    
            this.facingLeft = false;
            this.isMoving = false;
    
            this.spriteSheet = new Image();
            this.spriteSheet.src = 'images/RedBall.png';
    
            this.heartImg = new Image();
            this.heartImg.src = 'images/heart.png';

            this.shootSound = new Audio('sounds/bullet.mp3');
            this.jumpSound = new Audio('sounds/Jump.mp3');
            this.hurtSound = new Audio('sounds/Hurt.mp3');
            this.starSound = new Audio('sounds/StarCollected.mp3');
        }
    
        determineState(keys) {
            let prevState = this.state;

            if (keys[" "]) {
                this.state = "shooting";
                this.spriteSheet.src = 'images/RedBallShoot.png';
                this.numberOfFrames = 4;
            }else if (this.dy < -1 || this.dy > 1) {
                this.state = "jumping";
                this.spriteSheet.src = 'images/RedBallJump.png';
                this.numberOfFrames = 4;            
            } else if (keys["ArrowLeft"] || keys["ArrowRight"]) {
                this.state = "walking";
                this.spriteSheet.src = 'images/RedBallWalk.png';
                this.numberOfFrames = 4;
            } else {
                this.state = "idle";
                this.spriteSheet.src = 'images/RedBall.png';
                this.numberOfFrames = 1;
            }
            if (this.state !== prevState) {
                this.frameIndex = 0;
                this.lastUpdate = Date.now();
            }
        }
    
        update(sprites, keys) {
            for (let sprite of sprites) {
                if (sprite instanceof PauseScreen && sprite.isActive) return false;
            }
    
            if (this.health <= 0) {
                this.dx = 0;
                this.dy = 0;
                return false;
            }
    
            if (this.hitCooldownTimer > 0) 
                this.hitCooldownTimer--;
            if (this.shootCooldownTimer > 0) 
                this.shootCooldownTimer--;  
    
            if (keys[" "] && this.shootCooldownTimer === 0) {
                this.shootSound.currentTime = 0;
                this.shootSound.play();
                const direction = this.dx >= 0 ? 1 : -1;
                const bullet = new Bullet(this.x + direction * this.radius, this.y, 10, 8, this.game);
                bullet.isFromEnemy = false;
                this.game.addSprite(bullet);
                this.shootCooldownTimer = this.shootCooldown;
            }
    
            let newX = this.x + this.dx;
            this.isMoving = false;
    
            if (keys["ArrowLeft"]) {
                newX -= this.speed;
                this.facingLeft = true;
                this.isMoving = true;
            }
            if (keys["ArrowRight"]) {
                newX += this.speed;
                this.facingLeft = false;
                this.isMoving = true;
            }
    
            if (this.game && this.game.canvas) {
                newX = Math.max(this.radius, Math.min(newX, this.game.canvas.width - this.radius));
            }
    
            if (keys["ArrowUp"] && this.canJump && this.jumpCount < this.maxJumps) {
                this.dy = this.jumpForce;
                this.jumpCount++;
                this.canJump = false;
                this.jumpSound.currentTime = 0;
                this.jumpSound.play();
            }
            if (!keys["ArrowUp"]) {
                this.canJump = true;
            }
    
            this.dy += this.gravity;
            let newY = this.y + this.dy;
    
            sprites.forEach(sprite => {
                if (sprite instanceof Obstacle && this.isCollidingWithObstacle(sprite, newX, this.y)) {
                    newX = this.x;
                }
            });
    
            sprites.forEach(sprite => {
                if (sprite instanceof Obstacle && this.isCollidingWithObstacle(sprite, this.x, newY)) {
                    if (this.dy > 0) {
                        newY = sprite.y - this.radius;
                        this.dy = 0;
                        this.canJump = true;
                        this.jumpCount = 0;
                    } else {
                        newY = this.y;
                        this.dy = 0;
                    }
                }
            });
    
            sprites.forEach(sprite => {
                if (sprite instanceof Potion && sprite.isActive && this.isCollidingWithObstacle(sprite, newX, newY)) {
                    sprite.isActive = false;
                    this.ScoreDisplay.scoreDisplay += 5;
                    this.health = Math.min(this.health + 1, 3);

                    this.starSound.currentTime = 0;
                    this.starSound.play();
                }
            });
    
            sprites.forEach(sprite => {
                if ((sprite instanceof Bullet && sprite.isFromEnemy && sprite.isActive) || (sprite instanceof BossLaser && sprite.isActive)) {
                    if (this.isCollidingWithObstacle(sprite, this.x, this.y)) {
                        this.takeDamage(1);
                        sprite.isActive = false;
                    }
                }
            });
            
          if (newY > this.groundLevel) {
                newY = this.groundLevel;
                this.dy = 0;
                this.canJump = true;
                this.jumpCount = 0;
            }
    
            this.x = newX;
            this.y = newY;
    
            this.dx *= 0.8;
            if (this.dx > -0.1 && this.dx < 0.1) {
                this.dx = 0;
            }
            
            this.determineState(keys);
            if (Date.now() - this.lastUpdate >= this.timePerFrame) {
                this.frameIndex = (this.frameIndex + 1) % this.numberOfFrames;
                this.lastUpdate = Date.now();
            }
        }
    
        isCollidingWithObstacle(sprite, x, y) {
            return (
                x - this.radius < sprite.x + sprite.width &&
                x + this.radius > sprite.x &&
                y - this.radius < sprite.y + sprite.height &&
                y + this.radius > sprite.y
            );
        }
    
        takeDamage(amount) {

            if (this.hitCooldownTimer === 0) {
                this.health -= amount;
                if (this.health < 0) 
                    this.health = 0;
                this.hitCooldownTimer = this.hitCooldown;
                this.hurtSound.currentTime = 0;
                this.hurtSound.play();
            }
        }
    
        draw(ctx) {
            if (this.health <= 0)
                 return;
          
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(this.facingLeft ? -1 : 1, 1);

            ctx.drawImage(this.spriteSheet, this.frameIndex * (this.spriteSheet.width  / this.numberOfFrames),0,
            this.spriteSheet.width / this.numberOfFrames, this.spriteSheet.height,-this.radius, -this.radius, 
            this.radius * 2, this.radius * 2, );

            ctx.restore();
            for (let i = 0; i < this.health; i++) {
              ctx.drawImage( this.heartImg, this.x - ((this.health * 20 + (this.health - 1) * 5) / 2) + i * 25,
              this.y - this.radius - 25, 20, 20);
            }
          }  
}    

// Class: Ground
/*-- Ground ----------------------------------------------------------------------------
    
       This class represents a static ground platform in the game world, providing
       a solid surface for the player and other sprites to collide with.

       Key Functions:
          - constructor(x, y, w, h)                           : Initializes the platform’s position and dimensions.
          - update()                                        : No-op; the ground does not change over time.
          - draw(ctx)                                       : Renders a filled rectangle at the ground’s bounds.

       Dependencies:
          - Sprite                                          : Base class for all drawable/updatable game elements.

--------------------------------------------------------------------------------------------*/
class Ground extends Sprite {
    constructor(x, y, w, h) {
        super();
        this.x = x; 
        this.y = y;
        this.width = w; 
        this.height = h;
    }

    update() {
        return false;
    }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Class: Flag
/*-- Flag ----------------------------------------------------------------------------
    
       This class represents the level’s goal flag. When the player’s Square sprite
       collides with the flag, the level is marked as completed.

       Key Functions:
          - constructor(x, y, size, game, imageSrc)        : Initializes position, size, game context,
                                                              reach state, and loads the flag image.
          - update(sprites)                                : Detects collision with the Square; sets isReached.
          - isColliding(square)                            : Returns true if the Square overlaps the flag’s area.
          - draw(ctx)                                      : Renders the flag image at its coordinates.

       Dependencies:
          - Sprite                                         : Base class for drawable/updatable game elements.
          - Square                                         : Player class for collision detection.
          - Image                                          : Used to load and display the flag sprite.

--------------------------------------------------------------------------------------------*/
class Flag extends Sprite {
    constructor(x, y, size, game, imageSrc) {
      super();
      this.x = x;
      this.y = y;
      this.size = size;
      this.game = game;
      this.isReached = false;
  
      this.image = new Image();
      this.image.src = imageSrc;
    }
  
    update(sprites) {
      if (this.isReached) 
        return false;

      const square = sprites.find(sprite => sprite instanceof Square);

      if (square && this.isColliding(square)) {
        this.isReached = true;
      }
      return false;
    }
  
    isColliding(square) {
      return (
        square.x + square.radius > this.x &&
        square.x - square.radius < this.x + this.size &&
        square.y + square.radius > this.y - this.size &&
        square.y - square.radius < this.y
      );
    }
  
    draw(ctx) {
      ctx.drawImage(  this.image, this.x, this.y - this.size, this.size,this.size, );
    }
}

// Class: ScoreDisplay
/*-- ScoreDisplay --------------------------------------------------------------------------
    
       This class manages and renders the player’s score on the screen at a fixed position.

       Key Functions:
          - constructor(x, y)                            : Initializes the display coordinates and resets score to zero.
          - update()                                     : No-op; the score display state is updated externally.
          - draw(ctx)                                    : Renders the current score text at (x, y).

       Dependencies:
          - Sprite                                       : Base class for all drawable/updatable game elements.

--------------------------------------------------------------------------------------------*/
class ScoreDisplay extends Sprite {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.scoreDisplay = 0;
    }

    update() {
        return false;
    }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Score: " + this.scoreDisplay, this.x, this.y);
    }
}

// Class: Bullet
/*-- Bullet -------------------------------------------------------------------------------
    
       This class represents a projectile fired by the player or enemies. It moves across
       the screen, detects collisions with obstacles, flags, enemies, or the player, and
       deactivates itself on impact.

       Key Functions:
          - constructor(x, y, size, speed, game)           : Sets initial position, size, speed,
                                                                ownership (player vs enemy), and loads image.
          - update(sprites)                                : Moves the bullet each frame, checks
                                                                for PauseScreen, handles collisions
                                                                with Obstacle/Flag (deactivate),
                                                                enemies (damage + score), or player.
          - isColliding(sprite)                            : Returns true if this bullet’s bounds
                                                                overlap the given sprite.
          - draw(ctx)                                      : Draws the bullet image if still active.

       Dependencies:
          - Sprite                                            : Base class for all drawable/updatable elements.
          - Obstacle                                          : obstacles class for collision checks.
          - Flag                                              : Level-completion flag for collision checks.
          - Square                                            : Player class for damage detection.
          - AttackEnemy, BasicEnemy                           : Enemy classes for damage application.
          - Boss                                              : Boss class for damage application.
          - GameEngine                                        : Provides canvas dimensions and sprite list.
          - Image                                             : Used to load and draw the bullet graphic.

--------------------------------------------------------------------------------------------*/
class Bullet extends Sprite {
    constructor(x, y, size, speed, game) {
        super();
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.isFromEnemy = false;
        this.isActive = true;
        this.game = game;
        this.image = new Image();
        this.image.src = 'images/Bullet.png';
    }

    update(sprites) {
        
        for (let sprite of sprites) {
            if (sprite instanceof PauseScreen && sprite.isActive) {
                return false;
            }
        }

        if (this.isFromEnemy) {
            this.x -= this.speed;
          } else {
            this.x += this.speed;
          }          

        for (let sprite of sprites) {
            if ((sprite instanceof Obstacle || sprite instanceof Flag) && this.isColliding(sprite)) {
                this.isActive = false;
                return !this.isActive;
            }
        }

        const player = sprites.find(sprite => sprite instanceof Square);

        if (!this.isFromEnemy) {
            for (let sprite of sprites) {
                if ((sprite instanceof AttackEnemy || sprite instanceof BasicEnemy) 
                                && this.isColliding(sprite)) {
                    sprite.health--;
                    this.isActive = false;
                    if (sprite.health <= 0) {
                        sprite.deathSound.currentTime = 0;
                        sprite.deathSound.play();
                        sprite.isActive = false;
                        if (player) {
                            player.enemiesKilled++;
                            player.ScoreDisplay.scoreDisplay += 50;
                }
        }
         return !this.isActive;
    }
}
        for (let sprite of sprites) {
                if (sprite instanceof Boss && this.isColliding(sprite)) {
                    sprite.takeDamage(1);
                    this.isActive = false;
                    if (sprite.health <= 0 && player) {
                        sprite.deathSound.currentTime = 0;
                        sprite.deathSound.play();
                        player.enemiesKilled++;
                        player.ScoreDisplay.scoreDisplay += 75;
                    }
                    return !this.isActive;
                }
            }

        } else {
           
            if (player && this.isColliding(player)) {
                player.takeDamage(1);
                this.isActive = false;
                return !this.isActive;
            }
            if (this.x < 0) {
                this.isActive = false;
            }
        }

        if (this.x > this.game.canvas.width) {
            this.isActive = false;
        }

        return !this.isActive;
    }

    isColliding(sprite) {
        return (
            this.x < sprite.x + (sprite.width || sprite.radius * 2) &&
            this.x + this.size > sprite.x - (sprite.radius || 0) &&
            this.y < sprite.y + (sprite.height || sprite.radius * 2) &&
            this.y + this.size > sprite.y - (sprite.radius || 0)
        );
    }

    draw(ctx) {
        if (this.isActive) {     
            ctx.drawImage(this.image, this.x, this.y,  this.size * 2.5, this.size * 1.5);
        }
    }
    
}

// Class: Obstacle
/*-- Obstacle ----------------------------------------------------------------------------
    
       This class represents a static obstacle in the level, providing collision
       boundaries and rendering its image at a fixed position.

       Key Functions:
          - constructor(x, y, width, height, imageSrc)     : Initializes position, dimensions,
                                                                active state, and loads the obstacle image.
          - update(sprites)                                : No-op; obstacles do not change over time.
          - isColliding(sprite)                            : Returns true if this obstacle’s bounds
                                                                overlap the given sprite’s bounds.
          - draw(ctx)                                      : Renders the obstacle image if active.

       Dependencies:
          - Sprite                                            : Base class for drawable/updatable game elements.
          - Image                                             : Used to load and draw the obstacle graphic.

--------------------------------------------------------------------------------------------*/
class Obstacle extends Sprite {
    constructor(x, y, width, height,imageSrc) {
        super();
        this.x = x;
        this.y = y;
        this.width = width; 
        this.height = height; 
        this.isActive = true; 
        this.image = new Image();
        this.image.src = imageSrc;
    }
    
    update(sprites) {
        return false;
    }

    isColliding(sprite) {
        return (
            this.x < sprite.x + sprite.width &&
            this.x + this.width > sprite.x &&
            this.y < sprite.y + sprite.height &&
            this.y + this.height > sprite.y
        );
    }

    draw(ctx) {
        if (!this.isActive)
             return;
        ctx.drawImage( this.image,this.x,  this.y, this.width, this.height);
    }
}

// Class: AttackEnemy
/*-- AttackEnemy ---------------------------------------------------------------------------
    
       This class represents an enemy that falls under gravity, shoots periodically,
       and reacts to player collisions (stomp or damage). It handles its own physics,
       obstacle stacking, shooting bullets, and death logic.

       Key Functions:
          - constructor(x, y, size, game, speed)           : Initializes position, size, speed,
                                                                health, shoot interval, physics timers,
                                                                and loads sprite & death sound.
          - update(sprites)                                : Applies gravity, resolves obstacle collisions,
                                                                fires bullets on interval, handles player
                                                                collision (stomp or damage), and returns
                                                                false when inactive.
          - isColliding(sprite)                            : Checks circular collision with the player.
          - isCollidingWithObstacle(sprite, x, y)          : Checks rectangular collision for stacking.
          - draw(ctx)                                      : Renders the enemy sprite if active.

       Dependencies:
          - Sprite                                            : Base class for drawable/updatable elements.
          - Bullet                                            : Projectile class used for shooting.
          - Square                                            : Player class for collision detection.
          - Obstacle                                          : Obstacle class for stacking checks.
          - Ground                                            : Ground class for stacking checks.
          - BasicEnemy                                        : Used in stacking logic to stand on other enemies.
          - GameEngine                                        : Provides canvas dimensions & sprite management.
          - Image                                             : For loading and drawing the enemy sprite.
          - Audio                                             : For playing the death sound.

--------------------------------------------------------------------------------------------*/
class AttackEnemy extends Sprite {
    constructor(x, y, size, game, speed) {
        super();
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.game = game;
        this.speed = speed;
        this.health = 2;
        this.shootInterval = 100;
        this.timer = 0;
        this.dy = 0;
        this.isActive = true;

        this.image = new Image();
        this.image.src = 'images/AttackEnemySprite.png';
        this.deathSound = new Audio('sounds/Death.mp3');
    }

    update(sprites) {
        for (let sprite of sprites) {
            if (sprite instanceof PauseScreen && sprite.isActive) {
              return false;
            }
        }
          
        if (!this.isActive) 
            return false;

        const player = sprites.find(sprite => sprite instanceof Square);

        this.dy += 1;
        let newY = this.y + this.dy;

        for (let sprite of sprites) {
            if ((sprite instanceof Obstacle || sprite instanceof Ground ||
                    (sprite instanceof BasicEnemy && sprite !== this && sprite.isActive &&
                     this.y + this.height <= sprite.y + sprite.height / 2)) 
                     && this.isCollidingWithObstacle(sprite, this.x, newY)) {
                    newY = sprite.y - this.height;
                    this.dy = 0;
                    break;
            }
        }

        this.y = newY;
        this.timer++;

        if (this.timer >= this.shootInterval) {
            const bullet = new Bullet(this.x - 10, this.y + (this.height - 10) / 2, 10,8, this.game);
            bullet.isFromEnemy = true;
            this.game.addSprite(bullet);
            this.timer = 0;
        }

        if (player && this.isColliding(player)) {

            if (player.dy > 0 && (player.y + player.radius) <= (this.y + this.height / 2)) {
                this.deathSound.currentTime = 0;
                this.deathSound.play();
                this.isActive = false;
                player.enemiesKilled++;
                player.ScoreDisplay.scoreDisplay += 50;
                player.dy = player.jumpForce;

            } else {
                player.takeDamage(1);
                player.dx = player.x < this.x ? -10 : 10;
            } 
            
        }

        return !this.isActive;
    }

    isColliding(sprite) {
        return (
            this.x < sprite.x + sprite.radius &&
            this.x + this.width > sprite.x - sprite.radius &&
            this.y < sprite.y + sprite.radius &&
            this.y + this.height > sprite.y - sprite.radius
        );
    }

    isCollidingWithObstacle(sprite, x, y) {
        return (
            x < sprite.x + sprite.width &&
            x + this.width > sprite.x &&
            y < sprite.y + sprite.height &&
            y + this.height > sprite.y
        );
    }

    draw(ctx) {

        if (!this.isActive) 
            return;

        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Class: GameOver
/*-- GameOver -------------------------------------------------------------------------------
    
       This class represents the “Game Over” screen. It displays the end‐of‐game graphic,
       plays the game‐over sound, shows the final score, and listens for the “R” key to
       restart the level.

       Key Functions:
          - constructor(scoreDisplay, game)                  : Initializes score reference, game context,
                                                                active state, loads background image, and
                                                                plays the game‐over sound.
          - update(sprites, keys)                           : Waits for “R” key press after any key release,
                                                                plays restart sound, invokes LevelManager to
                                                                restart, and deactivates itself.
          - draw(ctx)                                       : Renders the full‐screen game‐over image and
                                                                overlays “You Lost!”, score, and restart prompt.

       Dependencies:
          - Sprite                                            : Base class for drawable/updatable elements.
          - LevelManager                                      : Manages level state and handles restart logic.
          - Image                                             : Used to load and draw the game‐over background.
          - Audio                                             : For game‐over and restart sound effects.

--------------------------------------------------------------------------------------------*/
class GameOver extends Sprite {
    constructor(scoreDisplay, game) {
        super();
        this.scoreDisplay = scoreDisplay;
        this.game = game;
        this.isActive = true;
        this.restartReady = false; 
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'images/gameOver.png';
        this.gameOverSound = new Audio('sounds/GameOver.mp3');
        this.restartSound = new Audio('sounds/Restart Level.mp3');
        this.gameOverSound.play();
    }

    update(sprites, keys) {
        if (this.isActive) {
          if (!keys["r"]) {
            this.restartReady = true;

          } else if (this.restartReady && keys["r"]) {
            this.restartSound.play();

            for (let sprite of sprites) {
                if (sprite instanceof LevelManager) {
                    sprite.restartGame();
                    break;
                }
            }
        this.isActive = false;
        }
        return false;           
    }
    return true;                
}

    draw(ctx) {
        ctx.drawImage( this.backgroundImage,0,0,  ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("You Lost!", ctx.canvas.width / 2, (ctx.canvas.height / 2) - 60);
        ctx.fillText(`Score: ${this.scoreDisplay.scoreDisplay}`, ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.fillText('Press "R" to Restart', ctx.canvas.width / 2, (ctx.canvas.height / 2) + 60);
        ctx.restore();
    }
}

// Class: GameWon
/*-- GameWon ----------------------------------------------------------------------------
    
       This class represents the “You Won” screen. It displays the victory graphic,
       plays the win sound, shows the final score, and listens for the “R” key to
       restart the game (back to level 0).

       Key Functions:
          - constructor(scoreDisplay, game)                  : Initializes score reference,
                                                                game context, active state,
                                                                loads background image, and
                                                                plays the win sound.
          - update(sprites, keys)                           : Waits for “R” key press after any
                                                                key release, plays restart sound,
                                                                resets to level 0, and deactivates itself.
          - draw(ctx)                                       : Renders the full‐screen victory image
                                                                and overlays “You Won!”, score, and
                                                                restart prompt.

       Dependencies:
          - Sprite                                            : Base class for drawable/updatable elements.
          - GameEngine                                        : Provides level management (changeLevel).
          - ScoreDisplay                                      : Holds the final score to display.
          - Image                                             : Used to load and draw the victory background.
          - Audio                                             : For win and restart sound effects.

--------------------------------------------------------------------------------------------*/
class GameWon extends Sprite {
    constructor(scoreDisplay, game) {
        super();
        this.scoreDisplay = scoreDisplay;
        this.game = game;
        this.isActive = true;
        this.restartReady = false;
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'images/gameWon.png';
        this.gameWonSound = new Audio('sounds/GameWon.mp3');
        this.restartSound = new Audio('sounds/Restart Level.mp3');
        this.gameWonSound.play();
    }   
        update(sprites, keys) {
            if (this.isActive) {

            if (!keys["r"]) {
                this.restartReady = true;

            } else if (this.restartReady && keys["r"]) {
                this.restartSound.play();
                this.game.changeLevel(0);
                this.isActive = false;
            }
            return false;
        }
            return true;
        }

        draw(ctx) {

        ctx.drawImage(this.backgroundImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("You Won!", ctx.canvas.width / 2, ((ctx.canvas.height / 2) - 60));
        ctx.fillText(`Score: ${this.scoreDisplay.scoreDisplay}`, ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.fillText('Press "R" to Restart', ctx.canvas.width / 2, (ctx.canvas.height / 2) + 60);
        ctx.restore();
    }
}

// Class: BasicEnemy
/*-- BasicEnemy ---------------------------------------------------------------------------
    
       This class represents a ground enemy that can patrol, ram toward the player, or
       perform timed jumps (ninja). It handles physics (gravity, stacking on obstacles),
       AI movement for three distinct modes, collision detection with the player
       (stomp vs. damage), sprite‐sheet animation timing, and death logic including sound.

       Description:
          - Gravity & Stacking
             • Applies downward acceleration every frame.
             • Snaps to ground, obstacles, or other enemies when a collision is detected.
          - Mode Behaviors
             * patrol   – Walks side to side, reversing direction on edges or obstacle bump.
             * ram      – Charges at the player when within a trigger distance, reversing on bump.
             * ninja    – Performs vertical jumps at fixed intervals when stationary.
          - Player Interaction
             * Stomp  – If the player lands on its head, the enemy dies, awards points, and bounces the player.
             * Damage – Otherwise inflicts one point of damage and knocks the player back.
          - Animation
             • Cycles through sprite frames at a fixed interval (timePerFrame).
             • Switches sprite sheets based on mode and frameIndex.

       Key Functions:
          - constructor(x, y, size, game, speed, mode)
             • Initializes position, size, speed, behavior mode, health, gravity timer,
               sprite sheet & frame settings, and death sound.
          - update(sprites)
             • Applies gravity & stacking, runs mode‐specific movement logic,
               checks collisions with the player (stomp/damage), updates animation frame,
               and returns `true` when the enemy is no longer active.
          - isColliding(sprite)
             • Checks circular bounds collision with the player.
          - isCollidingWithObstacle(sprite, x, y)
             • Tests rectangular collision at (x, y) for obstacles, ground, or other sprites.
          - isBumpingIntoEnemy(sprite, x, y)
             • Detects lateral collisions with other enemies/flags to reverse direction.
          - isStandingOnSomething(sprite, y)
             • Determines if the enemy’s bottom at y is supported by obstacles or another entity.
          - draw(ctx)
             • Draws the current sprite‐sheet frame at (this.x, this.y) if the enemy is active.

       Dependencies:
          - Sprite            — Base class for all drawable/updatable game elements.
          - GameEngine        — Provides canvas dimensions and sprite management.
          - Obstacle, Ground  — obstacles classes for collision and stacking.
          - BasicEnemy        — For stacking on peer enemies (patrol bump logic).
          - AttackEnemy, Boss — Other enemy types for bump and stacking logic.
          - Flag              — Level goal object used in bump detection.
          - Square            — Player class for stomp/damage interactions.
          - Image             — Used to load sprite sheets for animation.
          - Audio             — Used to play the death sound effect.

--------------------------------------------------------------------------------------------*/
class BasicEnemy extends Sprite {
    constructor(x, y, size, game, speed, mode = "patrol") {
        super();
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.game = game;
        this.speed = speed;
        this.mode = mode;
        this.health = 1;
        this.triggerDist = 150;
        this.jumpInterval = 40;
        this.jumpTimer = 0;
        this.dy = 0;
        this.isActive = true;
        this.baseSpeed = speed;   

        this.spriteSheet = new Image();
        this.frameIndex  = 0;
        this.lastUpdate  = Date.now();
        this.timePerFrame = 120;

        this.deathSound = new Audio('sounds/Death.mp3');

        if (mode === "patrol") {
            this.spriteSheet.src = 'images/PatrolSpriteSheet.png';
            this.frameCount  = 3;
          } else if (mode === "ram") {
            this.spriteSheet.src = 'images/RamSpriteSheet.png';
            this.frameCount = 3;
          } else {
            this.spriteSheet.src = 'images/NinjaSprite.png';
            this.frameCount = 1;
          }
        }

    update(sprites) {

        for (let sprite of sprites) {
            if (sprite instanceof PauseScreen && sprite.isActive) {
              return false;
            }
        }

        if (!this.isActive) 
            return false;

        const player = sprites.find(sprite => sprite instanceof Square);

        let newX = this.x;
        let newY = this.y;

        this.dy += 1;
        newY += this.dy;

        let grounded = false;
        for (let sprite of sprites) {
            if (this.isStandingOnSomething(sprite, newY)) {
                newY = sprite.y - this.height;
                this.dy = 0;
                grounded = true;
                break;
            }
        }

        if (!grounded) {
            this.x = newX;
            this.y = newY;
            return false;
        }

        switch (this.mode) {
            case "patrol":
                newX += this.speed;
                for (let sprite of sprites) {
                    if (
                        (sprite instanceof Obstacle && this.isCollidingWithObstacle(sprite, newX, this.y)) ||
                        this.isBumpingIntoEnemy(sprite, newX, this.y)
                    ) {
                        this.speed *= -1;
                        newX = this.x;
                        break;
                    }
                }
                if (newX <= 0 || newX + this.width >= this.game.canvas.width) {
                    this.speed *= -1;
                    newX = this.x;
                }
                break;

            case "ram":
                newX += this.speed;

                if (player) {
                    const dx = player.x - this.x;
                    if (dx >= -this.triggerDist && dx <= this.triggerDist) {
                        const magnitude = this.speed < 0 ? -this.speed : this.speed;
                        const direction = dx < 0 ? -1 : 1;
                        this.speed = direction * magnitude;
                    }
                }

                for (let sprite of sprites) {
                    if ((sprite instanceof Obstacle && this.isCollidingWithObstacle(sprite, newX, this.y)) ||
                        this.isBumpingIntoEnemy(sprite, newX, this.y)) {
                        this.speed *= -1;
                        newX = this.x;
                        break;
                    }
                }
                if (newX <= 0 || newX + this.width >= this.game.canvas.width) {
                    this.speed *= -1;
                    newX = this.x;
                }
                break;

            case "ninja":
                this.jumpTimer++;
                if (this.jumpTimer >= this.jumpInterval) {
                    this.dy = -20;
                    this.jumpTimer = 0;
                }
                break;
            }

                this.x = newX;
                this.y = newY;

                if (player && this.isColliding(player)) {
                    if (player.dy > 0 && (player.y + player.radius) <= (this.y + this.height / 2)) {
                        this.deathSound.currentTime = 0;
                        this.deathSound.play();
                        this.isActive = false;
                        player.enemiesKilled++;
                        player.ScoreDisplay.scoreDisplay += 30;
                        player.dy = player.jumpForce;
                    } else {
                        player.takeDamage(1); 
                        player.dx = player.x < this.x ? -10 : 10;
                    }
                }

                if (Date.now() - this.lastUpdate >= this.timePerFrame) {
                    this.frameIndex = (this.frameIndex + 1) % this.frameCount;
                    this.lastUpdate = Date.now();
                }

        return !this.isActive;
    }

    isColliding(sprite) {
        return (
            this.x < sprite.x + sprite.radius &&
            this.x + this.width > sprite.x - sprite.radius &&
            this.y < sprite.y + sprite.radius &&
            this.y + this.height > sprite.y - sprite.radius
        );
    }

    isCollidingWithObstacle(sprite, x, y) {
        return (
            x < sprite.x + sprite.width &&
            x + this.width > sprite.x &&
            y < sprite.y + sprite.height &&
            y + this.height > sprite.y
        );
    }

    isBumpingIntoEnemy(sprite, x, y) {
        return ( sprite !== this && sprite.isActive && (sprite instanceof BasicEnemy || sprite instanceof AttackEnemy || 
            sprite instanceof Boss || sprite instanceof Flag) && this.isCollidingWithObstacle(sprite, x, y));
    }

    isStandingOnSomething(sprite, y) {
        return (
            ((sprite instanceof Obstacle || sprite instanceof Ground) ||
             (sprite instanceof BasicEnemy && sprite !== this && sprite.isActive && this.y + this.height <= sprite.y + sprite.height / 2) ||
             (sprite instanceof AttackEnemy && sprite.isActive && this.y + this.height <= sprite.y + sprite.height / 2) ||
             (sprite instanceof Boss && sprite.isActive && this.y + this.height <= sprite.y + sprite.height / 2) ||
             (sprite instanceof Flag && this.y + this.height <= sprite.y + sprite.height / 2)) &&
            this.isCollidingWithObstacle(sprite, this.x, y)
        );
    }

    draw(ctx) {
        if (!this.isActive) 
            return;

        ctx.drawImage(this.spriteSheet, this.frameIndex * (this.spriteSheet.width/this.frameCount),
         0, this.spriteSheet.width/this.frameCount, this.spriteSheet.height, 
         this.x, this.y, this.width, this.height); }
}

// Class: BossLaser
/*-- BossLaser ---------------------------------------------------------------------------
    
       This class represents a laser projectile fired by the Boss. It travels at a
       specified velocity (speedX, speedY), deactivates when off-screen or on impact,
       and handles collisions with obstacle and the player, applying damage, knockback,
       and score penalties.

       Key Functions:
          - constructor(x, y, speedX, speedY, game)      : Initializes position, velocity,
                                                            size, active state, and loads image.
          - update(sprites)                              : Moves the laser, checks for PauseScreen,
                                                            deactivates off-screen, tests collisions
                                                            with Obstacle (deactivate) and Square
                                                            (damage, knockback, score penalty).
          - isColliding(sprite)                          : Returns true if this laser’s bounds
                                                            overlap the given sprite’s bounds.
          - draw(ctx)                                    : Renders the laser image if still active.

       Dependencies:
          - Sprite                                         : Base class for drawable/updatable game elements.
          - Obstacle                                       : Obstacle class for collision detection.
          - Square                                         : Player class for damage handling and score.
          - GameEngine                                     : Provides canvas dimensions and sprite list.
          - Image                                          : Used to load and draw the laser graphic.

--------------------------------------------------------------------------------------------*/
class BossLaser extends Sprite {
    constructor(x, y, speedX, speedY, game) { 
        super();
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.width = 40;      
        this.height = 15;    
        this.isActive = true;
        this.game = game;
        this.imageBullet = new Image();
        this.imageBullet.src = 'images/Bullet.png';
    }

    update(sprites) {
        for (let sprite of sprites) {
            if (sprite instanceof PauseScreen && sprite.isActive) {
              return false;
            }
          }

        if (!this.isActive) 
            return true;

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > this.game.canvas.width || this.y < 0 || this.y > this.game.canvas.height) {
            this.isActive = false;
        }

        for (let sprite of sprites) {
            if ((sprite instanceof Obstacle) && this.isColliding(sprite)) {
                this.isActive = false;
            }
        }

        for (let sprite of sprites) {
            if (sprite instanceof Square && this.isColliding(sprite)) {
                sprite.takeDamage(1);
                if (sprite.x < this.x) {
                    sprite.dx = -10;
                } else {
                    sprite.dx = 10;
                }
                sprite.ScoreDisplay.scoreDisplay -= 10;
                if (sprite.ScoreDisplay.scoreDisplay < 0) sprite.ScoreDisplay.scoreDisplay = 0;
                this.isActive = false;
            }
        }

        return !this.isActive; 
    }

    isColliding(sprite) {
        return (
            this.x < sprite.x + (sprite.width || sprite.radius * 2) &&
            this.x + this.width > sprite.x &&
            this.y < sprite.y + (sprite.height || sprite.radius * 2) &&
            this.y + this.height > sprite.y
        );
    }

    draw(ctx) {
        if (!this.isActive) 

            return;

        ctx.drawImage( this.imageBullet, this.x, this.y, this.width,this.height );
    }
}
// Class: Boss
/*-- Boss -------------------------------------------------------------------------------
    
       This class represents the level’s boss enemy, managing health, shooting patterns,
       collision with player and bullets, adaptive fire rate, and death logic.

       Key Functions:
          - constructor(x, y, width, height, game)         : Initializes position, size, max health,
                                                               shoot interval, timers, active state, and death sound.
          - update(sprites)                                : Handles pause checks, firing logic (interval adapts
                                                               below half health), processes incoming player bullets,
                                                               detects player collisions (stomp vs. damage),
                                                               plays death sound and awards points on defeat.
          - takeDamage(amount)                             : Reduces health by amount (floored at zero).
          - shoot()                                        : Fires two BossLaser projectiles in opposite directions.
          - isColliding(sprite)                            : Returns true if this boss overlaps a circular sprite.
          - draw(ctx)                                      : Renders a colored rectangle with dynamic health bar above.

       Dependencies:
          - Sprite                                            : Base class for drawable/updatable elements.
          - GameEngine                                        : Manages sprite list and level context.
          - Square                                            : Player class for collision and score updates.
          - Bullet                                            : Player projectile class for damage detection.
          - BossLaser                                         : Laser class used for boss projectiles.
          - Audio                                             : For playing death sound effects.
          - CanvasRenderingContext2D                          : For drawing the boss and health bar.

--------------------------------------------------------------------------------------------*/
class Boss extends Sprite {
    constructor(x, y, width, height, game) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.game = game;
        this.maxHealth = 5;
        this.health = this.maxHealth;
        this.shootInterval = 120;
        this.shootTimer = 0;
        this.isActive = true;
        this.deathSound = new Audio('sounds/Death.mp3');
    }

    update(sprites) {
        for (let sprite of sprites) {
            if (sprite instanceof PauseScreen && sprite.isActive) {
              return false;
            }
        }

        if (!this.isActive) 
            return false;

        const player = sprites.find(sprite => sprite instanceof Square);
        if (!player) 
            return this.isActive;

        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval) {
            this.shoot();
            this.shootTimer = 0;
        }

        if (this.health <= this.maxHealth / 2) {
            this.shootInterval = 60;
        }

        for (let sprite of sprites) {
            if (sprite instanceof Bullet && !sprite.isFromEnemy && this.isColliding(sprite)) {
                this.takeDamage(1);
                sprite.isActive = false;
            }
        }

        if (this.isColliding(player)) {
            if (player.dy > 0 && (player.y + player.radius) <= (this.y + this.height / 2)) {
                this.takeDamage(1);
                player.ScoreDisplay.scoreDisplay += 50;
                player.enemiesKilled++;
                player.dy = player.jumpForce;
            } else {
                player.takeDamage(1);
                player.dx = player.x < this.x ? -10 : 10;
            }
        }

        if (this.health <= 0) {
            this.deathSound.currentTime = 0;
            this.deathSound.play();
            this.isActive = false;
            player.ScoreDisplay.scoreDisplay += 75;
            player.enemiesKilled++;
        }

        return !this.isActive;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    shoot() {
    
        this.game.addSprite(new BossLaser(this.x + this.width, this.y + (this.height - 20) / 2, 8, 0, this.game));
        this.game.addSprite(new BossLaser(this.x - 6, this.y + (this.height - 20) / 2,   -8, 0, this.game));

    }
      
    isColliding(sprite) {
        return (
            this.x < sprite.x + sprite.radius &&
            this.x + this.width > sprite.x - sprite.radius &&
            this.y < sprite.y + sprite.radius &&
            this.y + this.height > sprite.y - sprite.radius
        );
    }

    draw(ctx) {
        if (!this.isActive) 
            return;

        const healthRatio = this.health / this.maxHealth;
        const red = Math.floor(255 * (1 - healthRatio));
        const green = Math.floor(255 * healthRatio);

        ctx.fillStyle = `rgb(${red}, ${green}, 0)`;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y - 10, this.width, 5);
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y - 10, (this.health / this.maxHealth) * this.width, 5);
    }
}

// Class: Potion
/*-- Potion ----------------------------------------------------------------------------
    
       This class represents a collectible potion that restores the player’s health and
       awards points upon pickup, with an accompanying sound effect.

       Key Functions:
          - constructor(x, y, size, imageSrc)               : Initializes position, size,
                                                                active state, image, and collect sound.
          - update(sprites)                                : Detects collision with Square; if collected,
                                                                deactivates, restores health (up to max),
                                                                increases score, plays sound, and signals removal.
          - isColliding(player)                            : Returns true if potion overlaps the player's circle.
          - draw(ctx)                                      : Renders the potion image at its coordinates if active.

       Dependencies:
          - Sprite                                            : Base class for drawable/updatable elements.
          - Square                                            : Player class for collision detection and health/score updates.
          - Image                                             : For loading and drawing the potion graphic.
          - Audio                                             : For playing the collection sound effect.

--------------------------------------------------------------------------------------------*/
class Potion extends Sprite {
    constructor(x, y, size, imageSrc) {
      super();
      this.x = x;
      this.y = y;
      this.size = size;
      this.isActive = true;
      this.reset = false;
      this.image = new Image();
      this.image.src = imageSrc;
      this.collectSound = new Audio('sounds/StarCollected.mp3');
    }
  
    update(sprites) {
      const player = sprites.find(sprite => sprite instanceof Square);

      if (player && this.isColliding(player)) {
        this.isActive = false;

        if (player.health < 3) {
          player.health += 1;
        }
        player.ScoreDisplay.scoreDisplay += 20;
        this.collectSound.currentTime = 0;
        this.collectSound.play();
      }
      return !this.isActive || this.reset;
    }
  
    isColliding(player) {
      return (
        this.x < player.x + player.radius &&
        this.x + this.size > player.x - player.radius &&
        this.y < player.y + player.radius &&
        this.y + this.size > player.y - player.radius
      );
    }
  
    draw(ctx) {
      if (!this.isActive) 
        return;

      ctx.drawImage(this.image,this.x, this.y, this.size, this.size);
    }
  }
  
// Class: Background
/*-- Background -------------------------------------------------------------------------
    
       This class represents a static full-screen background image for the game,
       rendering behind all other sprites and remaining unchanged over time.

       Key Functions:
          - constructor(game, imageSrc)                    : Initializes game context, active state,
                                                               and loads the background image.
          - update(sprites, keys)                          : Returns `true` immediately so the background
                                                               remains persistent until deactivated.
          - draw(ctx)                                      : Draws the background image stretched to the canvas size.

       Dependencies:
          - Sprite                                            : Base class for all drawable/updatable elements.
          - GameEngine                                        : Provides the canvas dimensions.
          - Image                                             : For loading and drawing the background graphic.

--------------------------------------------------------------------------------------------*/
class Background extends Sprite {
    constructor(game,imageSrc) {
        super();
        this.game = game;
        this.isActive = true;  
        this.image = new Image();
        this.image.src = imageSrc;
    }

    update(sprites, keys) {
        return !this.isActive;  
    }

    draw(ctx) {
        ctx.drawImage(this.image, 0, 0,  this.game.canvas.width, this.game.canvas.height);
    }
}

// Class: LevelDisplay
/*-- LevelDisplay -------------------------------------------------------------------------
    
       This class renders the current level and total levels in the game UI at a fixed position.

       Key Functions:
          - constructor(currentLevel, totalLevels)      : Initializes level numbers and display coordinates/style.
          - update()                                    : No-op; the display does not modify its own state.
          - draw(ctx)                                   : Draws “Level: X/Y” text using the canvas context.

       Dependencies:
          - Sprite                                       : Base class for drawable/updatable elements.
          - CanvasRenderingContext2D                     : Provides text drawing APIs for rendering the display.

--------------------------------------------------------------------------------------------*/
class LevelDisplay extends Sprite {
    constructor(currentLevel, totalLevels) {
        super();
        this.level = currentLevel;
        this.total = totalLevels;
        this.x = 10;
        this.y = 10;
        this.font = '20px Arial';
        this.color = 'black';
    }

    update() {
        return false;
    }

    draw(ctx) {
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Level: ${this.level}/${this.total}`, this.x, this.y);
    }
}

// Class: PauseScreen
/*-- PauseScreen -------------------------------------------------------------------------
    
       This class manages the game’s paused state, playing sounds on pause/resume,
       and rendering a translucent overlay with pause icon and instructions.

       Key Functions:
          - constructor(game)                            : Initializes game context, inactive state,
                                                            and loads pause/resume sounds.
          - update(sprites, keys)                        : Toggles `isActive` on "p"/"c" key presses,
                                                            plays corresponding sound effects.
          - draw(ctx)                                    : When active, draws a semi‐transparent overlay,
                                                            pause icon, and text prompt to resume.

       Dependencies:
          - Sprite                                        : Base class for drawable/updatable elements.
          - GameEngine                                    : Provides canvas dimensions.
          - Audio                                         : For playing pause and resume sound effects.
          - CanvasRenderingContext2D                      : For drawing overlay, icons, and text.

--------------------------------------------------------------------------------------------*/
class PauseScreen extends Sprite {
    constructor(game) {
        super();
        this.game = game;
        this.isActive = false;
        this.pauseSound  = new Audio('sounds/Pause.mp3');
        this.resumeSound = new Audio('sounds/Resume.mp3');
    }

    update(sprites, keys) {
        if (keys["p"]) {
            this.isActive = true;
            this.pauseSound.play();
        }
        if (keys["c"]) {
            this.isActive = false;
            this.resumeSound.play();
        }
        return false;
    }

    draw(ctx) {
        if (!this.isActive) return;
        ctx.save();
    
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.globalAlpha = 1;
    
        const cx = ctx.canvas.width / 2;
        const cy = ctx.canvas.height / 2 - 120;
    
        ctx.fillStyle = "#fff";
        ctx.fillRect(cx - 22, cy - 30, 12, 60);
        ctx.fillRect(cx + 10, cy - 30, 12, 60);
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Game Paused", cx, cy + 50);
        ctx.font = "20px Arial";
        ctx.fillStyle = "#fff";
        ctx.fillText('Press "C" to continue', cx, cy + 85);
        ctx.restore();
    }
}

// Class: GridSpawner
/*-- GridSpawner ---------------------------------------------------------------------------
    
       This utility class converts compact 2‑D numeric “tile maps” into fully instanced
       game objects (obstacles, enemies, pickups, boss, etc.).  Each call to `initialize`
       walks a predefined array of codes, calculates world coordinates from grid indices,
       and pushes the correct sprite into the main GameEngine.  It lets you build a whole
       level visually in a spreadsheet‑like matrix without writing manual addSprite calls.

       How it works:
          • `gridSize` defines the pixel size of each tile (50 px² by default).  
          • `rows` and `cols` describe the virtual map bounds; extra cells default to 0.  
          • `initialize(levelNumber)` picks a level map from `levelGrids`, loops over every
            row/col, builds (x, y) = (col × gridSize, row × gridSize), then switches on the
            numeric code to spawn:  
                0  →  empty space  
                1  →  ground/brick obstacle  
                2  →  BasicEnemy (patrol)  
                3  →  Boss  
                4  →  Flag (level goal)  
                5  →  BasicEnemy (ram)  
                6  →  BasicEnemy (ninja)  
                7  →  AttackEnemy (shooter)  
                8  →  Potion (health/star coin)  
                9  →  Decorative tree obstacle  
                10 →  Large crate obstacle  
                11 →  Brick block  
                12 →  Wooden block  
          • The method is tolerant of missing rows/columns: `rowData[col] || 0`.

       Key Functions:
          - constructor(game)                            : Stores game reference and grid parameters.
          - initialize(levelNumber)                      : Parses the matrix for the requested level
                                                            and spawns all sprites with correct offsets.

       Dependencies:
          - Sprite                                        : Base class inherited for uniform update/draw API.
          - GameEngine                                    : Provides `addSprite` and canvas size.
          - Obstacle                                      : Static obstacles pieces (codes 1, 9, 10, 11, 12).
          - Flag                                          : Level completion object (code 4).
          - BasicEnemy                                    : Patrol/Ram/Ninja variants (codes 2, 5, 6).
          - AttackEnemy                                   : Ranged enemy (code 7).
          - Boss                                          : End‑level boss (code 3).
          - Potion                                        : Collectible health/score item (code 8).

--------------------------------------------------------------------------------------------*/
class GridSpawner extends Sprite {
    constructor(game) {
      super();
      this.game = game;
      this.gridSize = 50;
      this.rows = 14;
      this.cols = 84;
    }
  
    initialize(levelNumber) {
      const levelGrids = {        
          1: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 , 0, 0, 0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 , 0, 0, 0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,0,0,0,0],
            [0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0],
            [0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0],
            [12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,0,0,0,0],
            [0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 0, 8, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0],
            [12, 0, 0, 0, 0, 0, 0, 0,0, 0, 8, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 12, 12, 12, 12, 12, 12, 8, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 12, 0, 0, 0,0 ,0,0,0,0, 0,0,0,0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 12, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 11, 0, 0, 0, 11, 11, 0, 0, 0, 11, 0, 0, 0, 0, 11, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0,0,0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 8, 1, 11, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 11, 0, 0, 0, 11, 11, 0, 0, 0, 11, 0, 0, 0, 0, 11, 11, 1, 8, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 6, 0, 1, 11, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 8, 0, 7, 0, 0, 0, 11, 11, 0, 0, 0, 11, 11, 0, 2, 0, 11, 0, 0, 0, 0, 11, 11, 11, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1, 1, 1, 1, 1, 1, 1, 1, 11, 11, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 11, 0, 2, 0, 11, 11, 1, 1, 1, 11, 0, 0, 0, 0, 11, 11, 11, 11, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,  0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0 , 3, 0, 0,0,0,0,0]
          ],
          2: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 6, 0, 6, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12, 11, 12, 11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0,0,0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 6, 0, 0, 7, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0 ,0, 0, 0, 0, 0, 0, 0,  0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12, 12, 12, 12, 12, 12, 12, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,7, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 0, 0, 0, 0,0, 11, 11, 0,0,11, 11, 0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 10, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 1, 8, 0, 0, 0, 0, 11, 11, 0, 0, 11, 11, 0, 0,0,0,0,0, 0,0,0,0,0,0,0,0,0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 5, 0, 0, 0, 0,0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 5, 0, 10, 0, 11, 11, 1, 0, 8, 0, 0, 11, 11, 0, 8, 11, 11, 0, 0,0,0,0,0,0,0, 0, 0, 0,0,0,0,0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 11, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 11, 11, 1, 1,1,1,11,11,1,1,11,11,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,4,0,0]
          ]
      };
  
      const grid = levelGrids[levelNumber] || [];
  
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
            const rowData = grid[row] || [];
            const cell = rowData[col] || 0;
            const x = col * this.gridSize;
            const y = row * this.gridSize;
  
          switch (cell) {
            case 4:
              this.game.addSprite(new Flag(x, y + this.gridSize, this.gridSize *3, this.game,'images/Flag.png'));
              break;
            case 1:
              this.game.addSprite(new Obstacle(x, y - 10, this.gridSize, this.gridSize + 10, 'images/obstacle.png'));
              break;
            case 9:
              this.game.addSprite(new Obstacle(x, y, this.gridSize, this.gridSize, 'images/obstacleTree.png')); 
               break;
            case 11:
             this.game.addSprite(new Obstacle(x, y, this.gridSize, this.gridSize, 'images/obstacleBrick.png'));
             break;
            case 12:
              this.game.addSprite(new Obstacle(x, y, this.gridSize, this.gridSize, 'images/obstacleWood.png'));
              break;
            case 2:
              this.game.addSprite(new BasicEnemy(x, y, this.gridSize * 1.3, this.game, 2, "patrol"));
              break;
            case 3:
              this.game.addSprite(new Boss(x, y - this.gridSize * 2, this.gridSize * 2, this.gridSize * 3, this.game));
              break;
            case 5:
              this.game.addSprite(new BasicEnemy(x, y, this.gridSize * 1.55 , this.game, 1, "ram"));
              break;
            case 6:
              this.game.addSprite(new BasicEnemy(x, y, this.gridSize * 1.3, this.game, 2, "ninja"));
              break;
            case 7:
              this.game.addSprite(new AttackEnemy(x, y, this.gridSize , this.game, 2));
              break;
            case 8:
              this.game.addSprite(new Potion(x, y, this.gridSize,'images/starCoins.png' ));
              break;
            case 10:
              this.game.addSprite(new Obstacle(x, y, this.gridSize * 2 , this.gridSize* 2, 'images/obstacleCrates.png'));
              break;
            }
        }
    }
    }
}

// Class: LevelManager
/*-- LevelManager ------------------------------------------------------------------------
    
       Central flow‑control sprite that supervises the entire play session:
       • Tracks the player’s Square instance as soon as it appears in the sprite list.  
       • Detects “Game Over” when the player’s health reaches 0; freezes hostile sprites
         and spawns a GameOver screen.  
       • Detects “Level Complete” via a reached Flag or by crossing the canvas edge;  
         ‑ Plays a “level complete” chime.  
         ‑ Advances to the next level if one exists, otherwise triggers GameWon logic.  
       • Detects final victory, freezes all hostile activity, and spawns the GameWon screen.  
       • Exposes `restartGame()` to reset health, score, and reload the current level after
         a GameOver/GameWon event.

       Key Functions:
          - constructor(game)                             : Stores game reference, null‑player placeholder,
                                                             flags for game‑over / game‑won, and loads
                                                             the “level complete” audio cue.
          - update(sprites, keys)                         : Lazy‑binds player, checks health ➔ GameOver,
                                                             checks flag reach / canvas exit ➔ level advance
                                                             or victory, and handles sound + sprite cleanup.
          - restartGame()                                 : Clears end‑state flags, restores player health
                                                             & score, and reloads the current level index.

       Dependencies:
          - Sprite         — Base class; lets LevelManager live in the sprite loop.  
          - GameEngine     — Provides `levels`, `currentLevelIndex`, `changeLevel`, `addSprite`, and canvas.  
          - Square         — Player avatar whose health/position/score are inspected.  
          - Flag           — Goal object with `isReached` flag.  
          - Bullet, BossLaser, AttackEnemy, BasicEnemy, Boss — Hostile sprites to disable on end‑states.  
          - GameOver, GameWon — UI screens added on defeat/victory.  
          - Audio          — Used for the “Level Complete” sound effect.

--------------------------------------------------------------------------------------------*/
class LevelManager extends Sprite {
    constructor(game) {
      super();
      this.game = game;
      this.player = null;
      this.isGameOver = false;
      this.isGameWon  = false;
      this.levelCompleteSound = new Audio('sounds/Level Complete.mp3');
    }
  
    update(sprites, keys) {
      if (!this.player) {
        this.player = sprites.find(sprite => sprite instanceof Square);
      }
      if (!this.player) 
        return false;
  
      if (this.player.health <= 0 && !this.isGameOver) {
        this.isGameOver = true;
        sprites.forEach(sprite => {
            if ( sprite instanceof Bullet || sprite instanceof BossLaser || sprite instanceof AttackEnemy ||
                sprite instanceof Boss || sprite instanceof BasicEnemy ) {
                sprite.isActive = false;
            }
        });
        this.game.addSprite(new GameOver(this.player.ScoreDisplay, this.game));
        return false;
      }

      const flag = sprites.find(sprite => sprite instanceof Flag && sprite.isReached);
      if (flag && !this.isGameWon) {
        const lastIndex = this.game.levels.length - 1;
        if (this.game.currentLevelIndex < lastIndex) {
            this.levelCompleteSound.play();
            this.game.changeLevel(this.game.currentLevelIndex + 1);

        } else {
          this.isGameWon = true;
          sprites.forEach(sprite => {
            if ( sprite instanceof Bullet || sprite instanceof BossLaser || sprite instanceof AttackEnemy ||
              sprite instanceof Boss || sprite instanceof BasicEnemy ) {
              sprite.isActive = false;
            }
          });

          this.game.addSprite(new GameWon(this.player.ScoreDisplay, this.game));
        }

        return false;  
      }
  
      if (this.player.x > this.game.canvas.width - 50) {
        const lastIndex = this.game.levels.length - 1;

        if (this.game.currentLevelIndex < lastIndex) {
          this.game.changeLevel(this.game.currentLevelIndex + 1);

        } else {

          if (!this.isGameWon) {
            this.isGameWon = true;
            sprites.forEach(sprite => {
              if (sprite instanceof Bullet || sprite instanceof BossLaser || sprite instanceof AttackEnemy ||
                sprite instanceof Boss || sprite instanceof BasicEnemy) {
                sprite.isActive = false;
            }
        });
            this.game.addSprite(new GameWon(this.player.ScoreDisplay, this.game));
          }
        }
        return false;
      }
  
    return false;
    }
  
    restartGame() {
      this.isGameOver = false;
      this.isGameWon  = false;
      this.player.health  = 3;
      this.player.ScoreDisplay.scoreDisplay = 0;
      this.game.changeLevel(this.game.currentLevelIndex);
    }
}
// Class: Level1
/*-- Level1 -------------------------------------------------------------------------------
    
       First playable stage of the game.  `initialize()` sets up all sprites, background
       music, obstacles, player start position, UI overlays, and supervisory managers.

       What it does in initialize():
         1. Starts looping background music (“GameSound.mp3”)if not already playing, which is the same sound for level 1&2 .
         2. Adds a static Background sprite (image for Level 1).
         3. Adds a PauseScreen so the player can toggle pause/resume.
         4. Uses GridSpawner level‑code 1 to populate  obstacles, enemies, etc.
         5. Adds a full‑width Ground collider at the bottom of the canvas.
         6. Creates the Square player at the left edge of the ground, sets its
            groundLevel, and positions the ScoreDisplay in the HUD.
         7. Adds HUD elements: ScoreDisplay and LevelDisplay (showing “1 / total”).
         8. Inserts LevelManager to monitor victory/defeat and level transitions.

       Dependencies:
          - Level            : Abstract base class providing game reference and addSprite hook.
          - GameEngine       : Supplies canvas, sprite list, and global level array.
          - Audio            : For looping background music.
          - Background       : Full‑screen backdrop graphic.
          - PauseScreen      : Pause/continue overlay.
          - GridSpawner      : Converts tile map #1 into sprites (obstacles, enemies, etc.).
          - Ground           : Bottom collision rectangle.
          - Square           : Player avatar (also houses ScoreDisplay).
          - ScoreDisplay     : HUD points counter linked to the player.
          - LevelDisplay     : HUD level indicator (“Level 1 / total”).
          - LevelManager     : Oversees game‑over, level completion, and victory screens.

--------------------------------------------------------------------------------------------*/
class Level1 extends Level {
    initialize() {
        if (!this.levelMusic) {
            this.levelMusic = new Audio('sounds/GameSound.mp3');
            this.levelMusic.loop = true;
            this.levelMusic.play();
        }

        this.game.addSprite(new Background(this.game, 'images/backgroundLevel1.png'));
        this.game.addSprite(new PauseScreen(this.game));
        const spawner = new GridSpawner(this.game);
        spawner.initialize(1);
        this.game.addSprite(new Ground(0,this.game.canvas.height - spawner.gridSize,
             this.game.canvas.width, spawner.gridSize));
    
        const player = new Square(50, (spawner.rows - 1) * spawner.gridSize - 25, 25, 5 ,this.game);
        player.groundLevel = player.y;
        player.ScoreDisplay.x = 10;
        player.ScoreDisplay.y = 40;
    
        this.game.addSprite(player);
        this.game.addSprite(player.ScoreDisplay);
        this.game.addSprite(new LevelDisplay(1,this.game.levels.length));
        this.game.addSprite(new LevelManager(this.game));
    }
}
// Class: Level2
/*-- Level2 -------------------------------------------------------------------------------
    
       Second stage of the game.  `initialize()` lays out all sprites for Level 2,
       keeping the same overall structure as Level 1 but loading a different tile map
       and background artwork.

       What it does in initialize():
         1. Adds a Background sprite using `backgroundLevel2.png`.
         2. Adds a PauseScreen for pause/resume functionality.
         3. Uses GridSpawner level‑code 2 to populate obsteacles, enemies, boss, etc.
         4. Adds a full‑width Ground collider at canvas bottom.
         5. Instantiates the Square player at the left edge of the ground,
            aligns its `groundLevel`, and positions its ScoreDisplay (HUD).
         6. Adds HUD overlays: ScoreDisplay and LevelDisplay (“Level 2 / total”).
         7. Inserts LevelManager to oversee game‑over, level switching, and victory.

       Dependencies:
          - Level, GameEngine       – Provides sprite management & level switching.
          - Background              – Level‑specific backdrop.
          - PauseScreen             – Pause/continue overlay.
          - GridSpawner             – Generates sprites from tile map #2.
          - Ground                  – Bottom floor collider.
          - Square & ScoreDisplay   – Player avatar and HUD score.
          - LevelDisplay            – Shows current level (“2 / …”).
          - LevelManager            – Handles win/lose conditions and progression.

--------------------------------------------------------------------------------------------*/
class Level2 extends Level {
    initialize() {
      this.game.addSprite(new Background(this.game, 'images/backgroundLevel2.png'));
      this.game.addSprite(new PauseScreen(this.game));
      const spawner = new GridSpawner(this.game);
      spawner.initialize(2);
      this.game.addSprite(new Ground(0, this.game.canvas.height - spawner.gridSize, 
        this.game.canvas.width, spawner.gridSize));
  
      const player = new Square( 50, (spawner.rows - 1) * spawner.gridSize - 25, 25, 5, this.game);
      player.groundLevel = player.y;
      player.ScoreDisplay.x = 10;
      player.ScoreDisplay.y = 40;
  
      this.game.addSprite(player);
      this.game.addSprite(player.ScoreDisplay);
      this.game.addSprite(new LevelDisplay(2, this.game.levels.length));
      this.game.addSprite(new LevelManager(this.game));
    }
}
  
let game = new Game();
game.addSprite(new StartScreen(game));
game.animate();
