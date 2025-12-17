<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'

type RangeEntry = {
  index: number
  value: number
}

type SubarraySlice = {
  l: number
  r: number
  values: number[]
  label: string
}

type OperationClassMap = {
  array: string | null
  range: string | null
  pivot: string | null
  brace: string | null
}

const props = defineProps<{
  showRangeSection: boolean
  subarrays: SubarraySlice[]
  pivotIndex: number | null
  rangeGridStyle: CSSProperties
  rangeEntries: RangeEntry[]
  activeRange: readonly [number, number] | null
  inactiveRanges: readonly [number, number][]
  operationClasses: OperationClassMap
  arr: number[]
  activeIndices: number[]
}>()

const hasSubarrays = computed(() => props.subarrays.length > 0)
const rangeLength = computed(() => props.rangeEntries.length)
const hasInactiveRanges = computed(() => props.inactiveRanges.length > 0)

const sortedLength = computed(() =>
  props.inactiveRanges.reduce((total, [start, end]) => {
    if (!Number.isInteger(start) || !Number.isInteger(end)) return total
    return total + Math.max(0, end - start + 1)
  }, 0),
)

const heapLength = computed(() => {
  const range = props.activeRange
  if (!range) return null
  const length = range[1] - range[0] + 1
  return length > 0 ? length : null
})

function isInActiveRange(index: number): boolean {
  const range = props.activeRange
  return !!range && index >= range[0] && index <= range[1]
}

function isPivotIndex(index: number): boolean {
  return props.pivotIndex === index
}

function isInInactiveRange(index: number): boolean {
  return props.inactiveRanges.some(([start, end]) => index >= start && index <= end)
}

function getBraceGridStyle(slice: SubarraySlice) {
  const length = rangeLength.value
  if (!length) return {}
  const start = Math.max(0, Math.min(slice.l, length - 1))
  const end = Math.max(start, Math.min(slice.r, length - 1))
  return {
    gridColumn: `${start + 1} / ${end + 2}`,
  }
}

function getBraceLatex(slice: SubarraySlice) {
  const content = slice.values.length
    ? slice.values.map((value) => value.toString()).join('\\;')
    : '\\;'
  return `\\(\\overbrace{${content}}^{\\text{${slice.label}}}\\)`
}

</script>

