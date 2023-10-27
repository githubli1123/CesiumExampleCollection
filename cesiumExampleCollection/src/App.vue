<!--
 * @Author: Wu Zhoujie
 * @Date: 2023-09-01 15:33:32
 * @LastEditTime: 2023-09-01 15:39:23
 * @Description: 
-->
<template>
  <div ref="containerRef" id="cesiumContainer"></div>
  <div ref="unvisibleCreditRef" v-show="false"></div>
  <Subscriber />
</template>

<script lang="ts" setup>
import { ref, onMounted, markRaw } from 'vue'
import { ArcGisMapServerImageryProvider, Camera, Viewer, Rectangle } from 'cesium'
import { useSysStore } from '@/store/sys'
import Subscriber from './Subscriber.vue'

const containerRef = ref<HTMLDivElement>()
const unvisibleCreditRef = ref<HTMLDivElement>()
const sysStore = useSysStore()

Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(
  75.0, // 东
  0.0, // 南
  140.0, // 西
  60.0 // 北
)

onMounted(() => {
  const viewer = new Viewer(containerRef.value as HTMLElement, {
    animation: false,
    timeline: false,
    geocoder: false,
    homeButton: false,
    scene3DOnly: true,
    baseLayerPicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    infoBox: false,
    creditContainer: unvisibleCreditRef.value,
    imageryProvider: new ArcGisMapServerImageryProvider({
      url: `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer`
    }),
    msaaSamples: 4,
    selectionIndicator: false,
    // contextOptions: {
      // requestWebgl2: true
    // }
  })

  const rawViewer = markRaw(viewer)
  sysStore.setCesiumViewer(rawViewer)
})
</script>

<style>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
}
</style>
