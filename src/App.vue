<script setup lang="ts">
import Popup from '@/core/components/Popup.vue'
import { sortingAlgorithmInfoList } from '@/core/sorting'
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
                <v-card-text class="text-body-2 text-center">
                  {{ algorithm.info }}
                </v-card-text>
                <v-card-actions class="justify-center">
                  <Popup
                    :algorithm-name="algorithm.title"
                    :algorithm-constructor="algorithm.constructor"
                  />
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
</style>
