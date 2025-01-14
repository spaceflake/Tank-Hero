class GameBoard {
  private game: IGame
  private background: p5.Image
  private xPos: number
  private xPos2: number

  private scrollSpeed: number
  private gameCounter: GameCounter
  private entities: Entity[]
  private tank: Tank
  private sideBoard: SideBoard
  private zombieSpawnTime: number
  private humanSpawnTime: number
  private obstacleSpawnTime: number
  private bossSpawnTime: number
  private powSpawnTime: number
  private heartSpawnTime: number
  private lastSpawnY?: number

  constructor(game: IGame) {
    this.game = game
    this.gameCounter = new GameCounter()
    this.sideBoard = new SideBoard()
    this.tank = new Tank()
    this.entities = []

    this.background = images.bgImg
    this.xPos = 0
    this.xPos2 = width
    this.scrollSpeed = 2
    this.zombieSpawnTime = random(500, 2500)
    this.obstacleSpawnTime = 4500
    this.humanSpawnTime = 13500
    this.bossSpawnTime = 20000
    this.powSpawnTime = random(15000, 25000)
    this.heartSpawnTime = random(15000, 20000)
  }

  private scroll() {
    image(this.background, this.xPos, 0, width, height)
    image(this.background, this.xPos2, 0, width, height)

    this.xPos -= this.scrollSpeed
    this.xPos2 -= this.scrollSpeed

    if (this.xPos < -width) {
      this.xPos = width
    }
    if (this.xPos2 < -width) {
      this.xPos2 = width
    }
  }

  private spawnEntity() {
    this.zombieSpawnTime -= deltaTime
    this.obstacleSpawnTime -= deltaTime
    this.humanSpawnTime -= deltaTime
    this.bossSpawnTime -= deltaTime
    this.powSpawnTime -= deltaTime
    this.heartSpawnTime -= deltaTime

    if (this.bossSpawnTime < 0) {
      this.lastSpawnY = this.getRandomY()
      this.entities.push(new Boss(this.scrollSpeed * .2, this.lastSpawnY))
      this.bossSpawnTime = 20000
    }
    if (this.zombieSpawnTime < 0) {
      this.lastSpawnY = this.getRandomY()
      this.entities.push(new Zombie(this.scrollSpeed * .2, this.lastSpawnY))
      this.zombieSpawnTime = random(2000, 3000)
    }
    if (this.obstacleSpawnTime < 0) {
      this.lastSpawnY = this.getRandomY()
      let randomObs = [new Truck(this.lastSpawnY), new RoadBlock(this.lastSpawnY)]
      this.entities.push(randomObs[round(random(0,1))])
      this.obstacleSpawnTime = 4500
    }
    if (this.humanSpawnTime < 0) {
      this.lastSpawnY = this.getRandomY()
      this.entities.push(new Human(this.lastSpawnY))
      this.humanSpawnTime = 13500
    }
    if (this.powSpawnTime < 0) {
      this.lastSpawnY = this.getRandomY()
      this.entities.push(new FuelTank(this.lastSpawnY))
      this.powSpawnTime = random(10000, 15000)
    }
    if (this.heartSpawnTime < 0) {
      this.lastSpawnY = this.getRandomY()
      this.entities.push(new Heart(this.lastSpawnY))
      this.heartSpawnTime = random(10000, 15000)
    }
  }

  private getRandomY(): number {
    const cityHeight = height * .3
    const y = random(cityHeight, height * .8)
    if (y === this.lastSpawnY) {
      return this.getRandomY()
    }
    return y
  }

  private hitEntity(entity: Entity) {
    const hitBox = entity.getHitBox()
    const tankHitBox = this.tank.getHitBox()
    if (
      entity instanceof Truck ||
      entity instanceof Zombie ||
      entity instanceof Human ||
      entity instanceof Boss ||
      entity instanceof FuelTank ||
      entity instanceof Heart || 
      entity instanceof RoadBlock
    ) {
      if (
        hitBox.x < tankHitBox.x + tankHitBox.width &&
        hitBox.x + hitBox.width > tankHitBox.x &&
        hitBox.y < tankHitBox.y + tankHitBox.height &&
        hitBox.y + hitBox.height > tankHitBox.y &&
        !entity.isHit
      ) {
        if (entity instanceof FuelTank) {
          this.entities.splice(this.entities.indexOf(entity), 1)
          entity.pickPowerUp(this.gameCounter, entity)
          sounds.fuelPickup.play()
        }
        if (entity instanceof Heart) {
          this.entities.splice(this.entities.indexOf(entity), 1)
          entity.pickPowerUp(this.gameCounter, entity)
          sounds.heartPickup.play()
        }

        if (entity instanceof Boss) {
          entity.hitDamage(entity)
          sounds.bossDeath.play()
          this.game.gameOver()
        }
        if (entity instanceof Truck || entity instanceof RoadBlock) {
          this.gameCounter.decreaseTankHealth()
          entity.hitDamage(entity)
          sounds.crash.play()
          if (!this.gameCounter.getLives()) {
            this.game.gameOver()
          }
        }
        if (entity instanceof Zombie) {
          this.gameCounter.decreaseTankHealth()
          this.gameCounter.countKilledZombies(entity)
          this.gameCounter.pointPerEntity(entity.points)
          entity.hitDamage(entity)
          this.tank.sound.play()
          if (!this.gameCounter.getLives()) {
            this.game.gameOver()
          }
          
        }
        if (entity instanceof Human) {
          this.sideBoard.addLives()
          this.gameCounter.countRescuedHumans(entity)
          this.entities.splice(this.entities.indexOf(entity), 1)
        }
      }
      if (entity instanceof Zombie || entity instanceof Boss) {
        for (const entityPlus of this.entities) {
          if (entityPlus instanceof Human) {
            const zombiehitBox = entity.getHitBox()
            const humanHitBox = entityPlus.getHitBox()
            if (
              zombiehitBox.x < humanHitBox.x + humanHitBox.width &&
              zombiehitBox.x + zombiehitBox.width > humanHitBox.x &&
              zombiehitBox.y < humanHitBox.y + humanHitBox.height &&
              zombiehitBox.y + zombiehitBox.height > humanHitBox.y &&
              !entityPlus.isHit
            ) {
              entityPlus.removeHealth(entityPlus)
            }
          }
        }
      }
    }

    if (entity instanceof Projectile) {
      for (const entityPlus of this.entities) {
        if (
          entityPlus instanceof Zombie ||
          entityPlus instanceof Human ||
          entityPlus instanceof Boss
        ) {
          const hitBox = entity.getHitBox()
          const entityHitBox = entityPlus.getHitBox()
          if (
            hitBox.x < entityHitBox.x + entityHitBox.width &&
            hitBox.x + hitBox.width > entityHitBox.x &&
            hitBox.y < entityHitBox.y + entityHitBox.height &&
            hitBox.y + hitBox.height > entityHitBox.y &&
            !entityPlus.isHit
          ) {
            if (entityPlus instanceof Zombie && entityPlus.getHealth() == 1) {
              entityPlus.hitDamage(entityPlus)
              this.gameCounter.pointPerEntity(entityPlus.points)
              this.gameCounter.countKilledZombies(entityPlus)
              sounds.entityKilled.play()
            }
            if (entityPlus instanceof Human) {
              this.gameCounter.removePoint(entityPlus.points)
              this.gameCounter.countKilledHumans(entityPlus)
              sounds.humanDeath.play()
            }
            if (entityPlus instanceof Boss && entityPlus.getHealth() == 1) {
              entityPlus.hitDamage(entityPlus)
              sounds.bossDeath.play()
            }
            entity.removeHealth(entityPlus)
            this.entities.splice(this.entities.indexOf(entity), 1)
          }
        }
      }
    }
  }

  private entityEndOfLine(entity: Entity) {
    if (entity.position.x < width / 6) {
      if (entity instanceof Zombie && !entity.isHit) {
        this.gameCounter.removePoint(entity.points * 3)
        this.gameCounter.getRescuedHumanCount().pop()
        this.sideBoard.rescuedHumans.pop()
        entity.sound.play()
      }
      if(entity instanceof Boss && !entity.isHit) {
        console.log('boss nådde')
        this.game.gameOver()
      }
      this.entities.splice(this.entities.indexOf(entity), 1)
    }
    if (entity instanceof Projectile && entity.position.x > width) {
      this.entities.splice(this.entities.indexOf(entity), 1)
    }
  }

  public update() {
    this.spawnEntity()
    const newProjectile = this.tank.update()
    if (newProjectile) {
      this.entities.push(newProjectile)
    }
    for (const entity of this.entities) {
      if (entity instanceof Zombie || entity instanceof Human) {
        entity.animateEntity(entity)
      }
      entity.update()
      this.entityEndOfLine(entity)
      this.hitEntity(entity)
    }
    this.gameCounter.update()

  }

  public draw() {
    this.scroll()
    this.sideBoard.draw()
    this.gameCounter.draw()

    for (const entity of this.entities) {
      entity.draw()
    }
    this.tank.draw()
    this.gameCounter.drawHearts(this.tank)
  }
}
