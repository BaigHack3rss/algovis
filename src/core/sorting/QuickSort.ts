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
    const a = [...source]
    const ops: SortOperation[] = []

    type SortMeta = NonNullable<SortOperation['meta']>

    const normalizeSlices = (candidate?: [number, number][]): [number, number][] => {
      if (!candidate) return []
      return candidate.filter(
        ([l, r]) => Number.isInteger(l) && Number.isInteger(r) && l >= 0 && l <= r,
      )
    }

    const buildMeta = (
      lo: number,
      hi: number,
      depth: number,
      extras?: Partial<SortMeta>,
    ): SortMeta => {
      const meta: SortMeta = {
        range: [lo, hi],
        depth,
      }

      const defaultSlices = normalizeSlices(lo <= hi ? [[lo, hi]] : [])
      if (defaultSlices.length) {
        meta.slices = defaultSlices
      }

      if (extras) {
        if (extras.range) meta.range = extras.range
        if (typeof extras.depth === 'number') meta.depth = extras.depth
        if (typeof extras.pivot === 'number') meta.pivot = extras.pivot

        if ('slices' in extras) {
          const customSlices = normalizeSlices(extras.slices)
          if (customSlices.length) {
            meta.slices = customSlices
          } else if (!defaultSlices.length) {
            meta.slices = customSlices
          }
        }
      }

      return meta
    }

    const push = (type: string, indices: number[], meta?: SortOperation['meta']) => {
      ops.push({ type, indices, snapshot: [...a], meta })
    }

    const swap = (first: number, second: number, meta: SortOperation['meta']) => {
      const leftValue = a[first]
      const rightValue = a[second]

      if (leftValue === undefined || rightValue === undefined) {
        return
      }

      a[first] = rightValue
      a[second] = leftValue
      push('swap', [first, second], meta)
    }

    const partition = (lo: number, hi: number, depth: number) => {
      const pivot = a[hi]
      if (pivot === undefined) {
        return hi
      }
      let i = lo
      push('partition-start', [hi], buildMeta(lo, hi, depth, { pivot: hi }))
      for (let j = lo; j < hi; j++) {
        push('compare', [j, hi], buildMeta(lo, hi, depth, { pivot: hi }))
        const candidate = a[j]

        if (candidate !== undefined && candidate <= pivot) {
          swap(i, j, buildMeta(lo, hi, depth, { pivot: hi }))
          i++
        }
      }
      swap(i, hi, buildMeta(lo, hi, depth, { pivot: i }))
      push(
        'partition-end',
        [i],
        buildMeta(lo, hi, depth, {
          pivot: i,
          slices: [
            [lo, i - 1],
            [i + 1, hi],
          ],
        }),
      )
      return i
    }

    const qs = (lo: number, hi: number, depth: number) => {
      if (lo >= hi) {
        const indices = lo === hi ? [lo] : []
        ops.push({ type: 'base', indices, snapshot: [...a], meta: buildMeta(lo, hi, depth) })
        return
      }
      const p = partition(lo, hi, depth)
      qs(lo, p - 1, depth + 1)
      qs(p + 1, hi, depth + 1)
    }

    if (a.length > 0) qs(0, a.length - 1, 0)
    this.arr = a
    return ops
  }

  public getInfo(): string {
    return this.info
  }
}
