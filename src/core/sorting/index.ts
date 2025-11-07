import type { SortOperation } from '@/core/interfaces/sortingTypes'
import { BubbleSort } from '@/core/sorting/BubbleSort'
import { InsertionSort } from '@/core/sorting/InsertionSort'
import { MergeSort } from '@/core/sorting/MergeSort'
import { QuickSort } from '@/core/sorting/QuickSort'
import { SelectionSort } from '@/core/sorting/SelectionSort'

export type SortingAlgorithmKey = 'bubble' | 'insertion' | 'merge' | 'quick' | 'selection'

export interface SortingAlgorithmInstance {
  sort(arr?: number[]): number[]
  run(arr?: number[]): SortOperation[]
}

export type SortingAlgorithmConstructor = new (arr: number[]) => SortingAlgorithmInstance

export const sortingAlgorithms: Record<SortingAlgorithmKey, SortingAlgorithmConstructor> = {
  bubble: BubbleSort,
  insertion: InsertionSort,
  merge: MergeSort,
  quick: QuickSort,
  selection: SelectionSort,
}

export interface SortingAlgorithmInfo {
  key: SortingAlgorithmKey
  title: string
  info: string
  constructor: SortingAlgorithmConstructor
}

export const sortingAlgorithmInfoMap: Record<SortingAlgorithmKey, SortingAlgorithmInfo> = {
  bubble: {
    key: 'bubble',
    title: 'Bubble Sort',
    info: new BubbleSort([]).getInfo(),
    constructor: BubbleSort,
  },
  insertion: {
    key: 'insertion',
    title: 'Insertion Sort',
    info: new InsertionSort([]).getInfo(),
    constructor: InsertionSort,
  },
  merge: {
    key: 'merge',
    title: 'Merge Sort',
    info: new MergeSort([]).getInfo(),
    constructor: MergeSort,
  },
  quick: {
    key: 'quick',
    title: 'Quick Sort',
    info: new QuickSort([]).getInfo(),
    constructor: QuickSort,
  },
  selection: {
    key: 'selection',
    title: 'Selection Sort',
    info: new SelectionSort([]).getInfo(),
    constructor: SelectionSort,
  },
}

export const sortingAlgorithmInfoList = Object.values(sortingAlgorithmInfoMap)

export { BubbleSort, InsertionSort, MergeSort, QuickSort, SelectionSort }
