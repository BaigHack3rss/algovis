<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { SortOperation } from '@/core/interfaces/sortingTypes'
import type { SortingAlgorithmConstructor } from '@/core/sorting'

defineOptions({
  name: 'AlgorithmPopup',
})

const props = defineProps<{
  algorithmName: string
  algorithmConstructor: SortingAlgorithmConstructor
}>()

const open = ref(false)

const ARRAY_LENGTH = 8
const MIN_VALUE = 5
const MAX_VALUE = 100

const generateRandomArray = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE)

// base input, current view, active indices
const base = ref<number[]>(generateRandomArray(ARRAY_LENGTH))
const arr = ref<number[]>([])
const active = ref<number[]>([])
const currentOperation = ref<SortOperation | null>(null)
const currentMeta = computed<SortOperation['meta'] | undefined>(() => currentOperation.value?.meta)

// recorded steps and pointer
const steps = ref<SortOperation[]>([])
const i = ref(0)
const playing = ref(false)
let timer: number | null = null

const finished = computed(() => i.value >= steps.value.length)

// Derived helpers for D&C viz (reads optional step.meta = { range?: [l,r], pivot?: number, depth?: number })
const activeRange = computed<readonly [number, number] | null>(() => {
  const meta = currentMeta.value
  return meta?.range ?? null
})
const pivotIndex = computed<number | null>(() => {
  const pivot = currentMeta.value?.pivot
  return Number.isInteger(pivot) ? (pivot as number) : null
})
const rangeArray = computed(() => (arr.value.length ? arr.value : base.value))
const currentDepth = computed<number | null>(() => {
  const depth = currentMeta.value?.depth
  return Number.isInteger(depth) ? (depth as number) : null
})
const subarrays = computed(() => {
  const meta = currentMeta.value
  const slices = meta?.slices
  const baseSlices: [number, number][] =
    Array.isArray(slices) && slices.length
      ? slices
      : meta?.range
        ? [meta.range]
        : []
  return baseSlices
    .filter(([l, r]) => Number.isInteger(l) && Number.isInteger(r) && l >= 0 && r >= l)
    .map(([l, r]) => ({
      l,
      r,
      values: rangeArray.value.slice(l, Math.min(r + 1, rangeArray.value.length)),
    }))
    .filter(({ values }) => values.length > 0)
})

function isInActiveRange(index: number): boolean {
  const range = activeRange.value
  return !!range && index >= range[0] && index <= range[1]
}

function isPivotIndex(index: number): boolean {
  return pivotIndex.value === index
}

// Jump to an arbitrary step (scrub)
function seek(next: number) {
  // stop playback while seeking
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  playing.value = false

  const clamped = Math.max(0, Math.min(next, steps.value.length))
  i.value = clamped

  if (clamped === 0) {
    arr.value = [...base.value]
    active.value = []
    currentOperation.value = null
    return
  }

  // Apply the snapshot of the selected step (i points to "next" step, show i-1)
  const step = steps.value[clamped - 1]
  if (!step) return
  currentOperation.value = step
  arr.value = [...step.snapshot]
  active.value = [...step.indices]
}

function buildSteps() {
  const instance = new props.algorithmConstructor([...base.value])
  steps.value = instance.run()
  i.value = 0
  arr.value = [...base.value]
  active.value = []
  currentOperation.value = null
  playing.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

watch(open, (v) => {
  if (v) buildSteps()
})

function tick() {
  if (i.value >= steps.value.length) {
    playing.value = false
    currentOperation.value = null
    return
  }
  const step = steps.value[i.value]
  if (!step) {
    playing.value = false
    currentOperation.value = null
    return
  }
  currentOperation.value = step
  arr.value = [...step.snapshot]
  active.value = [...step.indices]
  i.value++
  timer = window.setTimeout(tick, 750)
}

function play() {
  if (playing.value || i.value >= steps.value.length) return
  playing.value = true
  tick()
}

function reset() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  playing.value = false
  i.value = 0
  arr.value = [...base.value]
  active.value = []
  currentOperation.value = null
}
</script>

