export interface Territory {
  id: string
  ownerId: string | null
  troops: number
  neighbors: string[]
}