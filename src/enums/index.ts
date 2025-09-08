export enum MetricType {
  WEB_VITAL = "web-vital",
  RESOURCE_TIME = "resource-time",
  LONG_ANIMATION_FRAME_TIME = "long-animation-frame-time",
  ELEMENT_TIME = "element-time",
  NAVIGATION_TIME = "navigation-time"
}

export enum PerformanceEntryType {
  ELEMENT = "element",
  EVENT = "event",
  FIRST_INPUT = "first-input",
  LCP = "largest-contentful-paint",
  LAYOUT_SHIFT = "layout-shift",
  LONG_ANIMATION_FRAME = "long-animation-frame",
  LONG_TASK = "longtask",
  MARK = "mark",
  MEASURE = "measure",
  NAVIGATION = "navigation",
  PAINT = "paint",
  RESOURCE = "resource",
  TASK_ATTRIBUTION = "taskattribution",
  VISIBILITY_STATE = "visibility-state"
}
