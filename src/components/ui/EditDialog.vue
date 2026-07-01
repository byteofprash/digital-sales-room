<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: []; save: [] }>()
</script>

<template>
  <TransitionRoot :show="open" as="template">
    <Dialog class="relative z-50" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="duration-150 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-100 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-t1-navy/40" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="duration-150 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel
            class="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t1-md bg-white shadow-t1-lifted"
          >
            <div class="flex items-center justify-between border-b border-t1-line px-5 py-4">
              <DialogTitle class="font-display text-base font-bold text-t1-navy">
                {{ title }}
              </DialogTitle>
              <button
                class="flex h-7 w-7 items-center justify-center rounded-md hover:bg-t1-navy/5"
                @click="emit('close')"
              >
                <XMarkIcon class="h-4 w-4 text-t1-ink-3" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-5 py-4">
              <slot />
            </div>

            <div class="flex items-center justify-end gap-2 border-t border-t1-line px-5 py-4">
              <button
                class="rounded-md border border-t1-line px-4 py-2 text-xs font-bold text-t1-ink-2 hover:border-t1-ink-2"
                @click="emit('close')"
              >
                Cancel
              </button>
              <button
                class="rounded-md bg-t1-electric px-4 py-2 text-xs font-bold text-white hover:bg-t1-electric-hover"
                @click="emit('save')"
              >
                Save
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
