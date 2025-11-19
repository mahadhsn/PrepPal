// global.d.ts

import type * as React from 'react'

// Ensure the global JSX namespace exists and matches React's
declare global {
  namespace JSX {
    // Re-use React's intrinsic elements so we don't lose any typing
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}

export {}