import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Canvas,
  Circle,
  FabricImage,
  type FabricObject,
  Point,
  Rect,
  Textbox,
} from 'fabric'
import './App.css'

const DRAFT_KEY = 'cover-maker-draft-v1'
const HISTORY_LIMIT = 80
const FONT_PREFS_KEY = 'cover-maker-font-preferences-v1'
const MAX_RECENT_FONT_COUNT = 8
const CANVAS_MIN_SIZE = 320
const CANVAS_MAX_SIZE = 4096
const CANVAS_VIEWPORT_PADDING = 36
const CANVAS_VIEWPORT_MIN_SCALE = 0.12
const CANVAS_VIEWPORT_MAX_SCALE = 1
const CANVAS_USER_ZOOM_MIN = 0.25
const CANVAS_USER_ZOOM_MAX = 4
const CANVAS_USER_ZOOM_STEP = 0.1
const DEFAULT_CANVAS_SIZE = { width: 1280, height: 720 }

const PRESET_SIZES = [
  { label: '横版 1280 x 720', value: '1280x720', width: 1280, height: 720 },
  { label: '全高清 1920 x 1080', value: '1920x1080', width: 1920, height: 1080 },
  { label: '2K 超清 2560 x 1440', value: '2560x1440', width: 2560, height: 1440 },
  { label: '4K 超清 3840 x 2160', value: '3840x2160', width: 3840, height: 2160 },
  { label: '竖版 1080 x 1920', value: '1080x1920', width: 1080, height: 1920 },
  { label: '方形 1080 x 1080', value: '1080x1080', width: 1080, height: 1080 },
]

type FontCategory = '花体字' | '装饰标题' | '中文正文字体' | '无衬线' | '衬线'

type FontLibraryItem = {
  id: string
  label: string
  family: string
  category: FontCategory
  tags: string[]
  preview: string
}

const FONT_LIBRARY: FontLibraryItem[] = [
  {
    id: 'pacifico',
    label: 'Pacifico',
    family: 'Pacifico',
    category: '花体字',
    tags: ['script', 'latin', 'handwriting'],
    preview: 'Cover Title 2026',
  },
  {
    id: 'lobster',
    label: 'Lobster',
    family: 'Lobster',
    category: '花体字',
    tags: ['script', 'bold', 'poster'],
    preview: 'Hot New Episode',
  },
  {
    id: 'great-vibes',
    label: 'Great Vibes',
    family: 'Great Vibes',
    category: '花体字',
    tags: ['elegant', 'signature'],
    preview: 'Elegant Launch',
  },
  {
    id: 'dancing-script',
    label: 'Dancing Script',
    family: 'Dancing Script',
    category: '花体字',
    tags: ['casual', 'friendly'],
    preview: 'Daily Vlog Notes',
  },
  {
    id: 'cinzel-decorative',
    label: 'Cinzel Decorative',
    family: 'Cinzel Decorative',
    category: '装饰标题',
    tags: ['headline', 'classic'],
    preview: 'MASTER CLASS',
  },
  {
    id: 'avara',
    label: 'Avara',
    family: 'Avara',
    category: '装饰标题',
    tags: ['velvetyne', 'experimental', 'display'],
    preview: 'AVARA DISPLAY',
  },
  {
    id: 'compagnon',
    label: 'Compagnon',
    family: 'Compagnon',
    category: '衬线',
    tags: ['velvetyne', 'editorial', 'roman'],
    preview: 'Compagnon Story',
  },
  {
    id: 'outward-round',
    label: 'Outward Round',
    family: 'Outward Round',
    category: '装饰标题',
    tags: ['velvetyne', 'caps', 'impact'],
    preview: 'OUTWARD POWER',
  },
  {
    id: 'abril-fatface',
    label: 'Abril Fatface',
    family: 'Abril Fatface',
    category: '装饰标题',
    tags: ['google-fonts', 'headline', 'vintage'],
    preview: 'Editorial Cover',
  },
  {
    id: 'bebas-neue',
    label: 'Bebas Neue',
    family: 'Bebas Neue',
    category: '装饰标题',
    tags: ['google-fonts', 'condensed', 'poster'],
    preview: 'TRENDING NOW',
  },
  {
    id: 'anton',
    label: 'Anton',
    family: 'Anton',
    category: '无衬线',
    tags: ['google-fonts', 'bold', 'impact'],
    preview: 'BIG TITLE',
  },
  {
    id: 'caveat',
    label: 'Caveat',
    family: 'Caveat',
    category: '花体字',
    tags: ['google-fonts', 'handwriting'],
    preview: 'Daily Notes',
  },
  {
    id: 'allura',
    label: 'Allura',
    family: 'Allura',
    category: '花体字',
    tags: ['google-fonts', 'signature', 'smooth'],
    preview: 'Elegant Signature',
  },
  {
    id: 'sacramento',
    label: 'Sacramento',
    family: 'Sacramento',
    category: '花体字',
    tags: ['google-fonts', 'casual', 'script'],
    preview: 'Soft Script Mood',
  },
  {
    id: 'kaushan-script',
    label: 'Kaushan Script',
    family: 'Kaushan Script',
    category: '花体字',
    tags: ['google-fonts', 'brush', 'headline'],
    preview: 'Creator Weekly',
  },
  {
    id: 'satisfy',
    label: 'Satisfy',
    family: 'Satisfy',
    category: '花体字',
    tags: ['google-fonts', 'friendly', 'logo'],
    preview: 'Morning Recap',
  },
  {
    id: 'permanent-marker',
    label: 'Permanent Marker',
    family: 'Permanent Marker',
    category: '花体字',
    tags: ['google-fonts', 'marker', 'casual'],
    preview: 'Quick Highlight',
  },
  {
    id: 'bangers',
    label: 'Bangers',
    family: 'Bangers',
    category: '装饰标题',
    tags: ['google-fonts', 'comic', 'impact'],
    preview: 'MAX ENERGY',
  },
  {
    id: 'righteous',
    label: 'Righteous',
    family: 'Righteous',
    category: '无衬线',
    tags: ['google-fonts', 'rounded', 'tech'],
    preview: 'Future Lab',
  },
  {
    id: 'playfair-display',
    label: 'Playfair Display',
    family: 'Playfair Display',
    category: '衬线',
    tags: ['google-fonts', 'elegant', 'serif'],
    preview: 'Feature Story',
  },
  {
    id: 'noto-sans-sc',
    label: 'Noto Sans SC',
    family: 'Noto Sans SC',
    category: '中文正文字体',
    tags: ['中文', 'modern', 'clean'],
    preview: '封面主标题',
  },
  {
    id: 'source-han-sans-sc',
    label: 'Source Han Sans SC',
    family: 'Source Han Sans SC',
    category: '中文正文字体',
    tags: ['中文', 'readable'],
    preview: '这是正文说明',
  },
  {
    id: 'microsoft-yahei',
    label: 'Microsoft YaHei',
    family: 'Microsoft YaHei',
    category: '中文正文字体',
    tags: ['中文', 'system'],
    preview: '内容摘要与亮点',
  },
  {
    id: 'pingfang-sc',
    label: 'PingFang SC',
    family: 'PingFang SC',
    category: '中文正文字体',
    tags: ['中文', 'apple'],
    preview: '快速出图更高效',
  },
  {
    id: 'arial',
    label: 'Arial',
    family: 'Arial',
    category: '无衬线',
    tags: ['sans', 'neutral'],
    preview: 'Fast Editing Workflow',
  },
  {
    id: 'verdana',
    label: 'Verdana',
    family: 'Verdana',
    category: '无衬线',
    tags: ['sans', 'ui'],
    preview: 'Readable Subtitle',
  },
  {
    id: 'times-new-roman',
    label: 'Times New Roman',
    family: 'Times New Roman',
    category: '衬线',
    tags: ['serif', 'classic'],
    preview: 'Classic Content Card',
  },
  {
    id: 'georgia',
    label: 'Georgia',
    family: 'Georgia',
    category: '衬线',
    tags: ['serif', 'editorial'],
    preview: 'Knowledge Channel',
  },
]