<template>
  <v-dialog v-model="open" max-width="600">
    <template #activator="{ props }">
      <v-btn v-bind="props" color="success" variant="flat"> Visualize {{ algorithmName }} </v-btn>
    </template>

    <v-card>
      <v-card-title class="py-4">
        <div class="d-flex align-center justify-space-between flex-wrap ga-2 w-100">
          <div>
            <div class="text-overline text-medium-emphasis">Algorithm</div>
            <div class="text-h6">{{ algorithmName }}</div>
          </div>
          <div class="d-flex ga-2 align-center flex-wrap">
            <v-chip variant="flat" color="primary" size="small">
              Step {{ Math.min(i, steps.length) }} / {{ steps.length }}
            </v-chip>
            <v-chip v-if="currentOperation" variant="outlined" color="secondary" size="small">
              {{ currentOperation.type }}
            </v-chip>
            <v-chip v-if="currentDepth !== null" variant="outlined" color="info" size="small">
              Recursion Depth {{ currentDepth }}
            </v-chip>
          </div>
        </div>
      </v-card-title>

      <v-divider class="mx-4" />

      <v-card-text class="pt-6 pb-2 px-6">
        <section class="viz-section" v-if="rangeArray.length">
          <header class="viz-section__header">
            <span class="text-subtitle-2">Active Range</span>
            <v-chip v-if="pivotIndex !== null" size="x-small" color="warning" variant="flat">
              Pivot @ {{ pivotIndex }}
            </v-chip>
          </header>
          <div class="range-array">
            <div class="d-flex flex-wrap justify-center ga-1">
              <div
                v-for="(value, index) in rangeArray"
                :key="`range-${index}`"
                :class="[
                  'range-cell',
                  isInActiveRange(index) && 'range-cell--active',
                  isPivotIndex(index) && 'range-cell--pivot',
                ]"
              >
                <span class="range-cell__index">{{ index }}</span>
                <span class="range-cell__value">{{ value }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="viz-section">
          <header class="viz-section__header">
            <span class="text-subtitle-2">Array State</span>
            <span class="text-caption text-medium-emphasis">Highlighted indices are active</span>
          </header>
          <div class="d-flex flex-wrap ga-2 justify-center">
            <div
              v-for="(val, idx) in arr"
              :key="idx"
              class="array-cell"
              :class="active.includes(idx) ? 'array-cell--active' : 'array-cell--idle'"
            >
              {{ val }}
            </div>
          </div>
        </section>

        <section v-if="subarrays.length" class="viz-section">
          <header class="viz-section__header">
            <span class="text-subtitle-2">Subarrays</span>
            <span class="text-caption text-medium-emphasis">
              Showing slices involved in the current operation
            </span>
          </header>
          <div class="d-flex flex-column ga-2 align-center">
            <div
              v-for="(slice, sliceIndex) in subarrays"
              :key="`slice-${sliceIndex}`"
              class="subarray-chip"
            >
              <span class="subarray-chip__label">[{{ slice.l }}..{{ slice.r }}]</span>
              <div class="d-flex ga-1">
                <span
                  v-for="(value, valIndex) in slice.values"
                  :key="`slice-${sliceIndex}-${valIndex}`"
                  class="subarray-chip__value"
                >
                  {{ value }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section class="viz-section">
          <header class="viz-section__header">
            <span class="text-subtitle-2">Playback</span>
            <span class="text-caption text-medium-emphasis"
              >Navigate through the recorded steps</span
            >
          </header>
          <v-slider
            class="mt-4"
            :min="0"
            :max="steps.length"
            step="1"
            :model-value="i"
            @update:model-value="seek"
            thumb-label
          />
        </section>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="!playing && !finished" color="primary" @click="play"> Play </v-btn>
        <v-btn v-else color="primary" @click="reset"> Reset </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="open = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.viz-section {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.viz-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.range-array {
  border-radius: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.range-cell {
  position: relative;
  min-width: 46px;
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.range-cell__index {
  font-size: 0.65rem;
  opacity: 0.6;
}

.range-cell__value {
  font-size: 0.85rem;
  font-weight: 600;
}

.range-cell--active {
  background: rgba(var(--v-theme-primary), 0.22);
  transform: translateY(-2px);
}

.range-cell--pivot {
  outline: 2px solid rgb(var(--v-theme-warning));
  outline-offset: 2px;
}

.array-cell {
  min-width: 44px;
  padding: 6px 10px;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.array-cell--idle {
  background: rgba(255, 255, 255, 0.08);
}

.array-cell--active {
  background: rgba(var(--v-theme-accent), 0.25);
  color: rgb(var(--v-theme-on-accent));
  transform: translateY(-2px);
}

.subarray-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.subarray-chip__label {
  font-size: 0.75rem;
  opacity: 0.7;
}

.subarray-chip__value {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
