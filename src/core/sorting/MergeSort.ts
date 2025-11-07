import type { SortOperation } from '@/core/interfaces/sortingTypes'

/**
 * This class implements the Merge Sort algorithm.
 */

export class MergeSort {
  private arr: number[]
  private info: string = `Divides the array into halves, sorts them and merges them back together.
  Time: O(n log n) | Space: O(n)`
  /**
   * Creates an instance of MergeSort.
   * @param arr - The array of numbers to be sorted.
   */
  constructor(arr: number[]) {
    this.arr = arr
  }

  /**
   * Sorts an array of numbers in ascending order using the Merge Sort algorithm.
   * @param arr - The array of numbers to be sorted.
   * @returns The sorted array.
   */
  public sort(arr?: number[]): number[] {
    this.run(arr)
    return [...this.arr]
  }

  /**
   * Generates the sequence of operations performed by the Merge Sort algorithm.
   * @param arr - Optional array of numbers to be sorted. Falls back to the instance array when omitted.
   * @returns The list of sorting operations executed by the algorithm.
   */
  public run(arr?: number[]): SortOperation[] {
    const source = arr ?? this.arr
    const working = [...source]
    const operations: SortOperation[] = []

    const mergeSortRecursive = (data: number[], left: number, right: number) => {
      if (left >= right) {
        return
      }

      const middle = Math.floor((left + right) / 2)
      mergeSortRecursive(data, left, middle)
      mergeSortRecursive(data, middle + 1, right)
      merge(data, left, middle, right)
    }

    const merge = (data: number[], left: number, middle: number, right: number) => {
      const leftLength = middle - left + 1
      const rightLength = right - middle

      const leftArray = data.slice(left, middle + 1)
      const rightArray = data.slice(middle + 1, right + 1)

      let i = 0
      let j = 0
      let k = left

      while (i < leftLength && j < rightLength) {
        const leftValue = leftArray[i]
        const rightValue = rightArray[j]

        if (leftValue !== undefined && rightValue !== undefined) {
          operations.push({
            type: 'compare',
            indices: [left + i, middle + 1 + j],
            snapshot: [...data],
          })
        }

        if (leftValue !== undefined && (rightValue === undefined || leftValue <= rightValue)) {
          data[k] = leftValue
          operations.push({
            type: 'merge',
            indices: [k],
            snapshot: [...data],
          })
          i++
        } else if (rightValue !== undefined) {
          data[k] = rightValue
          operations.push({
            type: 'merge',
            indices: [k],
            snapshot: [...data],
          })
          j++
        }
        k++
      }

      while (i < leftLength) {
        const value = leftArray[i]

        if (value !== undefined) {
          data[k] = value
          operations.push({
            type: 'merge',
            indices: [k],
            snapshot: [...data],
          })
        }

        i++
        k++
      }

      while (j < rightLength) {
        const value = rightArray[j]

        if (value !== undefined) {
          data[k] = value
          operations.push({
            type: 'merge',
            indices: [k],
            snapshot: [...data],
          })
        }

        j++
        k++
      }
    }

    mergeSortRecursive(working, 0, working.length - 1)

    this.arr = working

    return operations
  }
  public getInfo(): string {
    return this.info
  }
}
