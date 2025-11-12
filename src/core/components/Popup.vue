<script setup lang="ts">
import { ref, watch, computed, shallowRef, onBeforeUnmount } from 'vue'
import type { SortOperation } from '@/core/interfaces/sortingTypes'
import type { SortingAlgorithmConstructor, SortingAlgorithmLoader } from '@/core/sorting'

defineOptions({
  name: 'AlgorithmPopup',
})
const props = defineProps<{
  algorithmName: string
  algorithmLoader: SortingAlgorithmLoader
}>()

const open = ref(false)

const ARRAY_LENGTH = 8
const MIN_VALUE = 5
const MAX_VALUE = 100

const generateRandomArray = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE)

const base = ref<number[]>(generateRandomArray(ARRAY_LENGTH))
const arr = ref<number[]>([])
const active = ref<number[]>([])
const currentOperation = ref<SortOperation | null>(null)
const currentMeta = computed<SortOperation['meta'] | undefined>(() => currentOperation.value?.meta)

const OPERATION_COLOR_MAP: Record<string, string> = {
  compare: 'compare',
  swap: 'swap',
  write: 'write',
  merge: 'write',
  insert: 'insert',
  'partition-start': 'partition',
  'partition-end': 'partition',
  base: 'base',
}

const operationTone = computed<string | null>(() => {
  const type = currentOperation.value?.type
  return type ? (OPERATION_COLOR_MAP[type] ?? 'default') : null
})

const operationClasses = computed(() => {
  const tone = operationTone.value
  const defaults = {
    array: null as string | null,
    range: null as string | null,
    pivot: null as string | null,
    chip: 'operation-chip--default',
  }

  if (!tone) return defaults

  return {
    array: `array-cell--op-${tone}`,
    range: `range-cell--op-${tone}`,
    pivot: `range-cell--pivot-${tone}`,
    chip: `operation-chip--${tone}`,
  }
})

const steps = ref<SortOperation[]>([])
const i = ref(0)
const playing = ref(false)
let timer: number | null = null

const BASE_DELAY_MS = 750
const SPEED_STEP = 0.5
const MIN_SPEED = 0.5
const MAX_SPEED = 3

const speedMultiplier = ref(1)

const currentDelay = computed(() => {
  const multiplier = Math.min(Math.max(speedMultiplier.value, MIN_SPEED), MAX_SPEED)
  return BASE_DELAY_MS / multiplier
})

const canDecreaseSpeed = computed(() => speedMultiplier.value > MIN_SPEED)
const canIncreaseSpeed = computed(() => speedMultiplier.value < MAX_SPEED)

const speedDisplay = computed(() => {
  const value = Number.isInteger(speedMultiplier.value)
    ? speedMultiplier.value
    : parseFloat(speedMultiplier.value.toFixed(1))
  return `${value}x`
})

const algorithmCtor = shallowRef<SortingAlgorithmConstructor | null>(null)
const loadingAlgorithm = ref(false)
const loadError = ref<unknown>(null)
let loaderPromise: Promise<SortingAlgorithmConstructor | null> | null = null

const loadErrorMessage = computed(() => {
  const error = loadError.value
  if (!error) return ''
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Something went wrong while loading the algorithm.'
})

const finished = computed(() => steps.value.length > 0 && i.value >= steps.value.length)

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
    Array.isArray(slices) && slices.length ? slices : meta?.range ? [meta.range] : []

  return baseSlices
    .filter(([l, r]) => Number.isInteger(l) && Number.isInteger(r) && l >= 0 && r >= l)
    .map(([l, r]) => ({
      l,
      r,
      values: rangeArray.value.slice(l, Math.min(r + 1, rangeArray.value.length)),
    }))
    .filter(({ values }) => values.length > 0)
})

