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
      <v-container fluid class="bg-surface hero-section">
        <v-row justify="center" align="center" class="fill-height hero-row">
          <v-col sm="12" md="8" lg="5" class="hero-col d-flex flex-column align-center text-center">
            <h1 class="text-h3 text-center font-weight-bold text-lg-h2 my-4 hero-title">
              Algorithm Visualizer
            </h1>
            <p class="text-body-1 text-center my-4 hero-subtitle">
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
.hero-section {
  position: relative;
  min-height: 55vh;
  overflow: hidden;
  padding-block: 56px;
}

.hero-section::before {
  font-size: 2.5rem;
  line-height: 1.6;
  letter-spacing: 0.8em;
  position: absolute;
  inset: 8% 10% auto;
  color: rgba(255, 255, 255, 0.65);
  opacity: 0.08;
  transform: rotate(-8deg);
  white-space: pre;
  pointer-events: none;
}

.hero-section::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.08), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(136, 192, 208, 0.15), transparent 40%),
    linear-gradient(135deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0));
  pointer-events: none;
}

.hero-row,
.hero-col {
  position: relative;
  z-index: 1;
}

.hero-row {
  min-height: 55vh;
  display: flex !important;
  align-items: center;
}

.hero-col {
  margin-inline: auto;
  gap: 8px;
}

.hero-title,
.hero-subtitle {
  text-shadow: 2px 4px 18px rgba(0, 0, 0, 0.55);
}

.hero-subtitle {
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
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