type SnapshotPayload = {
  width: number
  height: number
  backgroundColor: string
  scene: ReturnType<Canvas['toJSON']>
}

type BuiltinTemplate = {
  id: string
  name: string
  description: string
  payload: SnapshotPayload
}

type TemplateFileV1 = {
  format: 'cover-maker-template-v1'
  name?: string
  exportedAt?: string
  payload: SnapshotPayload
}

const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: 'hot-horizontal',
    name: '爆款标题横版',
    description: '适合 16:9 视频封面，强调主标题。',
    payload: {
      width: 1280,
      height: 720,
      backgroundColor: '#f6f2ea',
      scene: {
        version: '7.2.0',
        objects: [
          {
            type: 'rect',
            left: 0,
            top: 0,
            width: 365,
            height: 720,
            fill: '#22304a',
          },
          {
            type: 'circle',
            left: 1010,
            top: -130,
            radius: 180,
            fill: '#f4a261',
            opacity: 0.75,
          },
          {
            type: 'rect',
            left: 386,
            top: 468,
            width: 760,
            height: 132,
            fill: '#ffffff',
            rx: 22,
            ry: 22,
            opacity: 0.94,
          },
          {
            type: 'textbox',
            left: 400,
            top: 186,
            width: 778,
            text: '爆款标题在这里',
            fontFamily: 'Lobster',
            fontSize: 104,
            fill: '#131722',
            textAlign: 'left',
          },
          {
            type: 'textbox',
            left: 426,
            top: 505,
            width: 710,
            text: '副标题 / 亮点信息 / 更新时间',
            fontFamily: 'Noto Sans SC',
            fontSize: 44,
            fill: '#334155',
            textAlign: 'left',
          },
          {
            type: 'textbox',
            left: 64,
            top: 570,
            width: 250,
            text: 'NEW',
            fontFamily: 'Cinzel Decorative',
            fontSize: 92,
            fill: '#e2e8f0',
            textAlign: 'center',
          },
        ],
      } as ReturnType<Canvas['toJSON']>,
    },
  },
  {
    id: 'vertical-promo',
    name: '竖版预告封面',
    description: '适合短视频和直播预告。',
    payload: {
      width: 1080,
      height: 1920,
      backgroundColor: '#141414',
      scene: {
        version: '7.2.0',
        objects: [
          {
            type: 'rect',
            left: 72,
            top: 110,
            width: 936,
            height: 1700,
            fill: '#fefefe',
            rx: 46,
            ry: 46,
          },
          {
            type: 'rect',
            left: 72,
            top: 1160,
            width: 936,
            height: 650,
            fill: '#1d3557',
            rx: 0,
            ry: 0,
          },
          {
            type: 'circle',
            left: 734,
            top: 300,
            radius: 190,
            fill: '#f4a261',
            opacity: 0.8,
          },
          {
            type: 'textbox',
            left: 136,
            top: 250,
            width: 780,
            text: '今晚 8 点\\n直播开讲',
            fontFamily: 'Pacifico',
            fontSize: 118,
            fill: '#111827',
            lineHeight: 1.08,
            textAlign: 'left',
          },
          {
            type: 'textbox',
            left: 140,
            top: 1280,
            width: 804,
            text: '主题：从 0 到 1 做出可用产品\\n扫码预约 / 点赞收藏',
            fontFamily: 'Noto Sans SC',
            fontSize: 52,
            fill: '#f8fafc',
            lineHeight: 1.35,
            textAlign: 'left',
          },
        ],
      } as ReturnType<Canvas['toJSON']>,
    },
  },
  {
    id: 'square-knowledge',
    name: '方形知识卡',
    description: '适合图文平台信息卡。',
    payload: {
      width: 1080,
      height: 1080,
      backgroundColor: '#edf2f4',
      scene: {
        version: '7.2.0',
        objects: [
          {
            type: 'rect',
            left: 96,
            top: 96,
            width: 888,
            height: 888,
            fill: '#ffffff',
            rx: 36,
            ry: 36,
          },
          {
            type: 'rect',
            left: 158,
            top: 182,
            width: 178,
            height: 178,
            fill: '#e76f51',
            rx: 24,
            ry: 24,
          },
          {
            type: 'textbox',
            left: 380,
            top: 206,
            width: 480,
            text: '知识点 #01',
            fontFamily: 'Cinzel Decorative',
            fontSize: 74,
            fill: '#0f172a',
            textAlign: 'left',
          },
          {
            type: 'textbox',
            left: 158,
            top: 430,
            width: 764,
            text: '把标题写短，把结论写前，\\n用户在 3 秒内理解价值。\\n\\n这里可替换为你的核心内容。',
            fontFamily: 'Noto Sans SC',
            fontSize: 48,
            fill: '#334155',
            lineHeight: 1.42,
            textAlign: 'left',
          },
        ],
      } as ReturnType<Canvas['toJSON']>,
    },
  },
]

const TEMPLATE_FORMAT = 'cover-maker-template-v1'
const SNAP_TOLERANCE = 8
const SNAPSHOT_DEBOUNCE_MS = 260

const isTextObject = (object: FabricObject | null): object is FabricObject => {
  if (!object) {
    return false
  }
  return object.type === 'textbox' || object.type === 'i-text' || object.type === 'text'
}

type LayerItem = {
  id: string
  label: string
  visible: boolean
  locked: boolean
}

type FabricObjectMeta = FabricObject & {
  coverId?: string
  selectable?: boolean
  evented?: boolean
  lockMovementX?: boolean
  lockMovementY?: boolean
  lockRotation?: boolean
  lockScalingX?: boolean
  lockScalingY?: boolean
}

type SnapCandidateCache = {
  targetId: string
  revision: number
  xLines: number[]
  yLines: number[]
}

const createObjectId = (): string => {
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `obj-${Date.now().toString(36)}-${randomPart}`
}

const getTypeDisplayName = (type: string | undefined): string => {
  if (!type) {
    return '元素'
  }

  if (type === 'textbox' || type === 'i-text' || type === 'text') {
    return '文本'
  }
  if (type === 'rect') {
    return '矩形'
  }
  if (type === 'circle') {
    return '圆形'
  }
  if (type === 'image') {
    return '图片'
  }
  if (type === 'triangle') {
    return '三角形'
  }
  if (type === 'line') {
    return '线条'
  }

  return '元素'
}

const ensureObjectId = (object: FabricObject): string => {
  const withMeta = object as FabricObjectMeta
  if (!withMeta.coverId) {
    withMeta.coverId = createObjectId()
  }
  return withMeta.coverId
}

const getObjectId = (object: FabricObject | null): string => {
  if (!object) {
    return ''
  }
  return ensureObjectId(object)
}

const isObjectLocked = (object: FabricObject): boolean => {
  const withMeta = object as FabricObjectMeta
  return (
    withMeta.selectable === false ||
    withMeta.lockMovementX === true ||
    withMeta.lockMovementY === true
  )
}

const buildLayerItems = (objects: FabricObject[]): LayerItem[] => {
  const typeCounter = new Map<string, number>()

  const ordered = objects.map((object) => {
    const typeKey = object.type || 'unknown'
    const currentIndex = (typeCounter.get(typeKey) || 0) + 1
    typeCounter.set(typeKey, currentIndex)

    return {
      id: ensureObjectId(object),
      label: `${getTypeDisplayName(object.type)} ${currentIndex}`,
      visible: object.visible !== false,
      locked: isObjectLocked(object),
    }
  })

  return ordered.reverse()
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const getCanvasBackgroundColor = (canvas: Canvas): string => {
  return typeof canvas.backgroundColor === 'string'
    ? canvas.backgroundColor
    : '#ffffff'
}

const createSnapshotPayload = (canvas: Canvas): SnapshotPayload => {
  return {
    width: canvas.getWidth(),
    height: canvas.getHeight(),
    backgroundColor: getCanvasBackgroundColor(canvas),
    scene: canvas.toJSON(),
  }
}

const normalizeSnapshotPayload = (value: unknown): SnapshotPayload | null => {
  if (!isRecord(value)) {
    return null
  }

  const width = value.width
  const height = value.height
  const scene = value.scene
  const backgroundColor = value.backgroundColor

  if (typeof width !== 'number' || typeof height !== 'number' || !isRecord(scene)) {
    return null
  }

  return {
    width,
    height,
    backgroundColor: typeof backgroundColor === 'string' ? backgroundColor : '#ffffff',
    scene: scene as ReturnType<Canvas['toJSON']>,
  }
}

const detectPreset = (width: number, height: number): string => {
  const matched = PRESET_SIZES.find(
    (preset) => preset.width === width && preset.height === height,
  )
  return matched ? matched.value : 'custom'
}

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('failed to read file'))
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error('failed to read file'))
    reader.readAsDataURL(file)
  })
}

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('failed to read file'))
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error('failed to read file'))
    reader.readAsText(file)
  })
}

