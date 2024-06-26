import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Funciones para la lista de follow
// Funciones para la lista de nofollow
export function getUsernamesNoFollow(): string[] {
  const jsonPath = path.resolve(__dirname, './usersFollowingAndGenderchek.json')
  try {
    const data = fs.readFileSync(jsonPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading JSON file at ${jsonPath}:`, error)
    return []
  }
}

export function saveUsernameNoFollow(username: string): void {
  const jsonPath = path.resolve(__dirname, './usersFollowingAndGenderchek.json')
  try {
    const data = fs.readFileSync(jsonPath, 'utf-8')
    const usernames = JSON.parse(data)

    usernames.push(username)

    fs.writeFileSync(jsonPath, JSON.stringify(usernames, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error writing to JSON file at ${jsonPath}:`, error)
  }
}

// Funciones para la lista de solo follow
export function getUsernamesOnlyFollow(): string[] {
  const jsonPath = path.resolve(__dirname, './usersOnlyFollowing.json')
  try {
    const data = fs.readFileSync(jsonPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading JSON file at ${jsonPath}:`, error)
    return []
  }
}

export function saveUsernameOnlyFollow(username: string): void {
  const jsonPath = path.resolve(__dirname, './usersOnlyFollowing.json')
  try {
    const data = fs.readFileSync(jsonPath, 'utf-8')
    const usernames = JSON.parse(data)

    usernames.push(username)

    fs.writeFileSync(jsonPath, JSON.stringify(usernames, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error writing to JSON file at ${jsonPath}:`, error)
  }
}

// Funciones para la lista de unfollow
export function getUsernamesUnfollowed(): string[] {
  const jsonPath = path.resolve(__dirname, './usersFollowingChekAndFollowers.json')
  try {
    const data = fs.readFileSync(jsonPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading JSON file at ${jsonPath}:`, error)
    return []
  }
}

export function saveUsernameUnfollowed(username: string): void {
  const jsonPath = path.resolve(__dirname, './usersFollowingChekAndFollowers.json')
  try {
    const data = fs.readFileSync(jsonPath, 'utf-8')
    const usernames = JSON.parse(data)

    usernames.push(username)

    fs.writeFileSync(jsonPath, JSON.stringify(usernames, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error writing to JSON file at ${jsonPath}:`, error)
  }
}

// Funciones para el recuento diario
export function getDailyCounts(jsonPath: string): { [date: string]: number } {
  try {
    if (!fs.existsSync(jsonPath)) {
      return {}
    }
    const data = fs.readFileSync(jsonPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading JSON file at ${jsonPath}:`, error)
    return {}
  }
}

export function updateDailyCount(jsonPath: string): void {
  try {
    const counts = getDailyCounts(jsonPath)
    const today = new Date().toISOString().split('T')[0] // Obtener la fecha en formato YYYY-MM-DD
    counts[today] = (counts[today] || 0) + 1

    fs.writeFileSync(jsonPath, JSON.stringify(counts, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error updating JSON file at ${jsonPath}:`, error)
  }
}
// Verificar si se ha alcanzado el límite diario
export function checkDailyLimit(jsonPath: string, limit: number): boolean {
  const counts = getDailyCounts(jsonPath)
  const today = new Date().toISOString().split('T')[0] // Obtener la fecha en formato YYYY-MM-DD
  return (counts[today] || 0) >= limit
}
