import type { SortOperation } from '@/core/interfaces/sortingTypes'

/**
 * This class implements the Heap Sort algorithm.
 */
export class HeapSort {
  private arr: number[]
  private info: string = `Builds a binary heap and repeatedly extracts the maximum element.
  Time: O(n log n) | Space: O(1)`

  constructor(arr: number[]) {
    this.arr = arr
  }

  public sort(arr?: number[]): number[] {
    this.run(arr)
    return [...this.arr]
  }

  public run(arr?: number[]): SortOperation[] {
    const source = arr ?? this.arr
    const working = [...source]
    const operations: SortOperation[] = []

    if (!working.length) {
      this.arr = working
      return operations
    }

    type OperationMeta = NonNullable<SortOperation['meta']>

    const buildMeta = (heapEnd: number, tailStartOverride?: number): SortOperation['meta'] => {
      if (heapEnd < 0 || !working.length) return undefined
      const clampedEnd = Math.max(0, Math.min(heapEnd, working.length - 1))
      const meta: OperationMeta = {
        range: [0, clampedEnd],
        slices: [[0, clampedEnd]],
      }
      let tailStart: number | null = null
      if (typeof tailStartOverride === 'number') {
        tailStart = tailStartOverride
      } else if (clampedEnd < working.length - 1) {
        tailStart = clampedEnd + 1
      }
      if (tailStart !== null) {
        const start = Math.max(0, Math.min(tailStart, working.length - 1))
        if (start <= working.length - 1) {
          meta.inactiveSlices = [[start, working.length - 1]]
        }
      }
      return meta
    }

    const push = (type: string, indices: number[], meta?: SortOperation['meta']) => {
      operations.push({ type, indices, snapshot: [...working], meta })
    }

    const swap = (first: number, second: number, meta?: SortOperation['meta']) => {
      const left = working[first]
      const right = working[second]
      if (left === undefined || right === undefined) return
      working[first] = right
      working[second] = left
      push('swap', [first, second], meta)
    }

    const compare = (first: number, second: number, meta?: SortOperation['meta']) => {
      const left = working[first]
      const right = working[second]
      if (left === undefined || right === undefined) return
      push('compare', [first, second], meta)
    }

    const heapify = (heapEnd: number, root: number) => {
      if (root < 0 || root > heapEnd) return

      let largest = root
      const left = 2 * root + 1
      const right = left + 1
      const meta = buildMeta(heapEnd)

      const considerChild = (childIndex: number) => {
        if (childIndex > heapEnd) return
        const childValue = working[childIndex]
        const largestValue = working[largest]
        if (childValue === undefined || largestValue === undefined) return
        compare(childIndex, largest, meta)
        if (childValue > largestValue) {
          largest = childIndex
        }
      }

      considerChild(left)
      considerChild(right)

      if (largest !== root) {
        swap(root, largest, meta)
        heapify(heapEnd, largest)
      }
    }

    const n = working.length
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n - 1, i)
    }

    for (let end = n - 1; end > 0; end--) {
      swap(0, end, buildMeta(end, end))
      heapify(end - 1, 0)
    }

    this.arr = working
    return operations
  }

  public getInfo(): string {
    return this.info
  }
}
