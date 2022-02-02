class Human extends Entity {
  constructor(y: number) {
    const size = height * 0.15
    const health = 1
    const position = createVector(width, y)
    const img = images.humans.human1
    const sound = sounds.saved
    const points = 10
    const damage = 0
    const ishit = false
    const velocity: p5.Vector = createVector(-2, 0)
    const hitBoxSize: p5.Vector = createVector(size * 0.3, size * 0.9)
    const hitBoxPosition = createVector(size * 0.2, size * 0.09)

    super(
      size,
      health,
      position,
      img,
      points,
      damage,
      ishit,
      sound,
      hitBoxPosition,
      hitBoxSize,
      velocity
    )
  }
}
