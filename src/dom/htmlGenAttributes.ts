import type { CSSProperties } from 'preact'

export interface KnownHtmlAttributes {
  class?: string | string[] | undefined
  style?: CSSProperties | undefined
  acceptCharset?: string
  autoComplete?: boolean
  autoPlay?: boolean
  bgColor?: string
  colSpan?: string | number
  crossOrigin?: "" | string | "anonymous" | "use-credentials"
  dateTime?: string
  dirName?: string
  encType?: string | "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain"
  formAction?: string
  formEncType?: string
  formMethod?: string
  formNoValidate?: string
  formTarget?: string
  hrefLang?: string
  httpEquiv?: string
  isMap?: boolean
  maxLength?: string | number
  minLength?: string | number
  noValidate?: boolean
  playsInline?: boolean
  readOnly?: string
  referrerPolicy?: string
  rowSpan?: string | number
  srcDoc?: string
  srcLang?: string
  srcSet?: string
  useMap?: string
  accept?: string
  action?: string
  align?: string | "left" | "top" | "right" | "bottom"
  allow?: string
  alt?: string
  as?: "object" | "style" | "document" | string | "audio" | "embed" | "fetch" | "font" | "image" | "script" | "track" | "video" | "worker"
  async?: boolean
  autoplay?: boolean
  background?: string
  border?: string
  capture?: string | "user" | "environment"
  charset?: string
  checked?: boolean
  cite?: string
  color?: string
  cols?: string | number
  content?: string | number
  controls?: boolean
  coords?: string
  csp?: string
  data?: string & Record<string, any>
  decoding?: string
  default?: boolean
  defer?: boolean
  disabled?: boolean
  download?: string
  for?: string
  form?: string
  headers?: string
  height?: string | number
  high?: string | number
  href?: string
  integrity?: string
  kind?: string | "subtitles" | "captions" | "chapters" | "metadata"
  label?: string
  language?: string
  loading?: string | "lazy" | "eager"
  list?: string
  loop?: boolean
  low?: string | number
  max?: string | number
  media?: string
  method?: string
  min?: string | number
  multiple?: boolean
  muted?: boolean
  name?: string
  open?: boolean
  optimum?: string | number
  pattern?: string
  ping?: string
  placeholder?: string
  poster?: string
  preload?: string
  rel?: "preload" | "search" | string | "alternate" | "author" | "bookmark" | "canonical" | "dns-prefetch" | "external" | "expect" | "help" | "icon" | "license" | "manifest" | "me" | "modulepreload" | "next" | "nofollow" | "noopener" | "noreferrer" | "opener" | "pingback" | "preconnect" | "prefetch" | "prerender" | "prey" | "privacy-policy" | "stylesheet" | "tag" | "terms-of-service"
  required?: boolean
  reversed?: boolean
  role?: string | string
  rows?: string | number
  sandbox?: string | "allow-downloads" | "allow-forms" | "allow-modals" | "allow-orientation-lock" | "allow-pointer-lock" | "allow-popups" | "allow-popups-to-escape-sandbox" | "allow-presentation" | "allow-same-origin" | "allow-scripts" | "allow-storage-access-by-user-activation" | "allow-top-navigation" | "allow-top-navigation-by-user-activation" | "allow-top-navigation-to-custom-protocols"
  scope?: "row" | "rowgroup" | string | "col" | "colgroup"
  selected?: boolean
  shape?: string
  size?: string | number
  sizes?: string
  span?: string | number
  src?: string
  start?: string | number
  step?: string | number
  summary?: string
  target?: string | "_blank" | "_self" | "_parent" | "_top"
  type?: string
  value?: string | number
  width?: string | number
  wrap?: string | "hard" | "soft" | "off"
  autoCapitalize?: "none" | string | "off" | "sentences" | "on" | "words" | "characters"
  autoFocus?: boolean
  contentEditable?: boolean
  enterKeyHint?: string
  exportParts?: string
  inputMode?: "none" | "search" | string | "text" | "decimal" | "numeric" | "tel" | "email" | "url"
  itemId?: string
  itemProp?: string
  itemRef?: string | string[]
  itemScope?: string
  itemType?: string
  popOver?: string
  spellCheck?: boolean
  tabIndex?: string | number
  virtualKeyboardPolicy?: string | "auto" | "manual"
  writingSuggestions?: boolean
  accesskey?: string
  anchor?: string
  dir?: string | "auto" | "ltr" | "rtl"
  draggable?: boolean
  hidden?: boolean
  id?: string
  insert?: boolean
  lang?: string
  nonce?: string
  part?: string
  slot?: string
  title?: string
  translate?: string | "yes" | "no"
  onAbort?: (ev: UIEvent) => void
  onActivate?: (ev: AnimationEvent) => void
  onAnimationCancel?: (ev: AnimationEvent) => void
  onAnimationEnd?: (ev: AnimationEvent) => void
  onAnimationIteration?: (ev: AnimationEvent) => void
  onAnimationStart?: (ev: AnimationEvent) => void
  onAuxClick?: (ev: MouseEvent) => void
  onBeforeInput?: (ev: InputEvent) => void
  onBeforeToggle?: (ev: Event) => void
  onBegin?: (ev: Event) => void
  onBlur?: (ev: FocusEvent) => void
  onCancel?: (ev: Event) => void
  onCanPlay?: (ev: Event) => void
  onCanPlayThrough?: (ev: Event) => void
  onChange?: (ev: Event) => void
  onClick?: (ev: MouseEvent) => void
  onClose?: (ev: Event) => void
  onContextLost?: (ev: Event) => void
  onContextMenu?: (ev: MouseEvent) => void
  onContextRestored?: (ev: Event) => void
  onCopy?: (ev: ClipboardEvent) => void
  onCueChange?: (ev: Event) => void
  onCut?: (ev: ClipboardEvent) => void
  onDblClick?: (ev: MouseEvent) => void
  onDrag?: (ev: DragEvent) => void
  onDragEnd?: (ev: DragEvent) => void
  onDragEnter?: (ev: DragEvent) => void
  onDragLeave?: (ev: DragEvent) => void
  onDragOver?: (ev: DragEvent) => void
  onDragStart?: (ev: DragEvent) => void
  onDrop?: (ev: DragEvent) => void
  onDurationChange?: (ev: Event) => void
  onEmptied?: (ev: Event) => void
  onEnded?: (ev: Event) => void
  onError?: (event: Event | string) => void
  onFocus?: (ev: FocusEvent) => void
  onFocusIn?: (ev: FocusEvent) => void
  onFocusOut?: (ev: FocusEvent) => void
  onFormData?: (ev: FormDataEvent) => void
  onGotPointerCapture?: (ev: PointerEvent) => void
  onInput?: (ev: Event) => void
  onInvalid?: (ev: Event) => void
  onKeyDown?: (ev: KeyboardEvent) => void
  onKeyPress?: (ev: KeyboardEvent) => void
  onKeyUp?: (ev: KeyboardEvent) => void
  onLoad?: (ev: Event) => void
  onLoadedData?: (ev: Event) => void
  onLoadedMetaData?: (ev: Event) => void
  onLoadStart?: (ev: Event) => void
  onLostPointerCapture?: (ev: PointerEvent) => void
  onMouseDown?: (ev: MouseEvent) => void
  onMouseEnter?: (ev: MouseEvent) => void
  onMouseLeave?: (ev: MouseEvent) => void
  onMouseMove?: (ev: MouseEvent) => void
  onMouseOut?: (ev: MouseEvent) => void
  onMouseOver?: (ev: MouseEvent) => void
  onMouseUp?: (ev: MouseEvent) => void
  onMouseWheel?: (event: Event) => void
  onPaste?: (ev: ClipboardEvent) => void
  onPause?: (ev: Event) => void
  onPlay?: (ev: Event) => void
  onPlaying?: (ev: Event) => void
  onPointerCancel?: (ev: PointerEvent) => void
  onPointerDown?: (ev: PointerEvent) => void
  onPointerEnter?: (ev: PointerEvent) => void
  onPointerLeave?: (ev: PointerEvent) => void
  onPointerMove?: (ev: PointerEvent) => void
  onPointerOut?: (ev: PointerEvent) => void
  onPointerOver?: (ev: PointerEvent) => void
  onPointerUp?: (ev: PointerEvent) => void
  onProgress?: (ev: ProgressEvent) => void
  onRateChange?: (ev: Event) => void
  onRepeat?: (ev: Event) => void
  onReset?: (ev: Event) => void
  onResize?: (ev: UIEvent) => void
  onScroll?: (ev: Event) => void
  onScrollEnd?: (ev: Event) => void
  onSecurityPolicyViolation?: (ev: SecurityPolicyViolationEvent) => void
  onSeeked?: (ev: Event) => void
  onSeeking?: (ev: Event) => void
  onSelect?: (ev: Event) => void
  onSelectionChange?: (ev: Event) => void
  onSelectStart?: (ev: Event) => void
  onShow?: (ev: Event) => void
  onSlotChange?: (ev: Event) => void
  onStalled?: (ev: Event) => void
  onSubmit?: (ev: SubmitEvent) => void
  onSuspend?: (ev: Event) => void
  onTimeUpdate?: (ev: Event) => void
  onToggle?: (ev: Event) => void
  onTouchCancel?: (ev: TouchEvent) => void
  onTouchEnd?: (ev: TouchEvent) => void
  onTouchMove?: (ev: TouchEvent) => void
  onTouchStart?: (ev: TouchEvent) => void
  onTransitionCancel?: (ev: TransitionEvent) => void
  onTransitionEnd?: (ev: TransitionEvent) => void
  onTransitionRun?: (ev: TransitionEvent) => void
  onTransitionStart?: (ev: TransitionEvent) => void
  onUnload?: (ev: Event) => void
  onVolumeChange?: (ev: Event) => void
  onWaiting?: (ev: Event) => void
  onWebkitAnimationEnd?: (ev: Event) => void
  onWebkitAnimationIteration?: (ev: Event) => void
  onWebkitAnimationStart?: (ev: Event) => void
  onWebkitTransitionEnd?: (ev: Event) => void
  onWheel?: (ev: WheelEvent) => void
  ariaActiveDescendant?: string
  ariaAtomic?: string | boolean
  ariaAutoComplete?: "list" | "none" | string | "inline" | "both"
  ariaBrailleLabel?: string
  ariaBrailleRoleDescription?: string
  ariaBusy?: boolean
  ariaChecked?: boolean | string | "true" | "false" | "mixed"
  ariaColCount?: number
  ariaColIndex?: number
  ariaColSpan?: number
  ariaControls?: string
  ariaCurrent?: boolean | "step" | string | "true" | "false" | "page" | "location" | "date" | "time"
  ariaDescription?: string
  ariaDescribedBy?: string
  ariaDetails?: string
  ariaDisabled?: boolean
  ariaDropEffect?: "link" | "none" | string | "copy" | "execute" | "move" | "popup"
  ariaErrorMessage?: string
  ariaExpanded?: boolean
  ariaFlowTo?: string
  ariaGrabbed?: boolean
  ariaHasPopup?: boolean | "dialog" | "grid" | "listbox" | "menu" | "tree" | string | "true" | "false"
  ariaHidden?: boolean
  ariaInvalid?: boolean | string | "true" | "false" | "grammar" | "spelling"
  ariaKeyShortcuts?: string
  ariaLabel?: string
  ariaLabelledBy?: string
  ariaLevel?: number
  ariaLive?: string | "off" | "assertive" | "polite"
  ariaModal?: boolean
  ariaMultiLine?: boolean
  ariaMultiSelectable?: boolean
  ariaOrientation?: string | "horizontal" | "vertical"
  ariaOwns?: string
  ariaPlaceholder?: string
  ariaPosInSet?: number
  ariaPressed?: boolean | string | "true" | "false" | "mixed"
  ariaReadOnly?: boolean
  ariaRelevant?: string | "text" | "additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text additions" | "text removals"
  ariaRequired?: boolean
  ariaRoleDescription?: string
  ariaRowCount?: number
  ariaRowIndex?: number
  ariaRowSpan?: number
  ariaSelected?: boolean
  ariaSetSize?: number
  ariaSort?: "none" | string | "ascending" | "descending" | "other"
  ariaValueMax?: number
  ariaValueMin?: number
  ariaValueNow?: number
  ariaValueText?: string
}