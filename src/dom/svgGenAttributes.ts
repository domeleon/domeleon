export interface KnownSvgAttributes {
  accentHeight?: string | number
  accumulate?: string | "none" | "sum"
  additive?: string | "sum" | "replace"
  alignmentBaseline?: "alphabetic" | "hanging" | "ideographic" | "mathematical" | "auto" | "baseline" | "before-edge" | "text-before-edge" | "middle" | "central" | "after-edge" | "text-after-edge" | "inherit" | string
  allowReorder?: string | "no" | "yes"
  alphabetic?: string | number
  amplitude?: string | number
  arabicForm?: string | "initial" | "medial" | "terminal" | "isolated"
  ascent?: string | number
  attributeName?: string
  azimuth?: string | number
  baseFrequency?: string | number
  baselineShift?: string
  baseProfile?: string | number
  bbox?: string | number
  begin?: string
  bias?: string | number
  by?: string | number
  calcMode?: string | "discrete" | "linear" | "paced" | "spline"
  capHeight?: string | number
  className?: string
  clip?: string
  clipPath?: string
  clipPathUnits?: string | number
  clipRule?: string | number
  colorInterpolation?: "auto" | "inherit" | string | "sRGB" | "linearRGB"
  colorInterpolationFilters?: "auto" | "inherit" | string | "sRGB" | "linearRGB"
  colorRendering?: string | number
  cursor?: string
  cx?: string | number
  cy?: string | number
  d?: string
  decelerate?: string
  descent?: string | number
  diffuseConstant?: string | number
  direction?: string | "ltr" | "rtl"
  display?: string
  divisor?: string | number
  dominantBaseline?: string
  dur?: string
  dx?: string | number
  dy?: string | number
  edgeMode?: string | number
  elevation?: string | number
  end?: string
  exponent?: string | number
  fill?: string
  fillOpacity?: string | number
  fillRule?: "inherit" | string | "nonzero" | "evenodd"
  filter?: string
  filterRes?: string | number
  filterUnits?: string | number
  floodColor?: string
  floodOpacity?: string | number
  fontFamily?: string
  fontSize?: string | number
  fontSizeAdjust?: number | string | "none"
  fontStretch?: number | string | "normal" | "semi-condensed" | "condensed" | "extra-condensed" | "ultra-condensed" | "semi-expanded" | "expanded" | "extra-expanded" | "ultra-expanded"
  fontStyle?: string | "normal" | "italic" | "oblique"
  fontVariant?: string | "none" | "normal"
  fontWeight?: number | string | "normal" | "bold" | "bolder" | "lighter"
  format?: string
  fr?: string | number
  from?: string | number
  fx?: string | number
  fy?: string | number
  g1?: string
  g2?: string
  glyphName?: string
  glyphOrientationHorizontal?: string | number
  glyphOrientationVertical?: string | number
  glyphRef?: string | number
  gradientTransform?: string
  gradientUnits?: string | "userSpaceOnUse" | "objectBoundingBox"
  hanging?: string | number
  horizAdvX?: string | number
  horizOriginX?: string | number
  horizOriginY?: string | number
  ideographic?: string | number
  imageRendering?: string
  in?: string | "SourceGraphic" | "SourceAlpha" | "BackgroundImage" | "BackgroundAlpha" | "FillPaint" | "StrokePaint"
  in2?: string | "SourceGraphic" | "SourceAlpha" | "BackgroundImage" | "BackgroundAlpha" | "FillPaint" | "StrokePaint"
  intercept?: string | number
  k?: string | number
  k1?: string | number
  k2?: string | number
  k3?: string | number
  k4?: string | number
  kernelMatrix?: string | number
  kernelUnitLength?: string | number
  keyPoints?: string | number
  keySplines?: string
  keyTimes?: string
  lengthAdjust?: string | number
  letterSpacing?: string | number
  lightingColor?: string
  limitingConeAngle?: string | number
  local?: string
  markerEnd?: string | "none"
  markerHeight?: string | number
  markerMid?: string | "none"
  markerStart?: string | "none"
  markerUnits?: string | number
  markerWidth?: string | number
  mask?: string
  maskContentUnits?: string | "userSpaceOnUse"
  maskUnits?: string | number
  mathematical?: string | number
  method?: string | "align" | "stretch"
  mode?: string
  numOctaves?: string | number
  offset?: string | number
  opacity?: string | number
  operator?: "in" | string | "lighter" | "over" | "out" | "atop" | "xor" | "arithmetic"
  order?: string | number
  orient?: number | "auto" | string | "auto-start-reverse"
  orientation?: string | "h" | "v"
  origin?: string
  overflow?: "auto" | string | "visible" | "hidden" | "scroll"
  overlinePosition?: string | number
  overlineThickness?: string | number
  paintOrder?: "fill" | "stroke" | string | "normal" | "markers"
  path?: string
  pathLength?: string | number
  patternContentUnits?: string | "userSpaceOnUse" | "objectBoundingBox"
  patternTransform?: string
  patternUnits?: string | "userSpaceOnUse" | "objectBoundingBox"
  pointerEvents?: "fill" | "stroke" | string | "none" | "bounding-box" | "visiblePainted" | "visibleFill" | "visibleStroke" | "visible" | "painted" | "all"
  points?: string | number
  pointsAtX?: string | number
  pointsAtY?: string | number
  pointsAtZ?: string | number
  preserveAlpha?: boolean
  preserveAspectRatio?: string | "none" | "xMinYMin" | "xMidYMin" | "xMaxYMin" | "xMinYMid" | "xMidYMid" | "xMaxYMid" | "xMinYMax" | "xMidYMax" | "xMaxYMax" | "meet" | "slice"
  primitiveUnits?: string | "userSpaceOnUse" | "objectBoundingBox"
  r?: string | number
  radius?: string | number
  refX?: number | string | "left" | "center" | "right"
  refY?: number | string | "left" | "center" | "right"
  repeatCount?: string | number
  repeatDur?: string | number
  requiredExtensions?: string
  restart?: string | "always" | "whenNotActive" | "never"
  result?: string
  rotate?: number | "auto" | string | "auto-reverse"
  rx?: string | number
  ry?: string | number
  scale?: string | number
  seed?: string | number
  shapeRendering?: "auto" | string | "optimizeSpeed" | "crispEdges" | "geometricPrecision"
  side?: string | "left" | "right"
  slope?: string | number
  spacing?: "auto" | string | "exact"
  specularConstant?: string | number
  specularExponent?: string | number
  speed?: string | number
  spreadMethod?: string | "pad" | "reflect" | "repeat"
  startOffset?: string | number
  stdDeviation?: string | number
  stemh?: string | number
  stemv?: string | number
  stitchTiles?: string | "noStitch" | "stitch"
  stopColor?: string
  stopOpacity?: string | number
  stroke?: string
  strokeDashArray?: string | number
  strokeDashOffset?: string | number
  strokeLineCap?: "inherit" | string | "butt" | "round" | "square"
  strokeLineJoin?: "inherit" | string |"bevel" | "miter" | "miter-clip" | "round"
  strokeMiterLimit?: string | number
  strokeOpacity?: string | number
  strokeWidth?: string | number
  surfaceScale?: string | number
  systemLanguage?: string
  tableValues?: string | number
  targetX?: string | number
  targetY?: string | number
  textAnchor?: "middle" | string | "start" | "end"
  textDecoration?: string
  textLength?: string | number
  textRendering?: "auto" | string | "optimizeSpeed" | "geometricPrecision" | "optimizeLegibility"
  to?: string | number
  transform?: string
  transformOrigin?: string
  u1?: string
  u2?: string
  underlinePosition?: string | number
  underlineThickness?: string | number
  unicode?: string
  unicodeBidi?: string | "normal" | "embed" | "bidi-override" | "isolate" | "isolate-override" | "plaintext"
  unicodeRange?: string | number
  unitsPerEm?: string | number
  vAlphabetic?: string | number
  values?: string | number
  vectorEffect?: string | "none" | "non-scaling-stroke" | "non-scaling-size" | "non-rotation" | "fixed-position"
  vertAdvY?: string | number
  vertOriginX?: string | number
  vertOriginY?: string | number
  vHanging?: string | number
  vIdeographic?: string | number
  viewBox?: string
  viewTarget?: string | number
  visibility?: string | "visible" | "hidden" | "collapse"
  vMathematical?: string | number
  widths?: string | number
  wordSpacing?: number | string | "normal"
  writingMode?: string | "horizontal-tb" | "vertical-rl" | "vertical-lr"
  x?: string | number
  x1?: string | number
  x2?: string | number
  xChannelSelector?: string | "R" | "G" | "B" | "A"
  xHeight?: string | number
  xlinkActuate?: string
  xlinkArcrole?: string
  xlinkHref?: string
  xlinkRole?: string
  xlinkShow?: string
  xlinkTitle?: string
  xlinkType?: string
  xmlBase?: string
  xmlLang?: string
  xmlns?: string
  xmlnsXlink?: string
  xmlSpace?: string
  y?: string | number
  y1?: string | number
  y2?: string | number
  yChannelSelector?: string | "R" | "G" | "B" | "A"
  z?: string | number
  zoomAndPan?: string | "disable" | "magnify"
}