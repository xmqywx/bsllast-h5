import mutations from './design-mutations.js'
import OSS from 'ali-oss'
import md5 from 'md5'
const ossclient = new OSS({
  region: 'oss-cn-shenzhen',
  accessKeyId: 'LTAIAIds4SrwLugV',
  accessKeySecret: 'dxVoG8iG7v6iSwLdrTUwEo2iIDsCos',
  bucket: 'bsl-prod',
  internal: false
})
const store = {
  state: {
    arrX: [],
    arrY: [],
    activeObject: null,
    canvas: null,
    controlPadding: 0,
    documentFontFamily: [],
    mainTool: true,
    textTool: false,
    imageTool: false,
    padding: 100,
    pannelW: 100,
    pannelH: 100,
    pannelOffsetX: 0,
    pannelOffsetY: 0,
    redo: [],
    undo: [],
    undoRedoState: null,

    toJSONProperties: [
      'colorList',
      'clipMask',
      'clipClone',
      'clipLeft',
      'clipTop',
      'clipScaleX',
      'clipScaleY',
      'clipIndex',
      'crossOrigin',
      'echartsOptions',
      'groupId',
      'id',
      'isRepeatLine',
      'isShape',
      'isCustomSvgGroup',
      'initialScale',
      'info',
      'lineFixScale',
      'lineColor',
      'needDissolve',
      'objectCaching',
      'svgScale',
      'stype',
      'svgPatternUrl'
    ]
  },
  mutations: mutations,
  actions: {
    uploadOSS: async function({ state, commit }) {
      const left =
        (state.currentWidth - state.pannelW * state.zoom) / 2 +
        state.canvas.viewportTransform[4]

      const top =
        (state.currentHeight - state.pannelH * state.zoom) / 2 +
        state.canvas.viewportTransform[5]

      state.canvas.renderAll()
      const pxWidth = state.pannelW * state.zoom
      const pxHeight = state.pannelH * state.zoom

      const pxWidthValue = pxWidth.toFixed(4)
      const pxHeightValue = pxHeight.toFixed(4)
      const urlBase64 = state.canvas.toDataURL({
        left,
        top,
        width: pxWidthValue,
        height: pxHeightValue,
        format: 'png',
        multiplier: 1 / state.zoom
      })
      const blobPNG = getBlob(urlBase64)
      const objKey = `canvasmobile/work_${md5(urlBase64)}`
      await ossclient.put(`${objKey}.png`, blobPNG)
      return objKey
    }
  }
}
function getBlob(base64Str) {
  const arr = base64Str.split(',')
  const bstr = atob(arr[1])
  const mime = arr[0].match(/:(.*?)/)[1]
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
export default store
