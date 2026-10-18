export interface ModelConfig {
  studio: {
    hero: string;
    mobile: string;
    explodedStack: string;
  };
  interiors: {
    living: string;
    bedroom: string;
    bathroom: string;
  };
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const modelsConfig: ModelConfig = {
  studio: {
    hero: `${base}/models/cottage-assembled.glb`,
    mobile: `${base}/models/cottage-assembled.glb`,
    explodedStack: `${base}/models/cottage-exploded.glb`
  },
  interiors: {
    living: `${base}/models/room-living.glb`,
    bedroom: `${base}/models/room-bedroom.glb`,
    bathroom: `${base}/models/room-bathroom.glb`
  }
};
