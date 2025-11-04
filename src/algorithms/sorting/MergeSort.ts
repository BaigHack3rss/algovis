/**
 * This class implemtnents the Merge Sort algorithm.
 */

export class MergeSort {
    private arr: number[]
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
        const source = arr ?? this.arr
        const working = [...source]

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

                if (leftValue !== undefined && (rightValue === undefined || leftValue <= rightValue)) {
                    data[k] = leftValue
                    i++
                } else {
                    data[k] = rightValue!
                    j++
                }
                k++
            }

            while (i < leftLength) {
                data[k] = leftArray[i]!
                i++
                k++
            }

            while (j < rightLength) {
                data[k] = rightArray[j]!
                j++
                k++
            }
        }

        mergeSortRecursive(working, 0, working.length - 1)

        if (!arr) {
            this.arr = working
        }

        return working
    }
}