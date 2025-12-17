<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'

const TONE_COLOR_VAR: Record<string, string> = {
  compare: '--v-theme-info',
  swap: '--v-theme-warning',
  write: '--v-theme-success',
  insert: '--v-theme-primary',
  partition: '--v-theme-secondary',
  base: '--v-theme-surface-variant',
  default: '--v-theme-accent',
}

const props = defineProps<{
  arr: number[]
  activeIndices: number[]
  pivotIndex: number | null
  operationTone: string | null
  braceActionText: string
  braceActionStyle: CSSProperties
  loadingAlgorithm: boolean
  stepsLength: number
  currentStepIndex: number
  playing: boolean
  finished: boolean
  speedDisplay: string
  canDecreaseSpeed: boolean
  canIncreaseSpeed: boolean
}>()

const emit = defineEmits<{
  (event: 'randomize'): void
  (event: 'seek', value: number): void
  (event: 'play'): void
  (event: 'pause'): void
  (event: 'increase-speed'): void
  (event: 'decrease-speed'): void
}>()

const activeSet = computed(() => new Set(props.activeIndices))

const maxValue = computed(() => {
  if (!props.arr.length) return 0
  return Math.max(...props.arr)
})

const toneColorVar = computed(() => {
  const tone = props.operationTone ?? 'default'
  return TONE_COLOR_VAR[tone] ?? TONE_COLOR_VAR.default
})

const hasData = computed(() => props.arr.length > 0)

const barData = computed(() => {
  const max = maxValue.value || 1
  return props.arr.map((value, index) => {
    const normalized = Math.max((value / max) * 100, value > 0 ? 6 : 0)
    return {
      value,
      index,
      height: normalized,
      isActive: activeSet.value.has(index),
      isPivot: props.pivotIndex === index,
    }
  })
})

function getBarFillStyle(entry: (typeof barData.value)[number]) {
  const baseAlpha = entry.isActive ? 0.9 : 0.35
  const colorVar = toneColorVar.value
  return {
    height: `${entry.height}%`,
    backgroundColor: `rgba(var(${colorVar}), ${baseAlpha})`,
  }
}

function handleRandomize() {
  emit('randomize')
}

function handleSeek(value: number) {
  emit('seek', value)
}

function handlePlay() {
  emit('play')
}

function handlePause() {
  emit('pause')
}

function handleIncreaseSpeed() {
  emit('increase-speed')
}

function handleDecreaseSpeed() {
  emit('decrease-speed')
}
</script>

<template>
  <div class="bar-view">
    <div v-if="braceActionText" class="brace-context text-caption">
      <strong class="brace-context__label" :style="braceActionStyle" v-html="braceActionText"></strong>
    </div>
    <v-container class="viz-section" fluid tag="section">
      <v-row
        class="viz-section__header viz-section__header--stacked"
        align="center"
        justify="center"
        no-gutters
      >
        <v-col cols="12">
          <div class="section-title">
            <v-tooltip text="Height reflects current value" location="top">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  icon="mdi-information-outline"
                  size="16"
                  class="section-title__icon"
                  aria-label="Bar chart info"
                  tabindex="0"
                />
              </template>
            </v-tooltip>
            <span class="text-subtitle-2">Bar Chart</span>
          </div>
        </v-col>
        <v-col cols="12" class="title-chip">
          <v-chip v-if="pivotIndex !== null" size="x-small" color="warning" variant="flat">
            Pivot @ {{ pivotIndex }}
          </v-chip>
        </v-col>
      </v-row>

      <div class="bar-chart" role="img" aria-label="Array values shown as bars">
        <div v-if="hasData" class="bar-chart__grid">
          <div
            v-for="bar in barData"
            :key="bar.index"
            class="chart-bar"
            :class="{
              'chart-bar--active': bar.isActive,
              'chart-bar--pivot': bar.isPivot,
            }"
            :aria-label="`Value ${bar.value} at index ${bar.index}`"
          >
            <span class="chart-bar__value">{{ bar.value }}</span>
            <div class="chart-bar__fill-wrapper">
              <div class="chart-bar__fill" :style="getBarFillStyle(bar)" />
            </div>
            <span class="chart-bar__index">{{ bar.index }}</span>
          </div>
        </div>
        <v-alert v-else type="info" variant="tonal" density="comfortable">
          No data available. Randomize to generate a new array.
        </v-alert>
      </div>
    </v-container>

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
                  aria-label="Controls info"
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
            :max="stepsLength"
            step="1"
            :model-value="currentStepIndex"
            @update:model-value="handleSeek"
            thumb-label
            :disabled="!stepsLength"
          />
        </v-col>
        <v-col cols="12" sm="auto" class="playback-actions">
          <div class="playback-primary">
            <v-btn
              v-if="!playing"
              color="primary"
              @click="handlePlay"
              :disabled="!stepsLength"
              :icon="finished ? 'mdi-replay' : 'mdi-play'"
              :aria-label="finished ? 'Replay animation' : 'Play animation'"
            />
            <v-btn
              v-else
              color="warning"
              @click="handlePause"
              icon="mdi-pause"
              aria-label="Pause animation"
            />
            <v-btn
              icon="mdi-shuffle"
              variant="tonal"
              color="secondary"
              @click="handleRandomize"
              :disabled="loadingAlgorithm"
              aria-label="Shuffle array"
            />
          </div>
          <div class="playback-controls">
            <v-btn
              icon="mdi-rewind"
              variant="tonal"
              color="secondary"
              @click="handleDecreaseSpeed"
              :disabled="!stepsLength || !canDecreaseSpeed"
              aria-label="Slow down playback"
            />
            <v-chip size="small" variant="tonal" color="secondary" class="playback-speed">
              {{ speedDisplay }}
            </v-chip>
            <v-btn
              icon="mdi-fast-forward"
              variant="tonal"
              color="secondary"
              @click="handleIncreaseSpeed"
              :disabled="!stepsLength || !canIncreaseSpeed"
              aria-label="Speed up playback"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
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

.title-chip {
  display: flex;
  justify-content: center;
}

.brace-context {
  margin-bottom: 6px;
  text-align: center;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.85;
}

.brace-context__label {
  font-size: 0.95rem;
  font-weight: 700;
}

.bar-chart {
  border-radius: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.04);
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-chart__grid {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  justify-content: center;
  padding: 4px;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  scroll-snap-align: start;
}

.chart-bar__value {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.chart-bar__fill-wrapper {
  width: 100%;
  height: 220px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: flex-end;
  padding: 4px;
}

.chart-bar__fill {
  width: 100%;
  border-radius: 999px;
  transition:
    height 0.24s ease,
    background-color 0.24s ease,
    box-shadow 0.24s ease;
}

.chart-bar__index {
  font-size: 0.75rem;
  opacity: 0.7;
}

.chart-bar--pivot .chart-bar__fill {
  box-shadow: 0 0 0 2px rgb(var(--v-theme-warning));
}

.chart-bar--active .chart-bar__fill {
  filter: saturate(1.2);
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

.playback-primary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.playback-row {
  row-gap: 16px;
}

@media (max-width: 600px) {
  .chart-bar__value {
    font-size: 0.75rem;
  }

  .chart-bar__fill-wrapper {
    height: 180px;
  }

  .playback-actions {
    justify-content: space-between;
  }
}

@media (min-width: 960px) {
  .bar-chart__grid {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
