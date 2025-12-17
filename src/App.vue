<script setup lang="ts">
import { defineAsyncComponent, nextTick, onMounted } from 'vue'
import { sortingAlgorithmInfoList } from '@/core/sorting'

const Popup = defineAsyncComponent(() => import('@/core/components/Popup.vue'))

const formatComplexity = (label: string, expression: string) => `${label}: \\(${expression}\\)`

const scheduleMathJax = () => {
  void nextTick(() => {
    window.MathJax?.typesetPromise?.()
  })
}

onMounted(() => {
  scheduleMathJax()
})
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
              <v-card :title="algorithm.title" class="text-center">
                <v-card-text class="text-body-2 text-center algo-card-text">
                  <p class="algo-description">
                    {{ algorithm.description }}
                  </p>
                  <div class="complexity-row">
                    <span
                      class="complexity-label"
                      v-html="formatComplexity('Time', algorithm.timeComplexity)"
                    />
                    <span
                      class="complexity-label"
                      v-html="formatComplexity('Space', algorithm.spaceComplexity)"
                    />
                  </div>
                </v-card-text>
                <v-card-actions class="justify-center">
                  <Popup :algorithm-name="algorithm.title" :algorithm-loader="algorithm.loader" />
                </v-card-actions>
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

.algo-card-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.algo-description {
  margin: 0;
}

.complexity-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.complexity-label {
  font-weight: 600;
}

.complexity-label mjx-container {
  font-size: 0.95rem;
}
</style>
