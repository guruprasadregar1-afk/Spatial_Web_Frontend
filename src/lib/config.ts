export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1',
  defaultCameraPos: [0, 10, 25] as [number, number, number],
  defaultCameraTarget: [0, 0, 0] as [number, number, number],
};