const showRangeSection = computed(() => {
  if (!rangeArray.value.length) return false
  return activeRange.value !== null || pivotIndex.value !== null
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

async function loadAlgorithm(): Promise<SortingAlgorithmConstructor | null> {
  if (algorithmCtor.value) return algorithmCtor.value
  if (loaderPromise) return loaderPromise

  loadingAlgorithm.value = true
  loadError.value = null

  loaderPromise = (async () => {
    try {
      const ctor = await props.algorithmLoader()
      algorithmCtor.value = ctor
      return ctor
    } catch (error) {
      loadError.value = error
      return null
    } finally {
      loadingAlgorithm.value = false
      loaderPromise = null
    }
  })()

  return loaderPromise
}

function resetPlaybackState() {
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

async function buildSteps() {
  const ctor = await loadAlgorithm()
  if (!ctor) {
    steps.value = []
    resetPlaybackState()
    return
  }

  const instance = new ctor([...base.value])
  steps.value = instance.run()
  resetPlaybackState()
}

function scheduleNextTick() {
  if (!playing.value) return
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  timer = window.setTimeout(tick, currentDelay.value)
}

function changeSpeed(delta: number) {
  const next = Math.min(MAX_SPEED, Math.max(MIN_SPEED, speedMultiplier.value + delta))
  const rounded = parseFloat(next.toFixed(2))
  if (rounded === speedMultiplier.value) return
  speedMultiplier.value = rounded
  if (playing.value) {
    scheduleNextTick()
  }
}

function increaseSpeed() {
  changeSpeed(SPEED_STEP)
}

function decreaseSpeed() {
  changeSpeed(-SPEED_STEP)
}

watch(open, (v) => {
  if (v) {
    void buildSteps()
  } else {
    pause()
  }
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
  scheduleNextTick()
}

function play() {
  if (playing.value || loadingAlgorithm.value || loadError.value) return
  if (!steps.value.length) return
  if (finished.value) {
    resetPlaybackState()
  }
  playing.value = true
  tick()
}

function pause() {
  if (!playing.value) return
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  playing.value = false
}

async function retryLoad() {
  algorithmCtor.value = null
  steps.value = []
  resetPlaybackState()
  await buildSteps()
}

function randomizeArray() {
  pause()
  base.value = generateRandomArray(ARRAY_LENGTH)
  arr.value = [...base.value]
  active.value = []
  steps.value = []
  currentOperation.value = null
  i.value = 0
  void buildSteps()
}

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})
</script>

<template>
  <v-dialog v-model="open" max-width="600">
    <template #activator="{ props }">
      <v-btn v-bind="props" color="success" variant="flat"> Visualize {{ algorithmName }} </v-btn>
    </template>

    <v-card>
      <v-card-title class="py-2 py-sm-4">
        <v-row no-gutters>
          <v-col cols="12">
            <v-row no-gutters align="center" justify="space-between">
              <v-col cols="auto">
                <span class="text-overline text-medium-emphasis">Algorithm</span>
              </v-col>
              <v-col cols="auto">
                <v-btn icon variant="text" aria-label="Close" @click="open = false">
                  <v-icon icon="mdi-close" />
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" class="mt-2">
            <span class="text-h6 d-block">{{ algorithmName }}</span>
            <v-row no-gutters align="center" class="mt-2">
              <v-col cols="auto" class="mr-2 mb-1">
                <v-chip variant="flat" color="primary" size="small">
                  Step {{ Math.min(i, steps.length) }} / {{ steps.length }}
                </v-chip>
              </v-col>
              <v-col v-if="currentOperation" cols="auto" class="mr-2 mb-1">
                <v-chip
                  variant="outlined"
                  size="small"
                  class="operation-chip"
                  :class="operationClasses.chip"
                >
                  {{ currentOperation.type }}
                </v-chip>
              </v-col>
              <v-col v-if="currentDepth !== null" cols="auto" class="mb-1">
                <v-chip variant="outlined" color="info" size="small">
                  Recursion Depth {{ currentDepth }}
                </v-chip>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider class="mx-4" />

      <v-card-text class="pt-4 pt-sm-6 pb-2 px-4 px-sm-6">
        <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4">
          Failed to load the algorithm module.
          <span v-if="loadErrorMessage" class="ml-1">{{ loadErrorMessage }}</span>
          <v-btn size="small" variant="text" color="error" @click="retryLoad">Retry</v-btn>
        </v-alert>
        <v-progress-linear
          v-else-if="loadingAlgorithm"
          indeterminate
          color="primary"
          class="mb-4"
        />
        <template v-else>
          <v-container v-if="showRangeSection" class="viz-section" fluid tag="section">
            <v-row class="viz-section__header" align="center" justify="space-between" no-gutters>
              <v-col cols="auto">
                <span class="text-subtitle-2">Active Range</span>
              </v-col>
              <v-col cols="auto">
                <v-chip v-if="pivotIndex !== null" size="x-small" color="warning" variant="flat">
                  Pivot @ {{ pivotIndex }}
                </v-chip>
              </v-col>
            </v-row>
            <div class="range-array">
              <v-row class="range-grid" justify="center" align="center" dense>
                <v-col cols="auto" v-for="(value, index) in rangeArray" :key="`range-${index}`">
                  <div
                    :class="[
                      'range-cell',
                      isInActiveRange(index) && 'range-cell--active',
                      isInActiveRange(index) ? operationClasses.range : null,
                      isPivotIndex(index) && 'range-cell--pivot',
                      isPivotIndex(index) ? operationClasses.pivot : null,
                    ]"
                  >
                    <span class="range-cell__index">{{ index }}</span>
                    <span class="range-cell__value">{{ value }}</span>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-container>

          <v-container class="viz-section" fluid tag="section">
            <v-row class="viz-section__header" align="center" justify="space-between" no-gutters>
              <v-col cols="auto">
                <span class="text-subtitle-2">Array State</span>
              </v-col>
              <v-col cols="auto">
                <div class="array-controls">
                  <span class="text-caption text-medium-emphasis">
                    Highlighted indices are active
                  </span>
                  <v-btn
                    size="x-small"
                    variant="tonal"
                    color="secondary"
                    :disabled="loadingAlgorithm"
                    @click="randomizeArray"
                  >
                    Randomize
                  </v-btn>
                </div>
              </v-col>
            </v-row>
            <v-row class="array-grid" justify="center" dense>
              <v-col cols="auto" v-for="(val, idx) in arr" :key="idx">
                <div
                  class="array-cell"
                  :class="[
                    active.includes(idx) ? 'array-cell--active' : 'array-cell--idle',
                    active.includes(idx) ? operationClasses.array : null,
                  ]"
                >
                  {{ val }}
                </div>
              </v-col>
            </v-row>
          </v-container>

          <v-container v-if="subarrays.length" class="viz-section" fluid tag="section">
            <v-row class="viz-section__header" align="center" justify="space-between" no-gutters>
              <v-col cols="auto">
                <span class="text-subtitle-2">Subarrays</span>
              </v-col>
              <v-col cols="auto">
                <span class="text-caption text-medium-emphasis">
                  Showing slices involved in the current operation
                </span>
              </v-col>
            </v-row>
            <v-row class="subarray-list" justify="center" dense>
              <v-col
                cols="12"
                md="auto"
                v-for="(slice, sliceIndex) in subarrays"
                :key="`slice-${sliceIndex}`"
              >
                <div class="subarray-chip">
                  <span class="subarray-chip__label">[{{ slice.l }}..{{ slice.r }}]</span>
                  <v-row class="subarray-chip__values" dense>
                    <v-col
                      cols="auto"
                      v-for="(value, valIndex) in slice.values"
                      :key="`slice-${sliceIndex}-${valIndex}`"
                    >
                      <span class="subarray-chip__value">
                        {{ value }}
                      </span>
                    </v-col>
                  </v-row>
                </div>
              </v-col>
            </v-row>
          </v-container>

          <v-container class="viz-section" fluid tag="section">
            <v-row class="viz-section__header" align="center" justify="space-between" no-gutters>
              <v-col cols="auto">
                <span class="text-subtitle-2">Playback</span>
              </v-col>
              <v-col cols="auto">
                <span class="text-caption text-medium-emphasis">Step controls</span>
              </v-col>
            </v-row>
            <v-row class="mt-4" align="center" justify="center" no-gutters>
              <v-col cols="12">
                <v-slider
                  :min="0"
                  :max="steps.length"
                  step="1"
                  :model-value="i"
                  @update:model-value="seek"
                  thumb-label
                  :disabled="!steps.length"
                />
              </v-col>
              <v-col cols="auto" class="playback-actions">
                <v-btn
                  v-if="!playing"
                  color="primary"
                  @click="play"
                  :disabled="!steps.length"
                  :icon="finished ? 'mdi-replay' : 'mdi-play'"
                  :aria-label="finished ? 'Replay animation' : 'Play animation'"
                />
                <v-btn
                  v-else
                  color="warning"
                  @click="pause"
                  icon="mdi-pause"
                  aria-label="Pause animation"
                />
                                <div class="playback-controls">
                  <v-btn
                    icon="mdi-rewind"
                    variant="tonal"
                    color="secondary"
                    @click="decreaseSpeed"
                    :disabled="!steps.length || !canDecreaseSpeed"
                    aria-label="Slow down playback"
                  />
                  <v-chip size="small" variant="tonal" color="secondary" class="playback-speed">
                    {{ speedDisplay }}
                  </v-chip>
                  <v-btn
                    icon="mdi-fast-forward"
                    variant="tonal"
                    color="secondary"
                    @click="increaseSpeed"
                    :disabled="!steps.length || !canIncreaseSpeed"
                    aria-label="Speed up playback"
                  />
                </div>
              </v-col>
            </v-row>
          </v-container>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.viz-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.viz-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.range-array {
  border-radius: 12px;
  padding: 10px;
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

.range-cell--active.range-cell--op-compare {
  background: rgba(var(--v-theme-info), 0.2);
}

.range-cell--active.range-cell--op-swap {
  background: rgba(var(--v-theme-warning), 0.2);
}

.range-cell--active.range-cell--op-write {
  background: rgba(var(--v-theme-success), 0.2);
}

.range-cell--active.range-cell--op-insert {
  background: rgba(var(--v-theme-primary), 0.2);
}

.range-cell--active.range-cell--op-partition {
  background: rgba(var(--v-theme-secondary), 0.2);
}

.range-cell--active.range-cell--op-base {
  background: rgba(var(--v-theme-surface-variant), 0.24);
}

.range-cell--active.range-cell--op-default {
  background: rgba(var(--v-theme-accent), 0.22);
}

.range-cell--pivot.range-cell--pivot-compare {
  outline-color: rgb(var(--v-theme-info));
}

.range-cell--pivot.range-cell--pivot-swap {
  outline-color: rgb(var(--v-theme-warning));
}

.range-cell--pivot.range-cell--pivot-write {
  outline-color: rgb(var(--v-theme-success));
}

.range-cell--pivot.range-cell--pivot-insert {
  outline-color: rgb(var(--v-theme-primary));
}

.range-cell--pivot.range-cell--pivot-partition {
  outline-color: rgb(var(--v-theme-secondary));
}

.range-cell--pivot.range-cell--pivot-base {
  outline-color: rgb(var(--v-theme-surface-variant));
}

.range-cell--pivot.range-cell--pivot-default {
  outline-color: rgb(var(--v-theme-accent));
}

.array-cell {
  min-width: 40px;
  padding: 6px 8px;
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

.array-cell--active.array-cell--op-compare {
  background: rgba(var(--v-theme-info), 0.28);
  color: rgb(var(--v-theme-on-info));
}

.array-cell--active.array-cell--op-swap {
  background: rgba(var(--v-theme-warning), 0.28);
  color: rgb(var(--v-theme-on-warning));
}

.array-cell--active.array-cell--op-write {
  background: rgba(var(--v-theme-success), 0.28);
  color: rgb(var(--v-theme-on-success));
}

.array-cell--active.array-cell--op-insert {
  background: rgba(var(--v-theme-primary), 0.28);
  color: rgb(var(--v-theme-on-primary));
}

.array-cell--active.array-cell--op-partition {
  background: rgba(var(--v-theme-secondary), 0.28);
  color: rgb(var(--v-theme-on-secondary));
}

.array-cell--active.array-cell--op-base {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  color: rgb(var(--v-theme-on-surface-variant));
}

.array-cell--active.array-cell--op-default {
  background: rgba(var(--v-theme-accent), 0.3);
  color: rgb(var(--v-theme-on-accent));
}

.operation-chip {
  border-color: currentColor !important;
}

.operation-chip--compare {
  color: rgb(var(--v-theme-info));
}

.operation-chip--swap {
  color: rgb(var(--v-theme-warning));
}

.operation-chip--write {
  color: rgb(var(--v-theme-success));
}

.operation-chip--insert {
  color: rgb(var(--v-theme-primary));
}

.operation-chip--partition {
  color: rgb(var(--v-theme-secondary));
}

.operation-chip--base {
  color: rgb(var(--v-theme-surface-variant));
}

.operation-chip--default {
  color: rgb(var(--v-theme-accent));
}

.subarray-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.subarray-chip__label {
  font-size: 0.75rem;
  opacity: 0.7;
}

.subarray-chip__value {
  padding: 3px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.75rem;
  font-weight: 600;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.playback-speed {
  justify-content: center;
  min-width: 52px;
}

.playback-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.array-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
</style>
