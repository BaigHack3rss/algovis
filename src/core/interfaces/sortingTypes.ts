/**
 * Types of sorting actions.
 * @type SortingAction
 */
export type SortingAction = 'compare' | 'swap' | 'insert' | 'merge'

/**
 * Interface representing a sorting operation.
 * @interface SortOperation
 */
export interface SortOperation {
  type: string
  indices: number[]
  snapshot: number[]
  meta?: {
    range?: [number, number]
    pivot?: number
    depth?: number
    // one or more subarray slices to visualize
    slices?: [number, number][]
  }
}
