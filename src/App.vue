<script setup lang="ts">
import { ref } from 'vue'
import {
  BubbleSort,
  InsertionSort,
  MergeSort,
  QuickSort,
  SelectionSort,
  sortingAlgorithmInfoList,
} from '@/core/sorting'
import type { SortOperation } from '@/core/interfaces/sortingTypes'

const arr = ref<number[]>([3, 1, 5, 21, 5, 3, 6, 3, 5, 63, 4])
const active = ref<number[]>([])
let i = 0

function play(steps: SortOperation[]) {
  if (i >= steps.length) {
    return
  }

  const step = steps[i]

  if (!step) {
    return
  }

  arr.value = [...step.snapshot]
  active.value = [...step.indices]
  i++
  setTimeout(play, 500)
}

function logSteps(steps: SortOperation[]) {
  steps.forEach((step, index) => {
    console.log(`Step ${index + 1}:`, {
      type: step.type,
      indices: [...step.indices],
      snapshot: [...step.snapshot],
    })
  })
}
</script>

<template>
  <v-app>
    <v-main>
      <v-container fluid class="bg-surface h-50">
        <v-row justify="center" align="center" class="fill-height">
          <v-col sm="12" md="8" lg="5" class="justify-center" wrap>
            <h1 class="text-h3 text-center font-weight-bold text-lg-h2 my-4">
              Algorithm Visualizer
            </h1>
            <p class="text-body-1 text-center my-4">
              An interactive tool to visualize and understand various algorithms through dynamic
              animations and user-friendly controls.
            </p>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="bg-surface-2">
        <v-container>
          <v-row>
            <v-col
              v-for="algorithm in sortingAlgorithmInfoList"
              :key="algorithm.key"
              cols="12"
              lg="6"
              md="8"
              sm="12"
            >
              <v-card :title="algorithm.title">
                <v-card-text class="text-body-2">
                  {{ algorithm.info }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
h1,
p {
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.5);
}
</style>
