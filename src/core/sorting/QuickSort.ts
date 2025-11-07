import type { SortOperation } from '@/core/interfaces/sortingTypes'

/**
 * This class implements the Quick Sort algorithm.
 */

export class QuickSort {
  private arr: number[]
  info: string = `Divides the array into smaller sub-arrays around a pivot, sorting them recursively.
  Time: O(n log n) | Space: O(log n)`

  /**
   * Creates an instance of QuickSort.
   * @param arr - The array of numbers to be sorted.
   *
   * */
  constructor(arr: number[]) {
    this.arr = arr
  }

  /**
   * Sorts an array of numbers in ascending order using the Quick Sort algorithm.
   * @param arr - The array of numbers to be sorted.
   * @returns The sorted array.
   */
  public sort(arr?: number[]): number[] {
    this.run(arr)
    return [...this.arr]
  }

  /**
   * Generates the sequence of operations performed by the Quick Sort algorithm.
   * @param arr - Optional array of numbers to be sorted. Falls back to the instance array when omitted.
   * @returns The list of sorting operations executed by the algorithm.
   */
  public run(arr?: number[]): SortOperation[] {
    const source = arr ?? this.arr
    const working = [...source]
    const operations: SortOperation[] = []

    const partition = (low: number, high: number): number => {
      const pivot = working[high]

      if (pivot === undefined) {
        return high
      }

      let i = low - 1

      for (let j = low; j < high; j++) {
        const current = working[j]

        if (current === undefined) {
          continue
        }

        operations.push({
          type: 'compare',
          indices: [j, high],
          snapshot: [...working],
        })

        if (current < pivot) {
          i++

          const existing = working[i]
          working[i] = current
          working[j] = existing === undefined ? current : existing

          operations.push({
            type: 'swap',
            indices: [i, j],
            snapshot: [...working],
          })
        }
      }

      const swapIndex = i + 1
      const swapValue = working[swapIndex]
      working[swapIndex] = pivot
      working[high] = swapValue === undefined ? pivot : swapValue

      operations.push({
        type: 'swap',
        indices: [swapIndex, high],
        snapshot: [...working],
      })

      return swapIndex
    }

    const quickSortRecursive = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high)

        quickSortRecursive(low, pi - 1)
        quickSortRecursive(pi + 1, high)
      }
    }

    quickSortRecursive(0, working.length - 1)

    this.arr = working

    return operations
  }

  public getInfo(): string {
    return this.info
  }
}
