<!-- src/views/errors/UnauthorizedView.vue -->
<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" md="6">
        <v-card class="text-center pa-8">
          <v-icon size="120" color="error">mdi-lock</v-icon>
          
          <h1 class="text-h3 font-weight-bold mt-4 mb-2">403</h1>
          <h2 class="text-h5 mb-4">Access Denied</h2>
          
          <p class="text-body-1 mb-6">
            You don't have permission to access this page.
          </p>

          <v-btn color="primary" size="large" @click="goBack">
            <v-icon left>mdi-arrow-left</v-icon>
            Go Back
          </v-btn>

          <v-btn color="secondary" size="large" class="ml-4" @click="goHome">
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

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/dashboard')
}
</script>