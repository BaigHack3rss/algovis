import type { SortOperation } from '@/core/interfaces/sortingTypes'

export type SortingAlgorithmKey = 'bubble' | 'insertion' | 'merge' | 'quick' | 'selection'

export interface SortingAlgorithmInstance {
  sort(arr?: number[]): number[]
  run(arr?: number[]): SortOperation[]
}

export type SortingAlgorithmConstructor = new (arr: number[]) => SortingAlgorithmInstance

export type SortingAlgorithmLoader = () => Promise<SortingAlgorithmConstructor>

export interface SortingAlgorithmInfo {
  key: SortingAlgorithmKey
  title: string
  info: string
  loader: SortingAlgorithmLoader
}

const algorithmInfo: SortingAlgorithmInfo[] = [
  {
    key: 'bubble',
    title: 'Bubble Sort',
    info: `Repeatedly swaps adjacent elements if they are in the wrong order.
Time: O(n^2) | Space: O(1)`,
    loader: async () => (await import('./BubbleSort')).BubbleSort,
  },
  {
    key: 'insertion',
    title: 'Insertion Sort',
    info: `Builds the final sorted array one item at a time by comparing and inserting elements.
Time: O(n^2) | Space: O(1)`,
    loader: async () => (await import('./InsertionSort')).InsertionSort,
  },
  {
    key: 'merge',
    title: 'Merge Sort',
    info: `Divides the array into halves, sorts them and merges them back together.
Time: O(n log n) | Space: O(n)`,
    loader: async () => (await import('./MergeSort')).MergeSort,
  },
  {
    key: 'quick',
    title: 'Quick Sort',
    info: `Divides the array into smaller sub-arrays around a pivot, sorting them recursively.
Time: O(n log n) | Space: O(log n)`,
    loader: async () => (await import('./QuickSort')).QuickSort,
  },
  {
    key: 'selection',
    title: 'Selection Sort',
    info: `Selects the smallest (or largest) element from the unsorted portion and moves it to the sorted portion.
Time: O(n^2) | Space: O(1)`,
    loader: async () => (await import('./SelectionSort')).SelectionSort,
  },
]

export const sortingAlgorithmInfoMap = algorithmInfo.reduce<
  Record<SortingAlgorithmKey, SortingAlgorithmInfo>
>(
  (acc, info) => {
    acc[info.key] = info
    return acc
  },
  {} as Record<SortingAlgorithmKey, SortingAlgorithmInfo>,
)

export const sortingAlgorithmInfoList = algorithmInfo
