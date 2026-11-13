// Shared, non-reactive state the 3D scene reads every frame. Components write to it directly so that
// hovering a row or opening an overlay never re-renders React just to move a mesh.
export const sceneState = {
  highlight: -1, // index of the stack layer to lift, or -1
  pointerX: 0,
  pointerY: 0,
  paused: false // true while a full-screen overlay covers the stage
};
