export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface CameraState {
  position: Point3D;
  target: Point3D;
  fov: number;
}
