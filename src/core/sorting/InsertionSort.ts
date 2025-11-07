import type { SortOperation } from '@/core/interfaces/sortingTypes'

/**
 * This class implements the Insertion Sort algorithm.
 */
export class InsertionSort {
  private arr: number[]
  private info: string = `Builds the final sorted array one item at a time by comparing and inserting elements.
  Time: O(n^2) | Space: O(1)`

  /**
   * Creates an instance of InsertionSort.
   * @param {number[]} arr - The array of numbers to be sorted.
   */
  constructor(arr: number[]) {
    this.arr = arr
  }

  /**
   * Sorts an array of numbers in ascending order using the Insertion Sort algorithm.
   * @param arr - The array of numbers to be sorted.
   * @returns The sorted array.
   */
  public sort(arr?: number[]): number[] {
    this.run(arr)
    return [...this.arr]
  }

  /**
   * Generates the sequence of operations performed by the Insertion Sort algorithm.
   * @param arr - Optional array of numbers to be sorted. Falls back to the instance array when omitted.
   * @returns The list of sorting operations executed by the algorithm.
   */
  public run(arr?: number[]): SortOperation[] {
    const source = arr ?? this.arr
    const working = [...source]
    const operations: SortOperation[] = []

    for (let i = 1; i < working.length; i++) {
      const key = working[i]

      if (key === undefined) {
        continue
      }

      let j = i - 1
      let targetIndex = i

      while (j >= 0) {
        const current = working[j]

        if (current === undefined) {
          break
        }

        operations.push({
          type: 'compare',
          indices: [j, targetIndex],
          snapshot: [...working],
        })

        if (current <= key) {
          break
        }

        working[j + 1] = current
        targetIndex = j

        operations.push({
          type: 'swap',
          indices: [j, j + 1],
          snapshot: [...working],
        })

        j--
      }

      working[targetIndex] = key
      operations.push({
        type: 'insert',
        indices: [targetIndex],
        snapshot: [...working],
      })
    }

    this.arr = working

    return operations
  }

  public getInfo(): string {
    return this.info
  }
}
