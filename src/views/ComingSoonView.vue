<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-2 py-24 text-center">
    <div class="text-2xl font-light tracking-tight text-t1-black">
      This section is on its way
    </div>
    <p class="max-w-sm text-sm text-t1-black/65">
      {{ String(route.params.section ?? '') }} isn't part of this preview yet — this pass focuses
      on the Workspace Home.
    </p>
  </div>
</template>
