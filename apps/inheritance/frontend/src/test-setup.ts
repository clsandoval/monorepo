import '@testing-library/jest-dom/vitest'

// Make navigator.clipboard writable for tests that mock it via Object.assign
// jsdom defines clipboard as a getter-only accessor, so we shadow it with
// a getter/setter on the navigator instance to allow test reassignment.
let _clipboard: Record<string, unknown> = {
  writeText: async () => {},
  readText: async () => '',
};
Object.defineProperty(navigator, 'clipboard', {
  get() { return _clipboard; },
  set(val) { _clipboard = val; },
  configurable: true,
  enumerable: true,
});

// ---------------------------------------------------------------------------
// jsdom environment polyfills
//
// Everything below fills a gap in jsdom, not a gap in this product. jsdom does
// not implement ResizeObserver, DOMRect, matchMedia, or the pointer-capture and
// scroll APIs that Radix UI and Recharts call at render time, so without these
// shims the suite measures the test environment instead of the application.
//
// Every polyfill is installed only when the real implementation is absent. An
// unconditional assignment would shadow a genuine implementation in a future
// jsdom release and quietly convert a real regression into a passing test.
//
// Adding a polyfill here is the ONLY legitimate way to fix an environment
// failure. A test may never be skipped, deleted, or have its assertion loosened
// to work around one — silent wrongness is categorically worse than loud
// failure in this codebase.
// ---------------------------------------------------------------------------

// Required by Recharts and by Radix UI's popper / scroll-area primitives.
if (!(globalThis as any).ResizeObserver) {
  (globalThis as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Required by Radix positioning code.
if (!(globalThis as any).DOMRect) {
  (globalThis as any).DOMRect = class DOMRect {
    x: number;
    y: number;
    width: number;
    height: number;
    top = 0;
    left = 0;
    right = 0;
    bottom = 0;
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
    static fromRect(rect?: { x?: number; y?: number; width?: number; height?: number }) {
      return new (globalThis as any).DOMRect(rect?.x, rect?.y, rect?.width, rect?.height);
    }
    toJSON() {
      return {};
    }
  };
}

if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    (window as any).matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }

  // Radix Select pointer / scroll APIs that jsdom does not implement. Without
  // these, Radix throws `target.hasPointerCapture is not a function` and
  // `candidate?.scrollIntoView is not a function`.
  const elementProto = window.Element.prototype as any;

  if (!elementProto.scrollIntoView) {
    elementProto.scrollIntoView = function scrollIntoView() {};
  }
  if (!elementProto.hasPointerCapture) {
    elementProto.hasPointerCapture = function hasPointerCapture() {
      return false;
    };
  }
  if (!elementProto.setPointerCapture) {
    elementProto.setPointerCapture = function setPointerCapture() {};
  }
  if (!elementProto.releasePointerCapture) {
    elementProto.releasePointerCapture = function releasePointerCapture() {};
  }
  if (!elementProto.scrollTo) {
    elementProto.scrollTo = function scrollTo() {};
  }
}
