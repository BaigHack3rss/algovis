import type { SortOperation } from '@/core/interfaces/sortingTypes'

/**
 * This class implements the Selection Sort algorithm.
 */

export class SelectionSort {
  private arr: number[]
  private info: string = `Selects the smallest (or largest) element from the unsorted portion and moves it to the sorted portion.
  Time: O(n^2) | Space: O(1)`

  /**
   * Creates an instance of SelectionSort.
   * @param arr - The array of numbers to be sorted.
   */
  constructor(arr: number[]) {
    this.arr = arr
  }

  /**
   * Sorts an array of numbers in ascending order using the Selection Sort algorithm.
   * @param arr - The array of numbers to be sorted.
   * @returns The sorted array.
   */
  public sort(arr?: number[]): number[] {
    this.run(arr)
    return [...this.arr]
  }

  /**
   * Generates the sequence of operations performed by the Selection Sort algorithm.
   * @param arr - Optional array of numbers to be sorted. Falls back to the instance array when omitted.
   * @returns The list of sorting operations executed by the algorithm.
   */
  public run(arr?: number[]): SortOperation[] {
    const source = arr ?? this.arr
    const working = [...source]
    const operations: SortOperation[] = []

    for (let i = 0; i < working.length - 1; i++) {
      let minIndex = i
      let minValue = working[minIndex]

      if (minValue === undefined) {
        continue
      }

      for (let j = i + 1; j < working.length; j++) {
        const candidate = working[j]

        if (candidate === undefined) {
          continue
        }

        operations.push({
          type: 'compare',
          indices: [j, minIndex],
          snapshot: [...working],
        })

        if (candidate < minValue) {
          minIndex = j
          minValue = candidate
        }
      }

      if (minIndex !== i) {
        const current = working[i]

        if (current !== undefined) {
          working[i] = minValue
          working[minIndex] = current

          operations.push({
            type: 'swap',
            indices: [i, minIndex],
            snapshot: [...working],
          })
        }
      }
    }

    this.arr = working

    return operations
  }

  public getInfo(): string {
    return this.info
  }
}