<template>
  <div class="step-view">
    <v-container v-if="showRangeSection" class="viz-section" fluid tag="section">
      <v-row
        class="viz-section__header viz-section__header--stacked"
        align="center"
        justify="center"
        no-gutters
      >
        <v-col cols="12">
          <div class="section-title">
            <v-tooltip text="Braces show active slices" location="top">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  icon="mdi-information-outline"
                  size="16"
                  class="section-title__icon"
                  aria-label="Active range info"
                  tabindex="0"
                />
              </template>
            </v-tooltip>
            <span class="text-subtitle-2">Active Range</span>
          </div>
        </v-col>
        <v-col cols="12" class="title-chip">
          <v-chip v-if="pivotIndex !== null" size="x-small" color="warning" variant="flat">
            Pivot @ {{ pivotIndex }}
          </v-chip>
        </v-col>
        <v-col v-if="hasInactiveRanges" cols="12" class="heap-legend" role="status">
          <div class="heap-legend__item">
            <span class="heap-legend__swatch heap-legend__swatch--heap" aria-hidden="true"></span>
            <span>Heap</span>
            <span v-if="heapLength !== null" class="heap-legend__metric">{{ heapLength }}</span>
          </div>
          <div class="heap-legend__item">
            <span class="heap-legend__swatch heap-legend__swatch--sorted" aria-hidden="true"></span>
            <span>Sorted tail</span>
            <span class="heap-legend__metric">{{ sortedLength }}</span>
          </div>
        </v-col>
      </v-row>
      <div class="range-array">
        <div class="range-grid" :style="rangeGridStyle">
          <div
            v-for="entry in rangeEntries"
            :key="`range-${entry.index}`"
            class="range-cell-wrapper"
          >
            <div
              :class="[
                'range-cell',
                isInInactiveRange(entry.index) && 'range-cell--inactive',
                isInActiveRange(entry.index) && 'range-cell--active',
                isInActiveRange(entry.index) ? operationClasses.range : null,
                isPivotIndex(entry.index) && 'range-cell--pivot',
                isPivotIndex(entry.index) ? operationClasses.pivot : null,
              ]"
            >
              <span class="range-cell__index">{{ entry.index }}</span>
              <span class="range-cell__value">{{ entry.value }}</span>
            </div>
          </div>
          <template v-if="hasSubarrays">
            <div
              v-for="(slice, sliceIndex) in subarrays"
              :key="`brace-${sliceIndex}`"
              :class="['subarray-brace', operationClasses.brace]"
              :style="getBraceGridStyle(slice)"
              role="img"
              :aria-label="`Subarray ${slice.label}`"
            >
              <span class="subarray-brace__formula" v-html="getBraceLatex(slice)" />
            </div>
          </template>
        </div>
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
            <v-tooltip text="Highlighted indices are active" location="top">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  icon="mdi-information-outline"
                  size="16"
                  class="section-title__icon"
                  aria-label="Array state info"
                  tabindex="0"
                />
              </template>
            </v-tooltip>
            <span class="text-subtitle-2">Array State</span>
          </div>
        </v-col>
      </v-row>
      <v-row class="array-grid" justify="center" dense>
        <v-col cols="auto" v-for="(val, idx) in arr" :key="idx">
          <div
            class="array-cell"
            :class="[
              activeIndices.includes(idx) ? 'array-cell--active' : 'array-cell--idle',
              activeIndices.includes(idx) ? operationClasses.array : null,
              !activeIndices.includes(idx) && isInInactiveRange(idx)
                ? 'array-cell--inactive'
                : null,
            ]"
          >
            {{ val }}
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

.range-array {
  border-radius: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.04);
  width: 100%;
}

.range-grid {
  position: relative;
  display: grid;
  column-gap: 10px;
  row-gap: 14px;
  width: 100%;
}

.range-cell-wrapper {
  grid-row: 1;
}

.range-cell {
  position: relative;
  min-width: 1.93rem;
  padding: 4px 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
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

.range-cell--inactive {
  background: rgba(255, 255, 255, 0.04);
  opacity: 0.75;
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

.heap-legend {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.heap-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.75rem;
}

.heap-legend__swatch {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.heap-legend__swatch--heap {
  background: rgba(var(--v-theme-primary), 0.6);
}

.heap-legend__swatch--sorted {
  background: rgba(255, 255, 255, 0.55);
}

.heap-legend__metric {
  font-weight: 600;
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

.array-cell--inactive {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
}

.array-cell--active.array-cell--op-default {
  background: rgba(var(--v-theme-accent), 0.3);
  color: rgb(var(--v-theme-on-accent));
}

.subarray-brace {
  grid-row: 2;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 4px 0;
  --brace-color: rgb(var(--v-theme-secondary));
  color: var(--brace-color);
  text-align: center;
}

.subarray-brace__formula {
  display: flex;
  width: 100%;
  justify-content: center;
}

.subarray-brace__formula mjx-container {
  color: currentColor !important;
  font-size: 0.9rem;
}

.subarray-brace__formula mjx-mtext {
  font-weight: 600;
}

.subarray-brace--compare {
  --brace-color: rgb(var(--v-theme-info));
}

.subarray-brace--swap {
  --brace-color: rgb(var(--v-theme-warning));
}

.subarray-brace--write {
  --brace-color: rgb(var(--v-theme-success));
}

.subarray-brace--insert {
  --brace-color: rgb(var(--v-theme-primary));
}

.subarray-brace--partition {
  --brace-color: rgb(var(--v-theme-secondary));
}

.subarray-brace--base {
  --brace-color: rgb(var(--v-theme-surface-variant));
}

.subarray-brace--default {
  --brace-color: rgb(var(--v-theme-accent));
}

</style>
