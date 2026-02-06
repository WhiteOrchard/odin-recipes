export type WorkPointStatus = 'planned' | 'in-progress' | 'completed';

export interface FloorPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  propertyId: string;
  name: string;
  floor: string;
  imagePath: string | null;
  imageUrl: string | null;
  ownerId: string;
}

export interface WorkPoint {
  id: string;
  createdAt: string;
  floorPlanId: string;
  xPercent: number;
  yPercent: number;
  title: string;
  description: string;
  status: WorkPointStatus;
  dueDate: string | null;
  room: string;
  images: WorkPointImage[];
  comments: WorkPointComment[];
  ownerId: string;
}

export interface WorkPointImage {
  id: string;
  createdAt: string;
  workPointId: string;
  imagePath: string;
  imageUrl: string;
  caption: string;
  ownerId: string;
}

export interface WorkPointComment {
  id: string;
  createdAt: string;
  workPointId: string;
  text: string;
  authorName: string;
  ownerId: string;
}

export interface FloorPlanFormData {
  propertyId: string;
  name: string;
  floor: string;
  imageFile?: File;
}

export interface WorkPointFormData {
  floorPlanId: string;
  xPercent: number;
  yPercent: number;
  title: string;
  description: string;
  status: WorkPointStatus;
  dueDate: string | null;
  room: string;
}
