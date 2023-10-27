import copy from 'recursive-copy'
import {
  deleteSync
} from 'del'

const baseDir = `node_modules/cesium/Build/CesiumUnminified`
const targets = [
  'Assets/**/*',
  'ThirdParty/**/*',
  'Widgets/**/*',
  'Workers/**/*',
  'Cesium.js',
]

deleteSync(targets.map((src) => `public/lib/cesium/${src}`))
copy(baseDir, `public/lib/cesium`, {
  expand: true,
  overwrite: true,
  filter: targets
})