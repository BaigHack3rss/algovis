<script setup lang="ts">
import { ref, watch, computed, shallowRef, onBeforeUnmount, nextTick, watchEffect } from 'vue'
import type { CSSProperties } from 'vue'
import StepBasedView from '@/core/components/StepBasedView.vue'
import BarChartView from '@/core/components/BarChartView.vue'
import type { SortOperation } from '@/core/interfaces/sortingTypes'
import type { SortingAlgorithmConstructor, SortingAlgorithmLoader } from '@/core/sorting'

defineOptions({
  name: 'AlgorithmPopup',
})
type VisualizationMode = 'step' | 'bar'

const props = defineProps<{
  algorithmName: string
  algorithmLoader: SortingAlgorithmLoader
}>()

const open = ref(false)
const activeView = ref<VisualizationMode>('bar')

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

const TONE_COLOR_VAR: Record<string, string> = {
  compare: '--v-theme-info',
  swap: '--v-theme-warning',
  write: '--v-theme-success',
  insert: '--v-theme-primary',
  partition: '--v-theme-secondary',
  base: '--v-theme-surface-variant',
  default: '--v-theme-accent',
}

const OPERATION_VERB_MAP: Record<string, string> = {
  compare: 'Comparing',
  swap: 'Swapping',
  write: 'Writing',
  merge: 'Merging',
  insert: 'Inserting',
  'partition-start': 'Partitioning',
  'partition-end': 'Partitioning',
  base: 'Preparing',
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
    brace: 'subarray-brace--default',
  }

  if (!tone) return defaults

  return {
    array: `array-cell--op-${tone}`,
    range: `range-cell--op-${tone}`,
    pivot: `range-cell--pivot-${tone}`,
    brace: `subarray-brace--${tone}`,
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

const inactiveRanges = computed<readonly [number, number][]>(() => {
  const meta = currentMeta.value
  const values = rangeArray.value
  if (!values.length || !meta?.inactiveSlices?.length) return []
  const maxIndex = values.length - 1
  return meta.inactiveSlices
    .map(([l, r]) => {
      if (!Number.isInteger(l) || !Number.isInteger(r)) return null
      const start = Math.max(0, Math.min(l, maxIndex))
      const end = Math.max(start, Math.min(r, maxIndex))
      if (end < start) return null
      return [start, end] as [number, number]
    })
    .filter((range): range is [number, number] => !!range)
})

const displayBounds = computed<readonly [number, number] | null>(() => {
  const values = rangeArray.value
  if (!values.length) return null

  const bounds: Array<readonly [number, number]> = []
  const range = activeRange.value
  if (range) bounds.push(range)
  if (inactiveRanges.value.length) bounds.push(...inactiveRanges.value)

  if (!bounds.length) return [0, values.length - 1]

  const minStart = Math.min(...bounds.map(([start]) => start))
  const maxEnd = Math.max(...bounds.map(([, end]) => end))

  const clampedStart = Math.max(0, Math.min(minStart, values.length - 1))
  const clampedEnd = Math.max(clampedStart, Math.min(maxEnd, values.length - 1))
  return [clampedStart, clampedEnd]
})

const rangeEntries = computed(() => {
  const values = rangeArray.value
  const bounds = displayBounds.value
  if (!bounds) return []
  const [start, end] = bounds
  return values.slice(start, end + 1).map((value, offset) => ({
    value,
    index: start + offset,
  }))
})

const rangeGridStyle = computed<CSSProperties>(() => ({
  gridTemplateColumns: `repeat(${Math.max(rangeEntries.value.length || 1, 1)}, minmax(0, 1fr))`,
}))

const currentDepth = computed<number | null>(() => {
  const depth = currentMeta.value?.depth
  return Number.isInteger(depth) ? (depth as number) : null
})

const subarrays = computed(() => {
  const meta = currentMeta.value
  const slices = meta?.slices
  const baseSlices: [number, number][] =
    Array.isArray(slices) && slices.length ? slices : meta?.range ? [meta.range] : []

  const bounds = displayBounds.value
  if (!bounds) return []
  const [start, end] = bounds

  return baseSlices
    .filter(([l, r]) => Number.isInteger(l) && Number.isInteger(r) && l >= 0 && r >= l)
    .map(([l, r]) => {
      const clampedStart = Math.max(l, start)
      const clampedEnd = Math.min(r, end)
      if (clampedEnd < clampedStart) return null
      return {
        l: clampedStart - start,
        r: clampedEnd - start,
        values: rangeArray.value.slice(clampedStart, clampedEnd + 1),
        label: `[${l}..${r}]`,
      }
    })
    .filter((slice): slice is { l: number; r: number; values: number[]; label: string } => !!slice)
})

let braceTypesetPending = false

function scheduleBraceTypeset() {
  if (braceTypesetPending) return
  braceTypesetPending = true
  void nextTick(() => {
    braceTypesetPending = false
    window.MathJax?.typesetPromise?.()
  })
}

watchEffect(() => {
  if (!open.value) return
  if (activeView.value !== 'step') return
  if (!subarrays.value.length) return
  scheduleBraceTypeset()
})

const TEX_ESCAPE_LOOKUP: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  '#': '\\#',
  '%': '\\%',
  '&': '\\&',
  '$': '\\$',
  '_': '\\_',
  '^': '\\^{}',
  '~': '\\textasciitilde{}',
}

