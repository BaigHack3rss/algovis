import type { SortOperation } from '@/core/interfaces/sortingTypes'

/**
 * This class implements the Bubble Sort algorithm.
 */
export class BubbleSort {
  private arr: number[]
  private info: string = `Repeatedly swaps adjacent elements if they are in the wrong order.
  Time: O(n^2) | Space: O(1)`

  /**
   * Creates an instance of BubbleSort.
   * @param {number[]} arr - The array of numbers to be sorted.
   */
  constructor(arr: number[]) {
    this.arr = arr
  }

  /**
   * Sorts an array of numbers in ascending order using the Bubble Sort algorithm.
   * @param arr - The array of numbers to be sorted.
   * @returns The sorted array.
   */
  public sort(arr?: number[]): number[] {
    this.run(arr)
    return [...this.arr]
  }

  /**
   * Generates the sequence of operations performed by the Bubble Sort algorithm.
   * @param arr - Optional array of numbers to be sorted. Falls back to the instance array when omitted.
   * @returns The list of sorting operations executed by the algorithm.
   */
  public run(arr?: number[]): SortOperation[] {
    const source = arr ?? this.arr
    const working = [...source]
    const operations: SortOperation[] = []
    const n = working.length

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        const nextIndex = j + 1
        const current = working[j]
        const next = working[nextIndex]

        if (current === undefined || next === undefined) {
          continue
        }

        operations.push({
          type: 'compare',
          indices: [j, nextIndex],
          snapshot: [...working],
        })

        if (current > next) {
          working[j] = next
          working[nextIndex] = current

          operations.push({
            type: 'swap',
            indices: [j, nextIndex],
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