function App() {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  const canvasScrollRef = useRef<HTMLDivElement | null>(null)
  const middlePanActiveRef = useRef(false)
  const middlePanStartRef = useRef({
    clientX: 0,
    clientY: 0,
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const templateFileInputRef = useRef<HTMLInputElement | null>(null)
  const canvasRef = useRef<Canvas | null>(null)
  const viewportScaleRafRef = useRef<number | null>(null)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const isRestoringHistoryRef = useRef(false)
  const snapshotTimerRef = useRef<number | null>(null)
  const snapXGuidesRef = useRef<number[]>([])
  const snapYGuidesRef = useRef<number[]>([])
  const snapEnabledRef = useRef(true)
  const snapCandidateCacheRef = useRef<SnapCandidateCache | null>(null)
  const snapGeometryRevisionRef = useRef(0)
  const movingRafRef = useRef<number | null>(null)
  const pendingMovingTargetRef = useRef<FabricObject | null>(null)

  const [activeObject, setActiveObject] = useState<FabricObject | null>(null)
  const [canvasWidth, setCanvasWidth] = useState(String(DEFAULT_CANVAS_SIZE.width))
  const [canvasHeight, setCanvasHeight] = useState(String(DEFAULT_CANVAS_SIZE.height))
  const [canvasStageSize, setCanvasStageSize] = useState(DEFAULT_CANVAS_SIZE)
  const [canvasViewportScale, setCanvasViewportScale] = useState(1)
  const [canvasUserZoom, setCanvasUserZoom] = useState(1)
  const [isMiddlePanning, setIsMiddlePanning] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(
    `${DEFAULT_CANVAS_SIZE.width}x${DEFAULT_CANVAS_SIZE.height}`,
  )
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [currentFontFamily, setCurrentFontFamily] = useState('Pacifico')
  const [currentFontSize, setCurrentFontSize] = useState(82)
  const [currentTextColor, setCurrentTextColor] = useState('#161616')
  const [objectCount, setObjectCount] = useState(0)
  const [exportScale, setExportScale] = useState(2)
  const [isReady, setIsReady] = useState(false)
  const [historyCursor, setHistoryCursor] = useState(-1)
  const [historyLength, setHistoryLength] = useState(0)
  const [selectedTemplateId, setSelectedTemplateId] = useState(BUILTIN_TEMPLATES[0].id)
  const [templateNotice, setTemplateNotice] = useState('')
  const [layers, setLayers] = useState<LayerItem[]>([])
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [fontKeyword, setFontKeyword] = useState('')
  const [fontCategoryFilter, setFontCategoryFilter] = useState<FontCategory | 'all'>('all')
  const [favoriteFontIds, setFavoriteFontIds] = useState<string[]>([])
  const [recentFontIds, setRecentFontIds] = useState<string[]>([])

  const selectedBuiltinTemplate = useMemo(() => {
    return BUILTIN_TEMPLATES.find((template) => template.id === selectedTemplateId)
  }, [selectedTemplateId])

  const selectedTypeLabel = useMemo(() => {
    if (!activeObject) {
      return '未选中'
    }
    return activeObject.type || '未知元素'
  }, [activeObject])

  const activeLayerId = useMemo(() => {
    return getObjectId(activeObject)
  }, [activeObject])

  const fontCategoryOptions = useMemo(() => {
    const categories = Array.from(new Set(FONT_LIBRARY.map((font) => font.category)))
    return ['all', ...categories] as Array<'all' | FontCategory>
  }, [])

  const fontById = useMemo(() => {
    const map = new Map<string, FontLibraryItem>()
    FONT_LIBRARY.forEach((font) => map.set(font.id, font))
    return map
  }, [])

  const favoriteFonts = useMemo(() => {
    return favoriteFontIds
      .map((id) => fontById.get(id))
      .filter((font): font is FontLibraryItem => Boolean(font))
  }, [favoriteFontIds, fontById])

  const recentFonts = useMemo(() => {
    return recentFontIds
      .map((id) => fontById.get(id))
      .filter((font): font is FontLibraryItem => Boolean(font))
  }, [fontById, recentFontIds])

  const filteredFonts = useMemo(() => {
    const keyword = fontKeyword.trim().toLowerCase()
    return FONT_LIBRARY.filter((font) => {
      if (fontCategoryFilter !== 'all' && font.category !== fontCategoryFilter) {
        return false
      }

      if (!keyword) {
        return true
      }

      const haystack = `${font.label} ${font.family} ${font.category} ${font.tags.join(' ')}`.toLowerCase()
      return haystack.includes(keyword)
    })
  }, [fontCategoryFilter, fontKeyword])

  const syncCanvasStageSize = useCallback((width: number, height: number) => {
    setCanvasStageSize((previousSize) => {
      if (previousSize.width === width && previousSize.height === height) {
        return previousSize
      }

      return { width, height }
    })
  }, [])

  const clampUserZoom = useCallback((zoom: number) => {
    if (!Number.isFinite(zoom)) {
      return 1
    }
    return Math.max(
      CANVAS_USER_ZOOM_MIN,
      Math.min(CANVAS_USER_ZOOM_MAX, Number(zoom.toFixed(3))),
    )
  }, [])

  const queueViewportScaleUpdate = useCallback(() => {
    if (viewportScaleRafRef.current !== null) {
      return
    }

    viewportScaleRafRef.current = window.requestAnimationFrame(() => {
      viewportScaleRafRef.current = null

      const viewport = canvasScrollRef.current
      if (!viewport) {
        return
      }

      const availableWidth = Math.max(260, viewport.clientWidth - CANVAS_VIEWPORT_PADDING)
      const availableHeight = Math.max(220, viewport.clientHeight - CANVAS_VIEWPORT_PADDING)
      const widthScale = availableWidth / canvasStageSize.width
      const heightScale = availableHeight / canvasStageSize.height
      const nextScale = Math.max(
        CANVAS_VIEWPORT_MIN_SCALE,
        Math.min(CANVAS_VIEWPORT_MAX_SCALE, widthScale, heightScale),
      )
      const normalizedScale = Number(nextScale.toFixed(4))

      setCanvasViewportScale((previousScale) => {
        if (Math.abs(previousScale - normalizedScale) < 0.001) {
          return previousScale
        }
        return normalizedScale
      })
    })
  }, [canvasStageSize.height, canvasStageSize.width])

  const effectiveCanvasScale = useMemo(() => {
    return Number((canvasViewportScale * canvasUserZoom).toFixed(4))
  }, [canvasUserZoom, canvasViewportScale])

  const canvasStageStyle = useMemo(() => {
    return {
      width: `${canvasStageSize.width}px`,
      height: `${canvasStageSize.height}px`,
      transform: `scale(${effectiveCanvasScale})`,
    }
  }, [canvasStageSize.height, canvasStageSize.width, effectiveCanvasScale])

  const canvasStageLayoutStyle = useMemo(() => {
    return {
      width: `${Math.max(1, canvasStageSize.width * effectiveCanvasScale)}px`,
      height: `${Math.max(1, canvasStageSize.height * effectiveCanvasScale)}px`,
    }
  }, [canvasStageSize.height, canvasStageSize.width, effectiveCanvasScale])

  const canvasViewportPercent = useMemo(() => {
    return Math.round(effectiveCanvasScale * 100)
  }, [effectiveCanvasScale])

  const fitScalePercent = useMemo(() => {
    return Math.round(canvasViewportScale * 100)
  }, [canvasViewportScale])

  const canvasUserZoomPercent = useMemo(() => {
    return Math.round(canvasUserZoom * 100)
  }, [canvasUserZoom])

  useEffect(() => {
    snapEnabledRef.current = snapEnabled
  }, [snapEnabled])

  useEffect(() => {
    const rawPrefs = localStorage.getItem(FONT_PREFS_KEY)
    if (!rawPrefs) {
      return
    }

    try {
      const parsed = JSON.parse(rawPrefs) as {
        favoriteFontIds?: unknown
        recentFontIds?: unknown
      }

      if (Array.isArray(parsed.favoriteFontIds)) {
        const cleanFavoriteIds = parsed.favoriteFontIds
          .filter((id): id is string => typeof id === 'string')
          .filter((id) => FONT_LIBRARY.some((font) => font.id === id))
        setFavoriteFontIds(cleanFavoriteIds)
      }

      if (Array.isArray(parsed.recentFontIds)) {
        const cleanRecentIds = parsed.recentFontIds
          .filter((id): id is string => typeof id === 'string')
          .filter((id) => FONT_LIBRARY.some((font) => font.id === id))
          .slice(0, MAX_RECENT_FONT_COUNT)
        setRecentFontIds(cleanRecentIds)
      }
    } catch {
      localStorage.removeItem(FONT_PREFS_KEY)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      FONT_PREFS_KEY,
      JSON.stringify({
        favoriteFontIds,
        recentFontIds: recentFontIds.slice(0, MAX_RECENT_FONT_COUNT),
      }),
    )
  }, [favoriteFontIds, recentFontIds])

  useEffect(() => {
    queueViewportScaleUpdate()
  }, [queueViewportScaleUpdate])

  useEffect(() => {
    const viewport = canvasScrollRef.current
    if (!viewport) {
      return
    }

    const handleWindowResize = () => {
      queueViewportScaleUpdate()
    }

    window.addEventListener('resize', handleWindowResize)

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        queueViewportScaleUpdate()
      })
      resizeObserver.observe(viewport)
    }

    return () => {
      window.removeEventListener('resize', handleWindowResize)
      resizeObserver?.disconnect()
    }
  }, [queueViewportScaleUpdate])

  useEffect(() => {
    return () => {
      if (viewportScaleRafRef.current !== null) {
        window.cancelAnimationFrame(viewportScaleRafRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const stopMiddlePan = () => {
      if (!middlePanActiveRef.current) {
        return
      }

      middlePanActiveRef.current = false
      setIsMiddlePanning(false)
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!middlePanActiveRef.current) {
        return
      }

      if ((event.buttons & 4) === 0) {
        stopMiddlePan()
        return
      }

      const viewport = canvasScrollRef.current
      if (!viewport) {
        stopMiddlePan()
        return
      }

      event.preventDefault()
      const deltaX = event.clientX - middlePanStartRef.current.clientX
      const deltaY = event.clientY - middlePanStartRef.current.clientY

      viewport.scrollLeft -= deltaX
      viewport.scrollTop -= deltaY
      middlePanStartRef.current.clientX = event.clientX
      middlePanStartRef.current.clientY = event.clientY
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', stopMiddlePan)
    window.addEventListener('blur', stopMiddlePan)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopMiddlePan)
      window.removeEventListener('blur', stopMiddlePan)
    }
  }, [])

  const clearSnapGuides = useCallback(() => {
    snapXGuidesRef.current = []
    snapYGuidesRef.current = []
  }, [])

  const invalidateSnapCandidates = useCallback(() => {
    snapGeometryRevisionRef.current += 1
    snapCandidateCacheRef.current = null
  }, [])

  const saveDraft = useCallback((canvas: Canvas) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(createSnapshotPayload(canvas)))
  }, [])

  const snapshotToString = useCallback((canvas: Canvas): string => {
    return JSON.stringify(createSnapshotPayload(canvas))
  }, [])

  const applySnapshot = useCallback(
    async (snapshot: string, persistAfterLoad = true) => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const parsed = JSON.parse(snapshot) as SnapshotPayload
      isRestoringHistoryRef.current = true

      try {
        canvas.setDimensions({ width: parsed.width, height: parsed.height })
        syncCanvasStageSize(parsed.width, parsed.height)
        await canvas.loadFromJSON(parsed.scene)
        canvas.backgroundColor = parsed.backgroundColor || '#ffffff'
        canvas.requestRenderAll()
        invalidateSnapCandidates()

        setCanvasWidth(String(parsed.width))
        setCanvasHeight(String(parsed.height))
        setSelectedPreset(detectPreset(parsed.width, parsed.height))
        setBackgroundColor(parsed.backgroundColor || '#ffffff')
        const objects = canvas.getObjects()
        setObjectCount(objects.length)
        setLayers(buildLayerItems(objects))
        setActiveObject(null)

        if (persistAfterLoad) {
          saveDraft(canvas)
        }
      } finally {
        isRestoringHistoryRef.current = false
      }
    },
    [invalidateSnapCandidates, saveDraft, syncCanvasStageSize],
  )

  const pushSnapshot = useCallback(
    (canvas: Canvas, force = false) => {
      if (isRestoringHistoryRef.current) {
        return
      }

      const nextSnapshot = snapshotToString(canvas)
      const history = historyRef.current
      const currentIndex = historyIndexRef.current
      const currentSnapshot = history[currentIndex]

      if (!force && nextSnapshot === currentSnapshot) {
        return
      }

      let nextHistory = history.slice(0, currentIndex + 1)
      nextHistory.push(nextSnapshot)

      if (nextHistory.length > HISTORY_LIMIT) {
        nextHistory = nextHistory.slice(nextHistory.length - HISTORY_LIMIT)
      }

      historyRef.current = nextHistory
      historyIndexRef.current = nextHistory.length - 1
      setHistoryLength(nextHistory.length)
      setHistoryCursor(historyIndexRef.current)
      saveDraft(canvas)
    },
    [saveDraft, snapshotToString],
  )

  const scheduleSnapshot = useCallback(() => {
    if (snapshotTimerRef.current !== null) {
      window.clearTimeout(snapshotTimerRef.current)
    }

    snapshotTimerRef.current = window.setTimeout(() => {
      const canvas = canvasRef.current
      if (canvas) {
        pushSnapshot(canvas)
      }
    }, SNAPSHOT_DEBOUNCE_MS)
  }, [pushSnapshot])

  const syncSelection = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const selected = canvas.getActiveObject() as FabricObject | null
    if (selected) {
      ensureObjectId(selected)
    }
    setActiveObject(selected)

    if (!isTextObject(selected)) {
      return
    }

    const maybeFontFamily = selected.get('fontFamily')
    const maybeFontSize = selected.get('fontSize')
    const maybeFill = selected.get('fill')

    if (typeof maybeFontFamily === 'string') {
      setCurrentFontFamily(maybeFontFamily)
    }
    if (typeof maybeFontSize === 'number') {
      setCurrentFontSize(Math.max(8, Math.round(maybeFontSize)))
    }
    if (typeof maybeFill === 'string') {
      setCurrentTextColor(maybeFill)
    }
  }, [])

  const updateCanvasMeta = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const objects = canvas.getObjects()
    setObjectCount(objects.length)
    setLayers(buildLayerItems(objects))
  }, [])

  const findObjectByLayerId = useCallback((layerId: string): FabricObject | null => {
    const canvas = canvasRef.current
    if (!canvas) {
      return null
    }

    return canvas.getObjects().find((object) => getObjectId(object) === layerId) ?? null
  }, [])

  const handleSelectLayer = useCallback(
    (layerId: string) => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const targetObject = findObjectByLayerId(layerId)
      if (!targetObject || targetObject.visible === false || isObjectLocked(targetObject)) {
        return
      }

      canvas.setActiveObject(targetObject)
      canvas.requestRenderAll()
      syncSelection()
    },
    [findObjectByLayerId, syncSelection],
  )

  const handleToggleLayerVisibility = useCallback(
    (layerId: string) => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const targetObject = findObjectByLayerId(layerId)
      if (!targetObject) {
        return
      }

      targetObject.set('visible', targetObject.visible === false)

      if (canvas.getActiveObject() === targetObject && targetObject.visible === false) {
        canvas.discardActiveObject()
        setActiveObject(null)
      }

      canvas.requestRenderAll()
      invalidateSnapCandidates()
      updateCanvasMeta()
      scheduleSnapshot()
    },
    [findObjectByLayerId, invalidateSnapCandidates, scheduleSnapshot, updateCanvasMeta],
  )

  const handleToggleLayerLock = useCallback(
    (layerId: string) => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const targetObject = findObjectByLayerId(layerId)
      if (!targetObject) {
        return
      }

      const nextLocked = !isObjectLocked(targetObject)

      targetObject.set({
        selectable: !nextLocked,
        evented: !nextLocked,
        lockMovementX: nextLocked,
        lockMovementY: nextLocked,
        lockRotation: nextLocked,
        lockScalingX: nextLocked,
        lockScalingY: nextLocked,
      })

      if (nextLocked && canvas.getActiveObject() === targetObject) {
        canvas.discardActiveObject()
        setActiveObject(null)
      }

      canvas.requestRenderAll()
      invalidateSnapCandidates()
      updateCanvasMeta()
      scheduleSnapshot()
    },
    [findObjectByLayerId, invalidateSnapCandidates, scheduleSnapshot, updateCanvasMeta],
  )

  const handleMoveLayer = useCallback(
    (layerId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const targetObject = findObjectByLayerId(layerId)
      if (!targetObject) {
        return
      }

      if (direction === 'up') {
        canvas.bringObjectForward(targetObject)
      } else if (direction === 'down') {
        canvas.sendObjectBackwards(targetObject)
      } else if (direction === 'top') {
        canvas.bringObjectToFront(targetObject)
      } else {
        canvas.sendObjectToBack(targetObject)
      }

      canvas.requestRenderAll()
      updateCanvasMeta()
      scheduleSnapshot()
    },
    [findObjectByLayerId, scheduleSnapshot, updateCanvasMeta],
  )

  const applyIncomingSnapshot = useCallback(
    async (payload: SnapshotPayload) => {
      await applySnapshot(JSON.stringify(payload), true)
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      invalidateSnapCandidates()
      pushSnapshot(canvas, true)
      updateCanvasMeta()
      setTemplateNotice('模板已应用')
    },
    [applySnapshot, invalidateSnapCandidates, pushSnapshot, updateCanvasMeta],
  )

  const applyCanvasSize = useCallback(
    (width: number, height: number) => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      canvas.setDimensions({ width, height })
      canvas.requestRenderAll()

      invalidateSnapCandidates()
      syncCanvasStageSize(width, height)
      setCanvasWidth(String(width))
      setCanvasHeight(String(height))
      setSelectedPreset(detectPreset(width, height))
      pushSnapshot(canvas)
    },
    [invalidateSnapCandidates, pushSnapshot, syncCanvasStageSize],
  )

  const updateSelectedText = useCallback(
    (patch: { fontFamily?: string; fontSize?: number; fill?: string }) => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const selected = canvas.getActiveObject() as FabricObject | null
      if (!isTextObject(selected)) {
        return
      }

      selected.set(patch)
      canvas.requestRenderAll()
      scheduleSnapshot()
    },
    [scheduleSnapshot],
  )

  const undo = useCallback(async () => {
    if (historyIndexRef.current <= 0) {
      return
    }

    historyIndexRef.current -= 1
    const snapshot = historyRef.current[historyIndexRef.current]
    setHistoryCursor(historyIndexRef.current)
    await applySnapshot(snapshot, true)
  }, [applySnapshot])

  const redo = useCallback(async () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) {
      return
    }

    historyIndexRef.current += 1
    const snapshot = historyRef.current[historyIndexRef.current]
    setHistoryCursor(historyIndexRef.current)
    await applySnapshot(snapshot, true)
  }, [applySnapshot])

  useEffect(() => {
    if (!canvasElementRef.current) {
      return
    }

    const canvas = new Canvas(canvasElementRef.current, {
      width: DEFAULT_CANVAS_SIZE.width,
      height: DEFAULT_CANVAS_SIZE.height,
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: '#ffffff',
      renderOnAddRemove: false,
      enableRetinaScaling: false,
    })

    canvasRef.current = canvas
    syncCanvasStageSize(canvas.getWidth(), canvas.getHeight())

    const trackMutation = () => {
      if (isRestoringHistoryRef.current) {
        return
      }
      invalidateSnapCandidates()
      updateCanvasMeta()
      scheduleSnapshot()
    }

    const handleTextChanged = () => {
      if (isRestoringHistoryRef.current) {
        return
      }
      scheduleSnapshot()
    }

    const handleSelectionCleared = () => {
      setActiveObject(null)
      clearSnapGuides()
    }

    const clearGuidesAndRender = () => {
      if (snapXGuidesRef.current.length === 0 && snapYGuidesRef.current.length === 0) {
        return
      }
      clearSnapGuides()
      pendingMovingTargetRef.current = null
      snapCandidateCacheRef.current = null
      canvas.requestRenderAll()
    }

    const getSnapCandidates = (target: FabricObject): SnapCandidateCache => {
      const targetId = getObjectId(target)
      const revision = snapGeometryRevisionRef.current
      const cached = snapCandidateCacheRef.current

      if (cached && cached.targetId === targetId && cached.revision === revision) {
        return cached
      }

      const nextCandidates: SnapCandidateCache = {
        targetId,
        revision,
        xLines: [canvas.getWidth() / 2],
        yLines: [canvas.getHeight() / 2],
      }

      canvas.getObjects().forEach((object) => {
        if (object === target || object.visible === false) {
          return
        }

        const rect = object.getBoundingRect()
        nextCandidates.xLines.push(rect.left, rect.left + rect.width / 2, rect.left + rect.width)
        nextCandidates.yLines.push(rect.top, rect.top + rect.height / 2, rect.top + rect.height)
      })

      snapCandidateCacheRef.current = nextCandidates
      return nextCandidates
    }

    const computeSnapForTarget = (target: FabricObject) => {
      if (!snapEnabledRef.current) {
        clearSnapGuides()
        return
      }

      const activeRect = target.getBoundingRect()
      const centerPoint = target.getCenterPoint()
      const candidates = getSnapCandidates(target)

      const activeXPoints = [
        activeRect.left,
        activeRect.left + activeRect.width / 2,
        activeRect.left + activeRect.width,
      ]
      const activeYPoints = [
        activeRect.top,
        activeRect.top + activeRect.height / 2,
        activeRect.top + activeRect.height,
      ]

      let bestX:
        | {
            delta: number
            line: number
            distance: number
          }
        | null = null
      let bestY:
        | {
            delta: number
            line: number
            distance: number
          }
        | null = null

      for (const lineX of candidates.xLines) {
        for (const pointX of activeXPoints) {
          const delta = lineX - pointX
          const distance = Math.abs(delta)

          if (distance <= SNAP_TOLERANCE && (!bestX || distance < bestX.distance)) {
            bestX = { delta, line: lineX, distance }
          }
        }
      }

      for (const lineY of candidates.yLines) {
        for (const pointY of activeYPoints) {
          const delta = lineY - pointY
          const distance = Math.abs(delta)

          if (distance <= SNAP_TOLERANCE && (!bestY || distance < bestY.distance)) {
            bestY = { delta, line: lineY, distance }
          }
        }
      }

      clearSnapGuides()

      const nextCenterX = centerPoint.x + (bestX?.delta || 0)
      const nextCenterY = centerPoint.y + (bestY?.delta || 0)

      if (bestX || bestY) {
        target.setPositionByOrigin(new Point(nextCenterX, nextCenterY), 'center', 'center')
        target.setCoords()
      }

      if (bestX) {
        snapXGuidesRef.current.push(bestX.line)
      }
      if (bestY) {
        snapYGuidesRef.current.push(bestY.line)
      }
    }

    const handleObjectMoving = (event: { target?: FabricObject }) => {
      const target = event.target
      if (!target) {
        return
      }

      pendingMovingTargetRef.current = target
      if (movingRafRef.current !== null) {
        return
      }

      movingRafRef.current = window.requestAnimationFrame(() => {
        movingRafRef.current = null
        const pendingTarget = pendingMovingTargetRef.current
        pendingMovingTargetRef.current = null

        if (!pendingTarget) {
          return
        }
        computeSnapForTarget(pendingTarget)
      })
    }

    const handleAfterRender = () => {
      if (!snapEnabledRef.current) {
        return
      }
      if (snapXGuidesRef.current.length === 0 && snapYGuidesRef.current.length === 0) {
        return
      }

      const context = canvas.getSelectionContext()
      context.save()
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.strokeStyle = 'rgba(14, 165, 233, 0.86)'
      context.lineWidth = 1
      context.setLineDash([5, 4])

      for (const lineX of snapXGuidesRef.current) {
        context.beginPath()
        context.moveTo(Math.round(lineX) + 0.5, 0)
        context.lineTo(Math.round(lineX) + 0.5, canvas.getHeight())
        context.stroke()
      }

      for (const lineY of snapYGuidesRef.current) {
        context.beginPath()
        context.moveTo(0, Math.round(lineY) + 0.5)
        context.lineTo(canvas.getWidth(), Math.round(lineY) + 0.5)
        context.stroke()
      }

      context.restore()
    }

    canvas.on('selection:created', syncSelection)
    canvas.on('selection:updated', syncSelection)
    canvas.on('selection:cleared', handleSelectionCleared)
    canvas.on('object:added', trackMutation)
    canvas.on('object:removed', trackMutation)
    canvas.on('object:modified', trackMutation)
    canvas.on('text:changed', handleTextChanged)
    canvas.on('object:moving', handleObjectMoving)
    canvas.on('object:modified', clearGuidesAndRender)
    canvas.on('mouse:up', clearGuidesAndRender)
    canvas.on('after:render', handleAfterRender)

    const boot = async () => {
      const draft = localStorage.getItem(DRAFT_KEY)

      if (draft) {
        try {
          await applySnapshot(draft, false)
          historyRef.current = [draft]
          historyIndexRef.current = 0
          setHistoryLength(1)
          setHistoryCursor(0)
          setIsReady(true)
          return
        } catch {
          localStorage.removeItem(DRAFT_KEY)
        }
      }

      const welcomeText = new Textbox('输入封面标题', {
        left: 160,
        top: 200,
        width: 980,
        fontFamily: 'Pacifico',
        fontSize: 96,
        fill: '#121212',
        textAlign: 'center',
      })

      canvas.add(welcomeText)
      canvas.setActiveObject(welcomeText)
      canvas.requestRenderAll()
      syncSelection()
      updateCanvasMeta()
      pushSnapshot(canvas, true)
      setIsReady(true)
    }

    void boot()

    const handleKeyDown = (event: KeyboardEvent) => {
      const canvasInstance = canvasRef.current
      if (!canvasInstance) {
        return
      }

      const isInputTarget =
        event.target instanceof HTMLElement &&
        (event.target.tagName === 'INPUT' ||
          event.target.tagName === 'TEXTAREA' ||
          event.target.tagName === 'SELECT')

      if ((event.key === 'Delete' || event.key === 'Backspace') && !isInputTarget) {
        const selected = canvasInstance.getActiveObject()
        if (!selected) {
          return
        }
        event.preventDefault()
        canvasInstance.remove(selected)
        canvasInstance.discardActiveObject()
        canvasInstance.requestRenderAll()
        setActiveObject(null)
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) {
          void redo()
        } else {
          void undo()
        }
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        void redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      canvas.off('selection:created', syncSelection)
      canvas.off('selection:updated', syncSelection)
      canvas.off('selection:cleared', handleSelectionCleared)
      canvas.off('object:added', trackMutation)
      canvas.off('object:removed', trackMutation)
      canvas.off('object:modified', trackMutation)
      canvas.off('text:changed', handleTextChanged)
      canvas.off('object:moving', handleObjectMoving)
      canvas.off('object:modified', clearGuidesAndRender)
      canvas.off('mouse:up', clearGuidesAndRender)
      canvas.off('after:render', handleAfterRender)
      canvas.dispose()
      canvasRef.current = null

      if (snapshotTimerRef.current !== null) {
        window.clearTimeout(snapshotTimerRef.current)
      }
      if (movingRafRef.current !== null) {
        window.cancelAnimationFrame(movingRafRef.current)
      }
    }
  }, [
    applySnapshot,
    clearSnapGuides,
    invalidateSnapCandidates,
    pushSnapshot,
    redo,
    scheduleSnapshot,
    syncCanvasStageSize,
    syncSelection,
    undo,
    updateCanvasMeta,
  ])

  const handleAddText = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const text = new Textbox('双击编辑文本', {
      left: canvas.getWidth() * 0.25,
      top: canvas.getHeight() * 0.3,
      width: Math.max(260, canvas.getWidth() * 0.5),
      fontFamily: currentFontFamily,
      fontSize: currentFontSize,
      fill: currentTextColor,
      textAlign: 'center',
    })

    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.requestRenderAll()
    syncSelection()
    scheduleSnapshot()
  }, [currentFontFamily, currentFontSize, currentTextColor, scheduleSnapshot, syncSelection])

  const handleAddRectangle = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const shape = new Rect({
      left: canvas.getWidth() * 0.28,
      top: canvas.getHeight() * 0.4,
      width: 340,
      height: 130,
      fill: '#f4a261',
      rx: 20,
      ry: 20,
      opacity: 0.88,
    })

    canvas.add(shape)
    canvas.setActiveObject(shape)
    canvas.requestRenderAll()
    syncSelection()
    scheduleSnapshot()
  }, [scheduleSnapshot, syncSelection])

  const handleAddCircle = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const shape = new Circle({
      left: canvas.getWidth() * 0.36,
      top: canvas.getHeight() * 0.38,
      radius: 90,
      fill: '#2a9d8f',
      opacity: 0.85,
    })

    canvas.add(shape)
    canvas.setActiveObject(shape)
    canvas.requestRenderAll()
    syncSelection()
    scheduleSnapshot()
  }, [scheduleSnapshot, syncSelection])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const canvas = canvasRef.current
      const file = event.target.files?.[0]

      if (!canvas || !file) {
        return
      }

      try {
        const dataURL = await readFileAsDataURL(file)
        const image = await FabricImage.fromURL(dataURL)

        const imageWidth = image.width || 1
        const imageHeight = image.height || 1
        const maxWidth = canvas.getWidth() * 0.72
        const maxHeight = canvas.getHeight() * 0.72
        const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight, 1)

        image.set({
          left: canvas.getWidth() * 0.5,
          top: canvas.getHeight() * 0.5,
          originX: 'center',
          originY: 'center',
        })
        image.scale(scale)

        canvas.add(image)
        canvas.setActiveObject(image)
        canvas.requestRenderAll()
        syncSelection()
        scheduleSnapshot()
      } finally {
        event.target.value = ''
      }
    },
    [scheduleSnapshot, syncSelection],
  )

  const handleBackgroundColorChange = useCallback(
    (color: string) => {
      setBackgroundColor(color)
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      canvas.backgroundColor = color
      canvas.requestRenderAll()
      scheduleSnapshot()
    },
    [scheduleSnapshot],
  )

  const applyCanvasUserZoom = useCallback(
    (zoom: number) => {
      setCanvasUserZoom(clampUserZoom(zoom))
    },
    [clampUserZoom],
  )

  const zoomInCanvas = useCallback(() => {
    applyCanvasUserZoom(canvasUserZoom + CANVAS_USER_ZOOM_STEP)
  }, [applyCanvasUserZoom, canvasUserZoom])

  const zoomOutCanvas = useCallback(() => {
    applyCanvasUserZoom(canvasUserZoom - CANVAS_USER_ZOOM_STEP)
  }, [applyCanvasUserZoom, canvasUserZoom])

  const resetCanvasUserZoom = useCallback(() => {
    setCanvasUserZoom(1)
  }, [])

  const handleCanvasWheelZoom = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return
      }

      event.preventDefault()
      const direction = event.deltaY < 0 ? 1 : -1
      applyCanvasUserZoom(canvasUserZoom + direction * CANVAS_USER_ZOOM_STEP)
    },
    [applyCanvasUserZoom, canvasUserZoom],
  )

  const handleCanvasMiddleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button !== 1) {
        return
      }

      const viewport = canvasScrollRef.current
      if (!viewport) {
        return
      }

      event.preventDefault()
      middlePanActiveRef.current = true
      middlePanStartRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
      }
      setIsMiddlePanning(true)
    },
    [],
  )

  const handleCanvasAuxClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 1) {
      event.preventDefault()
    }
  }, [])

  const rememberRecentFont = useCallback((fontId: string) => {
    setRecentFontIds((previousIds) => {
      const deduped = [fontId, ...previousIds.filter((id) => id !== fontId)]
      return deduped.slice(0, MAX_RECENT_FONT_COUNT)
    })
  }, [])

  const toggleFavoriteFont = useCallback((fontId: string) => {
    setFavoriteFontIds((previousIds) => {
      if (previousIds.includes(fontId)) {
        return previousIds.filter((id) => id !== fontId)
      }
      return [fontId, ...previousIds]
    })
  }, [])

  const handleFontFamilyChange = useCallback(
    (fontFamily: string) => {
      setCurrentFontFamily(fontFamily)
      updateSelectedText({ fontFamily })

      const matchedFont = FONT_LIBRARY.find((font) => font.family === fontFamily)
      if (matchedFont) {
        rememberRecentFont(matchedFont.id)
      }
    },
    [rememberRecentFont, updateSelectedText],
  )

  const handleFontSizeChange = useCallback(
    (fontSize: number) => {
      setCurrentFontSize(fontSize)
      updateSelectedText({ fontSize })
    },
    [updateSelectedText],
  )

  const handleTextColorChange = useCallback(
    (fill: string) => {
      setCurrentTextColor(fill)
      updateSelectedText({ fill })
    },
    [updateSelectedText],
  )

  const bringForward = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const selected = canvas.getActiveObject()
    if (!selected) {
      return
    }

    canvas.bringObjectForward(selected)
    canvas.requestRenderAll()
    scheduleSnapshot()
  }, [scheduleSnapshot])

  const sendBackward = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const selected = canvas.getActiveObject()
    if (!selected) {
      return
    }

    canvas.sendObjectBackwards(selected)
    canvas.requestRenderAll()
    scheduleSnapshot()
  }, [scheduleSnapshot])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const shouldClear = window.confirm('确认清空画布吗？此操作会删除所有元素。')
    if (!shouldClear) {
      return
    }

    canvas.clear()
    canvas.backgroundColor = backgroundColor
    canvas.requestRenderAll()
    setActiveObject(null)
    setObjectCount(0)
    pushSnapshot(canvas, true)
  }, [backgroundColor, pushSnapshot])

  const applyPresetSize = useCallback(
    (value: string) => {
      setSelectedPreset(value)
      const matched = PRESET_SIZES.find((preset) => preset.value === value)
      if (!matched) {
        return
      }

      applyCanvasSize(matched.width, matched.height)
    },
    [applyCanvasSize],
  )

  const applyCustomSize = useCallback(() => {
    const parsedWidth = Number(canvasWidth)
    const parsedHeight = Number(canvasHeight)

    const nextWidth = Number.isFinite(parsedWidth)
      ? Math.min(CANVAS_MAX_SIZE, Math.max(CANVAS_MIN_SIZE, Math.round(parsedWidth)))
      : DEFAULT_CANVAS_SIZE.width
    const nextHeight = Number.isFinite(parsedHeight)
      ? Math.min(CANVAS_MAX_SIZE, Math.max(CANVAS_MIN_SIZE, Math.round(parsedHeight)))
      : DEFAULT_CANVAS_SIZE.height

    applyCanvasSize(nextWidth, nextHeight)
  }, [applyCanvasSize, canvasHeight, canvasWidth])

  const handleApplyBuiltinTemplate = useCallback(async () => {
    const selected = BUILTIN_TEMPLATES.find((template) => template.id === selectedTemplateId)
    if (!selected) {
      return
    }

    await applyIncomingSnapshot(selected.payload)
    setTemplateNotice(`已应用内置模板：${selected.name}`)
  }, [applyIncomingSnapshot, selectedTemplateId])

  const exportAsTemplateJSON = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const templateFile: TemplateFileV1 = {
      format: TEMPLATE_FORMAT,
      name: '我的模板',
      exportedAt: new Date().toISOString(),
      payload: createSnapshotPayload(canvas),
    }

    const blob = new Blob([JSON.stringify(templateFile, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `template-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleTemplateImportClick = useCallback(() => {
    templateFileInputRef.current?.click()
  }, [])

  const handleTemplateImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) {
        return
      }

      try {
        const content = await readFileAsText(file)
        const parsed: unknown = JSON.parse(content)

        let payload: SnapshotPayload | null = null
        let templateName = ''

        if (isRecord(parsed) && parsed.format === TEMPLATE_FORMAT && 'payload' in parsed) {
          payload = normalizeSnapshotPayload(parsed.payload)
          const maybeName = parsed.name
          if (typeof maybeName === 'string') {
            templateName = maybeName
          }
        } else {
          payload = normalizeSnapshotPayload(parsed)
        }

        if (!payload) {
          throw new Error('invalid template format')
        }

        await applyIncomingSnapshot(payload)
        setTemplateNotice(templateName ? `已导入模板：${templateName}` : '已导入模板文件')
      } catch {
        window.alert('模板导入失败：请确认是有效的 Cover Maker 模板 JSON 文件。')
      } finally {
        event.target.value = ''
      }
    },
    [applyIncomingSnapshot],
  )

  const exportAsPNG = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const dataURL = canvas.toDataURL({
      format: 'png',
      multiplier: exportScale,
      enableRetinaScaling: true,
    })

    const link = document.createElement('a')
    link.href = dataURL
    link.download = `cover-${Date.now()}.png`
    link.click()
  }, [exportScale])

  return (
    <main className="editor-page">
      <header className="topbar">
        <div className="brand">
          <h1>Cover Maker</h1>
          <p>本地视频封面编辑器 · M1 版本</p>
        </div>

        <div className="topbar-actions">
          <button onClick={() => void undo()} disabled={historyCursor <= 0}>
            撤销
          </button>
          <button
            onClick={() => void redo()}
            disabled={historyCursor >= historyLength - 1 || historyLength === 0}
          >
            重做
          </button>
          <button className="primary" onClick={exportAsPNG} disabled={!isReady}>
            导出 PNG
          </button>
        </div>
      </header>

      <section className="workspace">
        <aside className="panel">
          <h2>元素</h2>
          <button onClick={handleAddText}>添加文本</button>
          <button onClick={handleAddRectangle}>添加矩形</button>
          <button onClick={handleAddCircle}>添加圆形</button>
          <button onClick={handleUploadClick}>上传图片</button>
          <button onClick={clearCanvas} className="danger">
            清空画布
          </button>

          <h2>模板</h2>
          <label>
            内置模板
            <select
              value={selectedTemplateId}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
            >
              {BUILTIN_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => void handleApplyBuiltinTemplate()}>应用内置模板</button>
          <button onClick={exportAsTemplateJSON}>导出模板 JSON</button>
          <button onClick={handleTemplateImportClick}>导入模板 JSON</button>
          {selectedBuiltinTemplate && (
            <p className="template-description">{selectedBuiltinTemplate.description}</p>
          )}
          {templateNotice && <p className="template-notice">{templateNotice}</p>}

          <div className="hint">
            <p>快捷键</p>
            <p>`Delete` 删除元素</p>
            <p>`Ctrl/Cmd + Z` 撤销</p>
            <p>`Ctrl/Cmd + Y` 重做</p>
            <p>按住鼠标中键拖动画布视图</p>
          </div>
        </aside>

        <section className="canvas-area">
          <div className="canvas-toolbar">
            <label>
              预设尺寸
              <select
                value={selectedPreset}
                onChange={(event) => applyPresetSize(event.target.value)}
              >
                {PRESET_SIZES.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
                <option value="custom">自定义</option>
              </select>
            </label>

            <label>
              宽
              <input
                type="number"
                min={CANVAS_MIN_SIZE}
                max={CANVAS_MAX_SIZE}
                value={canvasWidth}
                onChange={(event) => setCanvasWidth(event.target.value)}
              />
            </label>

            <label>
              高
              <input
                type="number"
                min={CANVAS_MIN_SIZE}
                max={CANVAS_MAX_SIZE}
                value={canvasHeight}
                onChange={(event) => setCanvasHeight(event.target.value)}
              />
            </label>

            <button onClick={applyCustomSize}>应用尺寸</button>

            <label>
              背景
              <input
                type="color"
                value={backgroundColor}
                onChange={(event) => handleBackgroundColorChange(event.target.value)}
              />
            </label>

            <label className="snap-toggle">
              <input
                type="checkbox"
                checked={snapEnabled}
                onChange={(event) => setSnapEnabled(event.target.checked)}
              />
              吸附对齐
            </label>

            <label className="zoom-control">
              画布缩放
              <div className="zoom-row">
                <button
                  type="button"
                  onClick={zoomOutCanvas}
                  disabled={canvasUserZoom <= CANVAS_USER_ZOOM_MIN}
                >
                  -
                </button>
                <input
                  type="range"
                  min={CANVAS_USER_ZOOM_MIN}
                  max={CANVAS_USER_ZOOM_MAX}
                  step={0.05}
                  value={canvasUserZoom}
                  onChange={(event) => applyCanvasUserZoom(Number(event.target.value))}
                />
                <button
                  type="button"
                  onClick={zoomInCanvas}
                  disabled={canvasUserZoom >= CANVAS_USER_ZOOM_MAX}
                >
                  +
                </button>
                <button type="button" onClick={resetCanvasUserZoom}>
                  适配
                </button>
                <span>{canvasUserZoomPercent}%</span>
              </div>
            </label>
          </div>

          <div className="canvas-shell">
            <div
              className={`canvas-scroll ${isMiddlePanning ? 'is-middle-panning' : ''}`}
              ref={canvasScrollRef}
              onWheel={handleCanvasWheelZoom}
              onMouseDownCapture={handleCanvasMiddleMouseDown}
              onAuxClick={handleCanvasAuxClick}
              title="按住中键拖动可平移画布；按住 Ctrl/Cmd + 滚轮可缩放画布视图"
            >
              <div className="canvas-stage-wrap" style={canvasStageLayoutStyle}>
                <div className="canvas-stage" style={canvasStageStyle}>
                  <canvas ref={canvasElementRef} />
                </div>
              </div>
            </div>
          </div>

          <p className="status">
            当前画布 {canvasStageSize.width} x {canvasStageSize.height} · 视图缩放{' '}
            {canvasViewportPercent}%（适配 {fitScalePercent}% × 手动 {canvasUserZoomPercent}%）·
            当前元素 {objectCount} 个 · 当前选中: {selectedTypeLabel}
          </p>
        </section>

        <aside className="panel">
          <h2>文字与图层</h2>

          <section className="font-manager">
            <label>
              字体搜索
              <input
                type="text"
                placeholder="按名称 / 标签搜索"
                value={fontKeyword}
                onChange={(event) => setFontKeyword(event.target.value)}
              />
            </label>

            <label>
              字体分类
              <select
                value={fontCategoryFilter}
                onChange={(event) =>
                  setFontCategoryFilter(event.target.value as FontCategory | 'all')
                }
              >
                {fontCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? '全部分类' : category}
                  </option>
                ))}
              </select>
            </label>

            <p className="font-current">
              当前字体：
              <span style={{ fontFamily: currentFontFamily }}>{currentFontFamily}</span>
            </p>

            {favoriteFonts.length > 0 && (
              <>
                <p className="font-section-title">收藏字体</p>
                <div className="font-chip-row">
                  {favoriteFonts.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      className="font-chip"
                      onClick={() => handleFontFamilyChange(font.family)}
                    >
                      ★ {font.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {recentFonts.length > 0 && (
              <>
                <p className="font-section-title">最近使用</p>
                <div className="font-chip-row">
                  {recentFonts.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      className="font-chip"
                      onClick={() => handleFontFamilyChange(font.family)}
                    >
                      最近 · {font.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="font-list">
              {filteredFonts.length === 0 && <p className="font-empty">没有匹配的字体</p>}
              {filteredFonts.map((font) => {
                const isFavorite = favoriteFontIds.includes(font.id)
                const isActive = currentFontFamily === font.family
                return (
                  <article
                    key={font.id}
                    className={`font-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="font-item-head">
                      <button
                        type="button"
                        className="font-apply"
                        onClick={() => handleFontFamilyChange(font.family)}
                      >
                        {font.label}
                      </button>
                      <button
                        type="button"
                        className="font-favorite"
                        onClick={() => toggleFavoriteFont(font.id)}
                        aria-label={isFavorite ? `取消收藏 ${font.label}` : `收藏 ${font.label}`}
                        title={isFavorite ? '取消收藏' : '收藏字体'}
                      >
                        {isFavorite ? '★' : '☆'}
                      </button>
                    </div>
                    <p
                      className="font-preview"
                      style={{ fontFamily: font.family }}
                      onClick={() => handleFontFamilyChange(font.family)}
                    >
                      {font.preview}
                    </p>
                    <span className="font-meta">
                      {font.category} · {font.tags.join(' / ')}
                    </span>
                  </article>
                )
              })}
            </div>
          </section>

          <label>
            字号
            <input
              type="range"
              min={16}
              max={180}
              value={currentFontSize}
              onChange={(event) => handleFontSizeChange(Number(event.target.value))}
            />
            <span>{currentFontSize}px</span>
          </label>

          <label>
            字色
            <input
              type="color"
              value={currentTextColor}
              onChange={(event) => handleTextColorChange(event.target.value)}
            />
          </label>

          <div className="stack-buttons">
            <button onClick={bringForward}>上移一层</button>
            <button onClick={sendBackward}>下移一层</button>
          </div>

          <label>
            导出倍率
            <select
              value={String(exportScale)}
              onChange={(event) => setExportScale(Number(event.target.value))}
            >
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="3">3x</option>
            </select>
          </label>

          <div className="hint">
            <p>提示</p>
            <p>双击文本可进入编辑模式。</p>
            <p>花体字已内置，无需联网加载。</p>
          </div>

          <h2>图层</h2>
          {layers.length === 0 && <p className="layer-empty">暂无图层</p>}
          {layers.length > 0 && (
            <div className="layers-list">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`layer-row ${activeLayerId === layer.id ? 'active' : ''}`}
                  onClick={() => handleSelectLayer(layer.id)}
                >
                  <div className="layer-meta">
                    <strong>{layer.label}</strong>
                    <span>
                      {layer.visible ? '可见' : '隐藏'} · {layer.locked ? '锁定' : '可编辑'}
                    </span>
                  </div>
                  <div className="layer-actions">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleMoveLayer(layer.id, 'up')
                      }}
                    >
                      上
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleMoveLayer(layer.id, 'down')
                      }}
                    >
                      下
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleToggleLayerVisibility(layer.id)
                      }}
                    >
                      {layer.visible ? '隐' : '显'}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleToggleLayerLock(layer.id)
                      }}
                    >
                      {layer.locked ? '解' : '锁'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        hidden
      />
      <input
        ref={templateFileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleTemplateImport}
        hidden
      />
    </main>
  )
}

export default App
