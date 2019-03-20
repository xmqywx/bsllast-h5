import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      canvas: (state) => state.design.canvas,
      activeObject: (state) => state.design.activeObject,
      currentWidth: (state) => state.design.currentWidth,
      currentHeight: (state) => state.design.currentHeight,
      zoom: (state) => state.design.zoom,
      arrX: (state) => state.design.arrX,
      arrY: (state) => state.design.arrY

    })
  },
  methods: {
    setActiveProp(styleName, value) {
      const activeObject = this.getActiveObject()
      if (!activeObject) {
        return
      }
      activeObject.set({ [styleName]: value }).setCoords()
      activeObject.setCoords()
      this.canvas.trigger('object:modified')
      this.canvas.renderAll()
    },
    setActiveStyle({ styleName, value, activeObject, noModified }) {
      activeObject = activeObject || this.getActiveObject()
      setActiveStyle({ styleName, value, activeObject })
      activeObject.setCoords()
      !noModified && this.canvas.trigger('object:modified')
      this.canvas.requestRenderAll()
    },
    getActiveObject() {
      const activeObject =
        this.canvas.getActiveObject() ||
        null

      if (!(activeObject && typeof activeObject.set === 'function')) {
        this.$message({
          type: 'info',
          message: '请选目标中元素'
        })
        return null
      }
      return activeObject
    }
  }
}
/**
 * 添加目标对象属性
 * @exports
 * @param {obj} params
 */
export function setActiveStyle({ styleName, value, activeObject }) {
  if (!activeObject) {
    return
  }
  if (activeObject.type === 'textbox') {
    // 文本样式
    let start = activeObject.selectionStart
    let end = activeObject.selectionEnd
    if (!activeObject.isEditing) {
      activeObject[styleName] = value
      end = activeObject.text.length
      start = 0
    }
    for (let index = start; index < end; index++) {
      const styles = activeObject.getSelectionStyles(index, index + 1) || [{}]
      const item = styles[0]
      const params = {
        [styleName]: value
      }
      item.isBold && styleName === 'fill' && (params.stroke = value)
      // 是否是加粗样式
      activeObject.setSelectionStyles(params, index, index + 1)
    }
  } else {
    activeObject.set(styleName, value)
  }
  activeObject.setCoords()
}
