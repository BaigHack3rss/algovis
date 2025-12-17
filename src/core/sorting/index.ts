import type { SortOperation } from '@/core/interfaces/sortingTypes'

export type SortingAlgorithmKey = 'bubble' | 'insertion' | 'merge' | 'quick' | 'selection' | 'heap'

export interface SortingAlgorithmInstance {
  sort(arr?: number[]): number[]
  run(arr?: number[]): SortOperation[]
}

export type SortingAlgorithmConstructor = new (arr: number[]) => SortingAlgorithmInstance

export type SortingAlgorithmLoader = () => Promise<SortingAlgorithmConstructor>

export interface SortingAlgorithmInfo {
  key: SortingAlgorithmKey
  title: string
  description: string
  timeComplexity: string
  spaceComplexity: string
  loader: SortingAlgorithmLoader
}

const algorithmInfo: SortingAlgorithmInfo[] = [
  {
    key: 'bubble',
    title: 'Bubble Sort',
    description: 'Repeatedly swaps adjacent elements if they are in the wrong order.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    loader: async () => (await import('./BubbleSort')).BubbleSort,
  },
  {
    key: 'insertion',
    title: 'Insertion Sort',
    description:
      'Builds the final sorted array one item at a time by comparing and inserting elements.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    loader: async () => (await import('./InsertionSort')).InsertionSort,
  },
  {
    key: 'merge',
    title: 'Merge Sort',
    description: 'Divides the array into halves, sorts them and merges them back together.',
    timeComplexity: 'O(n \\log n)',
    spaceComplexity: 'O(n)',
    loader: async () => (await import('./MergeSort')).MergeSort,
  },
  {
    key: 'quick',
    title: 'Quick Sort',
    description:
      'Divides the array into smaller sub-arrays around a pivot, sorting them recursively.',
    timeComplexity: 'O(n \\log n)',
    spaceComplexity: 'O(\\log n)',
    loader: async () => (await import('./QuickSort')).QuickSort,
  },
  {
    key: 'heap',
    title: 'Heap Sort',
    description: 'Builds a binary heap and repeatedly extracts the maximum element.',
    timeComplexity: 'O(n \\log n)',
    spaceComplexity: 'O(1)',
    loader: async () => (await import('./HeapSort')).HeapSort,
  },
  {
    key: 'selection',
    title: 'Selection Sort',
    description:
      'Selects the smallest (or largest) element from the unsorted portion and moves it to the sorted portion.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
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
