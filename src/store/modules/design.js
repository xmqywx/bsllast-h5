import mutations from './design-mutations.js'
const store = {
  state: {
    arrX: [],
    arrY: [],
    activeObject: null,
    canvas: null,
    controlPadding: 3,
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
  mutations: mutations
}
export default store
