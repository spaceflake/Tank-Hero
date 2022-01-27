class Zombie extends Entity {
  constructor(velo: number, y: number) {
    const size = height * 0.1
    const health = 3
    const position = createVector(width, y)
    const img = images.zombies.zom1
    // const sound: p5.SoundFile = 2
    const points = 100
    const damage = 0
    const ishit = false
    const velocity: p5.Vector = createVector(-velo - 2, 0)
    super(size, health, position, img, points, damage, ishit, velocity)
  }
}
 