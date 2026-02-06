import { supabase, isDemoMode } from '../lib/supabase';
import { mockWorkPoints, mockWorkPointImages, mockWorkPointComments } from '../data/mockFloorPlans';
import type { WorkPoint, WorkPointFormData, WorkPointImage, WorkPointComment } from '../types/floorPlan';

interface PhotoPinRow {
  id: string;
  created_at: string;
  updated_at: string;
  floor_plan_id: string;
  x_percent: number;
  y_percent: number;
  label: string;
  room: string;
  image_path: string;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
  owner_id: string;
  pin_images?: PinImageRow[];
  pin_comments?: PinCommentRow[];
}

interface PinImageRow {
  id: string;
  created_at: string;
  pin_id: string;
  image_path: string;
  caption: string;
  owner_id: string;
}

interface PinCommentRow {
  id: string;
  created_at: string;
  pin_id: string;
  text: string;
  author_name: string;
  owner_id: string;
}

const POINTS_KEY = 'concrete-work-points';
const IMAGES_KEY = 'concrete-wp-images';
const COMMENTS_KEY = 'concrete-wp-comments';

function loadDemoPoints(): WorkPoint[] {
  const stored = localStorage.getItem(POINTS_KEY);
  if (stored) {
    return JSON.parse(stored) as WorkPoint[];
  }
  localStorage.setItem(POINTS_KEY, JSON.stringify(mockWorkPoints));
  return [...mockWorkPoints];
}

function saveDemoPoints(points: WorkPoint[]) {
  localStorage.setItem(POINTS_KEY, JSON.stringify(points));
}

function loadDemoImages(): WorkPointImage[] {
  const stored = localStorage.getItem(IMAGES_KEY);
  if (stored) {
    return JSON.parse(stored) as WorkPointImage[];
  }
  localStorage.setItem(IMAGES_KEY, JSON.stringify(mockWorkPointImages));
  return [...mockWorkPointImages];
}

function saveDemoImages(images: WorkPointImage[]) {
  localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
}

function loadDemoComments(): WorkPointComment[] {
  const stored = localStorage.getItem(COMMENTS_KEY);
  if (stored) {
    return JSON.parse(stored) as WorkPointComment[];
  }
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(mockWorkPointComments));
  return [...mockWorkPointComments];
}

