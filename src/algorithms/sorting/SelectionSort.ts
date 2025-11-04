/**
 * This class implements the Selection Sort algorithm.
 */

export class SelectionSort {
  private arr: number[]

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
    const source = arr ?? this.arr
    const working = [...source]

    for (let i = 0; i < working.length - 1; i++) {
      let minIndex = i
      let minValue = working[minIndex]

      if (minValue === undefined) {
        continue
      }

      for (let j = i + 1; j < working.length; j++) {
        const candidate = working[j]

        if (candidate !== undefined && candidate < minValue) {
          minIndex = j
          minValue = candidate
        }
      }

      if (minIndex !== i) {
        const current = working[i]

        if (current !== undefined) {
          working[i] = minValue
          working[minIndex] = current
        }
      }
    }

    if (!arr) {
      this.arr = working
    }

    return working
  }
}
