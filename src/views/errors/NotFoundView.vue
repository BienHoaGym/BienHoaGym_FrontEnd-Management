<!-- src/views/errors/NotFoundView.vue -->
<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" md="6">
        <v-card class="text-center pa-8">
          <v-icon size="120" color="warning">mdi-map-marker-question</v-icon>
          
          <h1 class="text-h3 font-weight-bold mt-4 mb-2">404</h1>
          <h2 class="text-h5 mb-4">Page Not Found</h2>
          
          <p class="text-body-1 mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>

          <v-btn color="primary" size="large" @click="goHome">
            <v-icon left>mdi-home</v-icon>
            Go to Dashboard
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>