function saveDemoComments(comments: WorkPointComment[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

function assembleDemoWorkPoints(floorPlanId: string): WorkPoint[] {
  const points = loadDemoPoints().filter(wp => wp.floorPlanId === floorPlanId);
  const images = loadDemoImages();
  const comments = loadDemoComments();

  return points.map(wp => ({
    ...wp,
    images: images.filter(i => i.workPointId === wp.id),
    comments: comments.filter(c => c.workPointId === wp.id),
  }));
}

function rowToWorkPoint(row: PhotoPinRow): WorkPoint {
  return {
    id: row.id,
    createdAt: row.created_at,
    floorPlanId: row.floor_plan_id,
    xPercent: Number(row.x_percent),
    yPercent: Number(row.y_percent),
    title: row.title,
    description: row.description,
    status: row.status as WorkPoint['status'],
    dueDate: row.due_date,
    room: row.room,
    ownerId: row.owner_id,
    images: (row.pin_images ?? []).map(img => ({
      id: img.id,
      createdAt: img.created_at,
      workPointId: row.id,
      imagePath: img.image_path,
      imageUrl: img.image_path
        ? supabase.storage.from('floor-plans').getPublicUrl(img.image_path).data.publicUrl
        : '',
      caption: img.caption,
      ownerId: img.owner_id,
    })),
    comments: (row.pin_comments ?? []).map(c => ({
      id: c.id,
      createdAt: c.created_at,
      workPointId: row.id,
      text: c.text,
      authorName: c.author_name,
      ownerId: c.owner_id,
    })),
  };
}

export async function getWorkPointsByFloorPlan(floorPlanId: string): Promise<WorkPoint[]> {
  if (isDemoMode) {
    return assembleDemoWorkPoints(floorPlanId);
  }

  const { data, error } = await supabase
    .from('photo_pins')
    .select('*, pin_images(*), pin_comments(*)')
    .eq('floor_plan_id', floorPlanId)
    .order('created_at', { ascending: true })
    .returns<PhotoPinRow[]>();

  if (error) throw error;
  return (data ?? []).map(rowToWorkPoint);
}

export async function createWorkPoint(formData: WorkPointFormData): Promise<WorkPoint> {
  if (isDemoMode) {
    const points = loadDemoPoints();
    const newPoint: WorkPoint = {
      id: `wp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      floorPlanId: formData.floorPlanId,
      xPercent: formData.xPercent,
      yPercent: formData.yPercent,
      title: formData.title,
      description: formData.description,
      status: formData.status,
      dueDate: formData.dueDate,
      room: formData.room,
      images: [],
      comments: [],
      ownerId: 'demo-user',
    };
    points.push(newPoint);
    saveDemoPoints(points);
    return newPoint;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('photo_pins')
    .insert({
      floor_plan_id: formData.floorPlanId,
      x_percent: formData.xPercent,
      y_percent: formData.yPercent,
      title: formData.title,
      description: formData.description,
      status: formData.status,
      due_date: formData.dueDate,
      room: formData.room,
      label: formData.title,
      image_path: '',
      owner_id: user.id,
    })
    .select()
    .returns<PhotoPinRow[]>()
    .single();

  if (error) throw error;
  return { ...rowToWorkPoint(data), images: [], comments: [] };
}

export async function updateWorkPoint(id: string, updates: Partial<WorkPointFormData>): Promise<WorkPoint> {
  if (isDemoMode) {
    const points = loadDemoPoints();
    const images = loadDemoImages();
    const comments = loadDemoComments();
    const idx = points.findIndex(wp => wp.id === id);
    if (idx === -1) throw new Error('Work point not found');
    const updated = { ...points[idx], ...updates };
    points[idx] = updated;
    saveDemoPoints(points);
    return {
      ...updated,
      images: images.filter(i => i.workPointId === id),
      comments: comments.filter(c => c.workPointId === id),
    };
  }

  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) { dbUpdates.title = updates.title; dbUpdates.label = updates.title; }
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  if (updates.room !== undefined) dbUpdates.room = updates.room;

  const { data, error } = await supabase
    .from('photo_pins')
    .update(dbUpdates)
    .eq('id', id)
    .select('*, pin_images(*), pin_comments(*)')
    .returns<PhotoPinRow[]>()
    .single();

  if (error) throw error;
  return rowToWorkPoint(data);
}

export async function deleteWorkPoint(id: string): Promise<void> {
  if (isDemoMode) {
    const points = loadDemoPoints();
    saveDemoPoints(points.filter(wp => wp.id !== id));
    const images = loadDemoImages();
    saveDemoImages(images.filter(i => i.workPointId !== id));
    const comments = loadDemoComments();
    saveDemoComments(comments.filter(c => c.workPointId !== id));
    return;
  }

  const { error } = await supabase.from('photo_pins').delete().eq('id', id);
  if (error) throw error;
}

export async function addWorkPointImage(
  workPointId: string,
  file: File,
  caption: string = ''
): Promise<WorkPointImage> {
  if (isDemoMode) {
    const images = loadDemoImages();
    const imageUrl = URL.createObjectURL(file);
    const newImage: WorkPointImage = {
      id: `wpi-${Date.now()}`,
      createdAt: new Date().toISOString(),
      workPointId,
      imagePath: `demo/${workPointId}/${file.name}`,
      imageUrl,
      caption,
      ownerId: 'demo-user',
    };
    images.push(newImage);
    saveDemoImages(images);
    return newImage;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const filePath = `${user.id}/work-point-images/${workPointId}/${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('floor-plans')
    .upload(filePath, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('pin_images')
    .insert({
      pin_id: workPointId,
      image_path: filePath,
      caption,
      owner_id: user.id,
    })
    .select()
    .returns<PinImageRow[]>()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    createdAt: data.created_at,
    workPointId,
    imagePath: data.image_path,
    imageUrl: supabase.storage.from('floor-plans').getPublicUrl(data.image_path).data.publicUrl,
    caption: data.caption,
    ownerId: data.owner_id,
  };
}

export async function removeWorkPointImage(imageId: string): Promise<void> {
  if (isDemoMode) {
    const images = loadDemoImages();
    saveDemoImages(images.filter(i => i.id !== imageId));
    return;
  }

  const { data } = await supabase
    .from('pin_images')
    .select('image_path')
    .eq('id', imageId)
    .returns<PinImageRow[]>()
    .single();

  if (data?.image_path) {
    await supabase.storage.from('floor-plans').remove([data.image_path]);
  }

  const { error } = await supabase.from('pin_images').delete().eq('id', imageId);
  if (error) throw error;
}

export async function addWorkPointComment(
  workPointId: string,
  text: string
): Promise<WorkPointComment> {
  if (isDemoMode) {
    const comments = loadDemoComments();
    const newComment: WorkPointComment = {
      id: `wpc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      workPointId,
      text,
      authorName: 'Demo User',
      ownerId: 'demo-user',
    };
    comments.push(newComment);
    saveDemoComments(comments);
    return newComment;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('pin_comments')
    .insert({
      pin_id: workPointId,
      text,
      author_name: user.email ?? 'Unknown',
      owner_id: user.id,
    })
    .select()
    .returns<PinCommentRow[]>()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    createdAt: data.created_at,
    workPointId,
    text: data.text,
    authorName: data.author_name,
    ownerId: data.owner_id,
  };
}

export async function removeWorkPointComment(commentId: string): Promise<void> {
  if (isDemoMode) {
    const comments = loadDemoComments();
    saveDemoComments(comments.filter(c => c.id !== commentId));
    return;
  }

  const { error } = await supabase.from('pin_comments').delete().eq('id', commentId);
  if (error) throw error;
}
