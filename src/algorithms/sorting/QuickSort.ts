/**
 * This class implements the Quick Sort algorithm.
 */

export class QuickSort {
  private arr: number[]

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
    const source = arr ?? this.arr
    const working = [...source]

    const partition = (low: number, high: number): number => {
      const pivot = working[high]!
      let i = low - 1

      for (let j = low; j < high; j++) {
        const current = working[j]

        if (current !== undefined && current < pivot) {
          i++
          const temp = working[i]
          working[i] = current
          working[j] = temp!
        }
      }

      const swapIndex = i + 1
      const swapValue = working[swapIndex]
      working[swapIndex] = working[high]!
      working[high] = swapValue!
      return i + 1
    }

    const quickSortRecursive = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high)

        quickSortRecursive(low, pi - 1)
        quickSortRecursive(pi + 1, high)
      }
    }

    quickSortRecursive(0, working.length - 1)

    if (!arr) {
      this.arr = working
    }

    return working
  }
}
