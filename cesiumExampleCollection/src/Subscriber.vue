<template>
  <button @click="onClick" class="subbtn">控制台打印 viewer</button>
</template>


<script setup lang='ts'>
import { useSysStore } from '@/store/sys'
const sysStore = useSysStore()

const onClick = () => {
  console.log(sysStore.$state.cesiumViewer)
}
</script>


<style scoped>
.subbtn {
  position: fixed;
  top: 10vh;
  left: 10vh;
  font-size: 1rem;
  background-color: #2ea44f;
  border: 1px solid rgba(27, 31, 35, .15);
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  height: 2rem;
}
</style>