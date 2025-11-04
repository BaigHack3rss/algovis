/**
 * This class implements the Bubble Sort algorithm.
 */
export class BubbleSort {
  private arr: number[]

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
    const working = [...(arr ?? this.arr)]
    const n = working.length

    for (let i = 0; i < n - 1; i++) {
      let swapped = false

      for (let j = 0; j < n - i - 1; j++) {
        const current = working[j]
        const nextIndex = j + 1
        const next = working[nextIndex]

        if (current !== undefined && next !== undefined && current > next) {
          working[j] = next
          working[nextIndex] = current
          swapped = true
        }
      }

      if (!swapped) {
        break
      }
    }

    if (!arr) {
      this.arr = working
    }

    return working
  }
}
