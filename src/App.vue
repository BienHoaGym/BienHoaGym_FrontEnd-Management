<!-- src/App.vue -->
<template>
  <v-app>
    <router-view />
    <!-- Global Alert Dialog System -->
    <global-alert />
  </v-app>
</template>

<script setup>
import GlobalAlert from '@/components/common/GlobalAlert.vue'
</script>

<style>
/* Global styles */
*:not(.v-icon):not(.v-icon *):not([class*="mdi-"]) {
  font-family: 'Be Vietnam Pro', sans-serif !important;
}

h1, h2, h3, h4, h5, h6, .v-application {
  font-family: 'Be Vietnam Pro', sans-serif !important;
}
</style>