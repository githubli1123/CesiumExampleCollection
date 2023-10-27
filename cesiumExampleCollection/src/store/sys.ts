import { defineStore } from 'pinia'
import { Viewer } from 'cesium'

export interface SysStore {
  cesiumViewer: Viewer | null
}

export const useSysStore = defineStore({
  id: 'sys',
  state: (): SysStore => ({
    cesiumViewer: null
  }),
  actions: {
    setCesiumViewer(viewer: Viewer) {
      this.cesiumViewer = viewer
    }
  }
})