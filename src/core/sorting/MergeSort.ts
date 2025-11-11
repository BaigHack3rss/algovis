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
    const a = [...source]
    const ops: SortOperation[] = []

    const push = (type: string, indices: number[], meta?: SortOperation['meta']) => {
      ops.push({ type, indices, snapshot: [...a], meta })
    }

    const merge = (left: number, mid: number, right: number, depth: number) => {
      const leftSlice = a.slice(left, mid + 1)
      const rightSlice = a.slice(mid + 1, right + 1)
      let i = 0
      let j = 0
      let k = left

      while (i < leftSlice.length && j < rightSlice.length) {
        const leftValue = leftSlice[i]
        const rightValue = rightSlice[j]

        push('compare', [left + i, mid + 1 + j], {
          range: [left, right],
          depth,
          slices: [
            [left, mid],
            [mid + 1, right],
          ],
        })

        if (leftValue !== undefined && (rightValue === undefined || leftValue <= rightValue)) {
          a[k] = leftValue
          i++
        } else if (rightValue !== undefined) {
          a[k] = rightValue
          j++
        }

        push('write', [k], {
          range: [left, right],
          depth,
          slices: [
            [left, mid],
            [mid + 1, right],
          ],
        })
        k++
      }

      while (i < leftSlice.length) {
        const value = leftSlice[i]

        if (value !== undefined) {
          a[k] = value
          push('write', [k], {
            range: [left, right],
            depth,
            slices: [
              [left, mid],
              [mid + 1, right],
            ],
          })
        }

        i++
        k++
      }

      while (j < rightSlice.length) {
        const value = rightSlice[j]

        if (value !== undefined) {
          a[k] = value
          push('write', [k], {
            range: [left, right],
            depth,
            slices: [
              [left, mid],
              [mid + 1, right],
            ],
          })
        }

        j++
        k++
      }
    }

    const sort = (left: number, right: number, depth: number) => {
      if (left >= right) {
        ops.push({
          type: 'base',
          indices: [left],
          snapshot: [...a],
          meta: { range: [left, right], depth, slices: [[left, right]] },
        })
        return
      }
      const mid = Math.floor((left + right) / 2)
      sort(left, mid, depth + 1)
      sort(mid + 1, right, depth + 1)
      merge(left, mid, right, depth)
    }

    if (a.length > 0) sort(0, a.length - 1, 0)
    this.arr = a
    return ops
  }
  public getInfo(): string {
    return this.info
  }
}
