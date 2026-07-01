import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/room/acme-corp' },
    {
      path: '/room/:slug',
      name: 'workspace-home',
      component: () => import('@/views/WorkspaceHome.vue'),
    },
    {
      path: '/room/:slug/:section',
      name: 'workspace-section',
      component: () => import('@/views/ComingSoonView.vue'),
    },
  ],
})

export default router