const TEX_ESCAPE_PATTERN = /[\\{}#%&$_^~]/g

function escapeForTeX(text: string): string {
  return text.replace(TEX_ESCAPE_PATTERN, (char) => TEX_ESCAPE_LOOKUP[char] ?? char)
}

const HTML_ESCAPE_LOOKUP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const HTML_ESCAPE_PATTERN = /[&<>"']/g

function escapeHtml(text: string): string {
  return text.replace(HTML_ESCAPE_PATTERN, (char) => HTML_ESCAPE_LOOKUP[char] ?? char)
}

function wrapInlineMath(content: string): string {
  const trimmed = content.trim()
  if (!trimmed) return ''
  return `\\(${trimmed}\\)`
}

function formatConjunction(items: string[]): string {
  if (!items.length) return ''
  if (items.length === 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

const braceActionText = computed(() => {
  const operation = currentOperation.value
  if (!operation) return ''

  const verb = OPERATION_VERB_MAP[operation.type] ?? 'Operating on'
  const slices = subarrays.value

  const describeSlices = () => {
    if (!slices.length) return ''
    const formatSlice = (slice: { label: string }, idx: number) => {
      if (slices.length === 2) {
        const labels = ['left', 'right']
        const side = labels[idx] ?? `part ${idx + 1}`
        return `${side} ${wrapInlineMath(escapeForTeX(slice.label))}`
      }
      return wrapInlineMath(escapeForTeX(slice.label))
    }

    if (slices.length === 1) {
      const firstSlice = slices[0]
      return firstSlice ? `${verb} ${formatSlice(firstSlice, 0)}` : verb
    }

    const formatted = slices.slice(0, 3).map((slice, idx) => formatSlice(slice, idx))
    const suffix = slices.length > 3 ? '…' : ''
    return `${verb} ${formatConjunction(formatted)}${suffix}`
  }

  const describeIndices = () => {
    const indices = Array.isArray(operation.indices) ? operation.indices : []
    if (!indices.length) return ''
    const formatted = indices.slice(0, 3).map((idx) => wrapInlineMath(idx.toString()))
    const suffix = indices.length > 3 ? '…' : ''
    if (formatted.length === 1) {
      return `${verb} index ${formatted[0]}${suffix}`
    }
    return `${verb} indices ${formatConjunction(formatted)}${suffix}`
  }

  const description = describeSlices() || describeIndices() || verb
  return escapeHtml(description)
})

const showRangeSection = computed(() => {
  if (!rangeArray.value.length) return false
  return (
    activeRange.value !== null ||
    pivotIndex.value !== null ||
    inactiveRanges.value.length > 0
  )
})

const braceActionStyle = computed<CSSProperties>(() => {
  const tone = operationTone.value ?? 'default'
  const colorVar = TONE_COLOR_VAR[tone] ?? TONE_COLOR_VAR.default
  return {
    color: `rgb(var(${colorVar}))`,
  }
})

watchEffect(() => {
  if (!open.value) return
  if (!braceActionText.value) return
  scheduleBraceTypeset()
})

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

    <v-card class="px-4">
      <v-card-title class="py-4">
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
            <div class="chip-row mt-2" role="group" aria-label="Algorithm status chips">
              <v-chip variant="flat" color="primary" size="small">
                Step {{ Math.min(i, steps.length) }} / {{ steps.length }}
              </v-chip>
              <v-chip v-if="currentDepth !== null" variant="outlined" color="info" size="small">
                Recursion Depth {{ currentDepth }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider class="mx-4" />

      <v-card-text class="pa-1">
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
          <v-tabs v-model="activeView" color="primary" density="comfortable" class="view-tabs">
            <v-tab value="bar">Bar Chart View</v-tab>
            <v-tab value="step">Step Based View</v-tab>
          </v-tabs>

          <div v-if="braceActionText" class="brace-context text-caption mt-5">
            <strong class="brace-context__label" :style="braceActionStyle" v-html="braceActionText"></strong>
          </div>

          <v-window v-model="activeView" class="mt-4">
            <v-window-item value="bar">
              <BarChartView
                :arr="arr"
                :active-indices="active"
                :pivot-index="pivotIndex"
                :operation-tone="operationTone"
                :inactive-ranges="inactiveRanges"
              />
            </v-window-item>
            <v-window-item value="step">
              <StepBasedView
                :show-range-section="showRangeSection"
                :subarrays="subarrays"
                :pivot-index="pivotIndex"
                :range-grid-style="rangeGridStyle"
                :range-entries="rangeEntries"
                :active-range="activeRange"
                :inactive-ranges="inactiveRanges"
                :operation-classes="operationClasses"
                :arr="arr"
                :active-indices="active"
              />
            </v-window-item>
          </v-window>

          <v-container class="viz-section" fluid tag="section">
            <v-row
              class="viz-section__header viz-section__header--stacked"
              align="center"
              justify="center"
              no-gutters
            >
              <v-col cols="12">
                <div class="section-title">
                  <v-tooltip text="Playback controls" location="top">
                    <template #activator="{ props }">
                      <v-icon
                        v-bind="props"
                        icon="mdi-information-outline"
                        size="16"
                        class="section-title__icon"
                        aria-label="Playback info"
                        tabindex="0"
                      />
                    </template>
                  </v-tooltip>
                  <span class="text-subtitle-2">Controls</span>
                </div>
              </v-col>
            </v-row>
            <v-row class="playback-row mt-4" align="center" justify="center" no-gutters>
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
              <v-col cols="12" sm="auto" class="playback-actions">
                <div class="playback-primary">
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
                  <v-btn
                    icon="mdi-shuffle"
                    variant="tonal"
                    color="secondary"
                    @click="randomizeArray"
                    :disabled="loadingAlgorithm"
                    aria-label="Shuffle array"
                  />
                </div>
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
.view-tabs {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.view-tabs :deep(.v-tab) {
  font-size: 0.85rem;
  letter-spacing: 0.04em;
}

.chip-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: -4px;
  scrollbar-gutter: stable both-edges;
}

.chip-row::-webkit-scrollbar {
  height: 4px;
}

.chip-row::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
}

.brace-context {
  margin-top: 8px;
  text-align: center;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.85;
}

.brace-context__label {
  font-size: 0.95rem;
  font-weight: 700;
}

.viz-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.viz-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.viz-section__header--stacked {
  flex-direction: column;
  text-align: center;
  gap: 6px;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.section-title__icon {
  color: rgba(255, 255, 255, 0.7);
  cursor: help;
  flex-shrink: 0;
}

.playback-row {
  row-gap: 16px;
}

.playback-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.playback-primary {
  display: flex;
  align-items: center;
  gap: 8px;
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
</style>
