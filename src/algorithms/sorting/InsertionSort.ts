/**
 * This class implements the Insertion Sort algorithm.
 */
export class InsertionSort {
  private arr: number[]

  /**
   * Creates an instance of InsertionSort.
   * @param {number[]} arr - The array of numbers to be sorted.
   */
  constructor(arr: number[]) {
    this.arr = arr
  }

  /**
   * Sorts an array of numbers in ascending order using the Insertion Sort algorithm.
   * @param arr - The array of numbers to be sorted.
   * @returns The sorted array.
   */
  public sort(arr?: number[]): number[] {
    const source = arr ?? this.arr
    const working = [...source]

    for (let i = 1; i < working.length; i++) {
      const key = working[i]

      if (key === undefined) {
        continue
      }

      let j = i - 1

      while (j >= 0) {
        const current = working[j]

        if (current === undefined || current <= key) {
          break
        }

        working[j + 1] = current
        j--
      }

      working[j + 1] = key
    }

    if (!arr) {
      this.arr = working
    }

    return working
  }
}
