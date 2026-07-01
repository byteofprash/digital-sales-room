<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-2 py-24 text-center">
    <div class="font-display text-2xl font-bold tracking-tight text-t1-navy">
      This section is on its way
    </div>
    <p class="max-w-sm text-sm text-t1-ink-3">
      {{ String(route.params.section ?? '') }} isn't part of this preview yet — this pass focuses
      on the Workspace Home.
    </p>
  </div>
</template>
