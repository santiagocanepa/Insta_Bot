export function getRandomWaitTime(min: number, max: number): number {
  // Genera un tiempo de espera aleatorio entre min y max
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getHumanizedWaitTime(min: number, max: number): number {
  // Genera un tiempo de espera aleatorio con una distribución que simule un comportamiento humano
  const base = Math.random() * (max - min) + min
  return Math.floor(base + Math.random() * 10) // Añade una pequeña variación adicional
}
