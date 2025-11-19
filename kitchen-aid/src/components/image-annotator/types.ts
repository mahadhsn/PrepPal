export type Priority = 'green' | 'orange' | 'red'
export type NormBox = { x0:number; y0:number; x1:number; y1:number }
export type Box = { id: string; box: NormBox; label: string; score?: number; priority: Priority }