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
  type: SortingAction
  indices: [number, number] | [number]
  snapshot: number[]
}
