export interface CameraPreset {
  id: string;
  label: string;
  key: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface Hotspot {
  id: string;
  name: string;
  position: [number, number, number];
  imageSlug: string;
  description: string;
}

export const studioConfig = {
  modelPath: 'models/cottage-assembled.glb',
  cameraPresets: [
    { id: 'threequarter', label: 'Perspective', key: '1', position: [0.9, 0.6, 1.1], target: [0, 0, 0] },
    { id: 'front', label: 'Front', key: '2', position: [0.0, 0.2, 1.3], target: [0, 0, 0] },
    { id: 'rear', label: 'Rear', key: '3', position: [0.0, 0.3, -1.3], target: [0, 0, 0] },
    { id: 'left', label: 'Left', key: '4', position: [-1.3, 0.2, 0.0], target: [0, 0, 0] },
    { id: 'right', label: 'Right', key: '5', position: [1.3, 0.2, 0.0], target: [0, 0, 0] },
    { id: 'top', label: 'Top-Down', key: '6', position: [0.0, 1.5, 0.001], target: [0, 0, 0] }
  ] as CameraPreset[],

  hotspots: [
    {
      id: 'living',
      name: 'Living Pavilion',
      position: [-0.05, 0.0, 0.05],
      imageSlug: 'living-fireplace',
      description: 'Linen lounge, cast-iron wood fireplace, and floor-to-ceiling panoramic glass.'
    },
    {
      id: 'kitchen',
      name: 'Culinary Workshop',
      position: [0.08, 0.0, 0.02],
      imageSlug: 'kitchen',
      description: 'Nordic oak millwork, quartz cooking island, and morning mist reflections.'
    },
    {
      id: 'bedroom',
      name: 'Primary Suite',
      position: [-0.08, 0.0, -0.06],
      imageSlug: 'bedroom',
      description: 'Timber slat walls, cantilevered floating bed, and tranquil forest framing.'
    },
    {
      id: 'bath',
      name: 'Forest Bath',
      position: [0.09, 0.0, -0.05],
      imageSlug: 'bathroom',
      description: 'Granite basin, rain shower with glazed view toward the birch tree line.'
    }
  ] as Hotspot[]
};
