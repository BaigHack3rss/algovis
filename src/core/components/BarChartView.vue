<script setup lang="ts">
import { computed } from 'vue'

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
  inactiveRanges: readonly [number, number][]
}>()

const activeSet = computed(() => new Set(props.activeIndices))

const normalizedInactiveRanges = computed(() =>
  props.inactiveRanges
    .map(([start, end]) => {
      if (!Number.isInteger(start) || !Number.isInteger(end)) return null
      if (end < start) return null
      return [start, end] as [number, number]
    })
    .filter((range): range is [number, number] => !!range),
)

const hasInactiveRanges = computed(() => normalizedInactiveRanges.value.length > 0)

const inactiveCount = computed(() =>
  normalizedInactiveRanges.value.reduce((total, [start, end]) => total + (end - start + 1), 0),
)

const heapCount = computed(() => Math.max(props.arr.length - inactiveCount.value, 0))

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
    const isInactive = normalizedInactiveRanges.value.some(
      ([start, end]) => index >= start && index <= end,
    )
    return {
      value,
      index,
      height: normalized,
      isActive: activeSet.value.has(index),
      isPivot: props.pivotIndex === index,
      isInactive,
    }
  })
})

function getBarFillStyle(entry: (typeof barData.value)[number]) {
  const baseAlpha = entry.isInactive ? 0.18 : entry.isActive ? 0.9 : 0.35
  const colorVar = toneColorVar.value
  const backgroundColor = `rgba(var(${colorVar}), ${baseAlpha})`
  const backgroundImage = entry.isInactive
    ? `repeating-linear-gradient(135deg, rgba(var(${colorVar}), 0.18) 0px, rgba(var(${colorVar}), 0.18) 6px, transparent 6px, transparent 12px)`
    : undefined
  return {
    height: `${entry.height}%`,
    backgroundColor,
    backgroundImage,
  }
}

</script>

<template>
  <div class="bar-view">
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
              'chart-bar--inactive': bar.isInactive,
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
      <div v-if="hasInactiveRanges" class="bar-chart__legend" role="status">
        <div class="bar-chart__legend-item">
          <span class="bar-chart__legend-swatch bar-chart__legend-swatch--heap" aria-hidden="true"></span>
          <span>Heap</span>
          <span class="bar-chart__legend-metric">{{ heapCount }}</span>
        </div>
        <div class="bar-chart__legend-item">
          <span class="bar-chart__legend-swatch bar-chart__legend-swatch--sorted" aria-hidden="true"></span>
          <span>Sorted tail</span>
          <span class="bar-chart__legend-metric">{{ inactiveCount }}</span>
        </div>
      </div>
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

.chart-bar--inactive .chart-bar__value,
.chart-bar--inactive .chart-bar__index {
  opacity: 0.55;
}

.chart-bar--inactive .chart-bar__fill-wrapper {
  background: rgba(255, 255, 255, 0.03);
}

.bar-chart__legend {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.bar-chart__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.75rem;
}

.bar-chart__legend-swatch {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.bar-chart__legend-swatch--heap {
  background: rgba(var(--v-theme-primary), 0.6);
}

.bar-chart__legend-swatch--sorted {
  background: rgba(255, 255, 255, 0.55);
}

.bar-chart__legend-metric {
  font-weight: 600;
}

@media (max-width: 600px) {
  .chart-bar__value {
    font-size: 0.75rem;
  }

  .chart-bar__fill-wrapper {
    height: 180px;
  }
}

@media (min-width: 960px) {
  .bar-chart__grid {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
