import { kebab } from "../util.js"

const svgElementNames = new Set([
  "animate", "animateMotion", "animateTransform", "circle", "clipPath", "defs", "ellipse",
  "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix",
  "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood",
  "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge",
  "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting",
  "feSpotLight", "feTile", "feTurbulence", "filter", "foreignObject", "g", "image",
  "line", "linearGradient", "marker", "mask", "metadata", "mpath", "path", "pattern",
  "polygon", "polyline", "radialGradient", "rect", "set", "stop", "svg", "symbol", "text",
  "textPath", "tspan", "use", "view",
])

const svgCamelCaseAttrs = new Set([
  "attributeName", "baseFrequency", "calcMode", "clipPathUnits", "diffuseConstant", "edgeMode",
  "filterUnits", "gradientTransform", "gradientUnits", "kernelMatrix", "kernelUnitLength",
  "keyPoints", "keySplines", "keyTimes", "lengthAdjust", "limitingConeAngle", "markerHeight",
  "markerUnits", "markerWidth", "maskContentUnits", "maskUnits",
  "numOctaves", "pathLength", "patternContentUnits", "patternTransform", "patternUnits",
  "pointsAtX", "pointsAtY", "pointsAtZ", "preserveAlpha", "preserveAspectRatio",
  "primitiveUnits", "refX", "refY", "repeatCount", "repeatDur",
  "specularConstant", "specularExponent", "spreadMethod", "startOffset",
  "stdDeviation", "stitchTiles", "surfaceScale", "systemLanguage", "tableValues", "targetX",
  "targetY", "textLength", "viewBox", "xChannelSelector", "yChannelSelector"
])

// SVG attributes where kebab-case produces incorrect results (compound words in spec)
// e.g. strokeDashArray should become "stroke-dasharray" (not "stroke-dash-array")
// React uses strokeDasharray, Preact/Vue use stroke-dasharray
export const svgCompoundWordAttrs = new Map<string, { kebab: string, react: string }>([
  ["strokeDashArray", { kebab: "stroke-dasharray", react: "strokeDasharray" }],
  ["strokeDashOffset", { kebab: "stroke-dashoffset", react: "strokeDashoffset" }],
  ["strokeLineCap", { kebab: "stroke-linecap", react: "strokeLinecap" }],
  ["strokeLineJoin", { kebab: "stroke-linejoin", react: "strokeLinejoin" }],
  ["strokeMiterLimit", { kebab: "stroke-miterlimit", react: "strokeMiterlimit" }],
])

const domeleonHtmlCamelCaseAttrs = new Set([
  "acceptCharset", "autoComplete", "autoPlay", "bgColor", "colSpan", "crossOrigin", "dateTime",
  "dirName", "encType", "formAction", "formEncType", "formMethod", "formNoValidate", "formTarget",
  "hrefLang", "httpEquiv", "isMap", "maxLength", "minLength", "noValidate", "playsInline",
  "readOnly", "referrerPolicy", "rowSpan", "srcDoc", "srcLang", "srcSet", "useMap",
  "autoCapitalize", "autoFocus", "contentEditable", "enterKeyHint", "exportParts", "inputMode",
  "itemId", "itemProp", "itemRef", "itemScope", "itemType", "popOver", "spellCheck", "tabIndex",
  "virtualKeyboardPolicy", "writingSuggestions"
])

export const isSvgEl = (name: string) => svgElementNames.has(name)
export const isSvgCamelAttr = (attrName: string) => svgCamelCaseAttrs.has(attrName)
export const isDomeleonHtmlCamelAttr = (attrName: string) => domeleonHtmlCamelCaseAttrs.has(attrName)

export const isAttrEvent = (s: string) => /^on[A-Z]/.test(s)
export const isAttrAria = (s: string) => /^(aria)[A-Z]/.test(s)
export const isAttrData = (s: string) => /^(data)[A-Z]/.test(s)

export const isSvgSpecAttrKebab = (name: string) =>
  !isSvgCamelAttr(name) && !isDomeleonHtmlCamelAttr(name) && !isAttrData(name)

export const nativiseAttrName = (name: string, isSVG: boolean) =>
  isDomeleonHtmlCamelAttr(name) ? name.toLowerCase() :
  isSVG && svgCompoundWordAttrs.has(name) ? svgCompoundWordAttrs.get(name)!.kebab :
  isSVG && isSvgSpecAttrKebab(name) ? kebab(name) :
  name