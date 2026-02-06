import { supabase, isDemoMode } from '../lib/supabase';
import { mockFloorPlans } from '../data/mockFloorPlans';
import type { FloorPlan, FloorPlanFormData } from '../types/floorPlan';

interface FloorPlanRow {
  id: string;
  created_at: string;
  updated_at: string;
  property_id: string;
  name: string;
  floor: string;
  image_path: string | null;
  owner_id: string;
}

const STORAGE_KEY = 'concrete-floor-plans';

function loadDemoPlans(): FloorPlan[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored) as FloorPlan[];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockFloorPlans));
  return [...mockFloorPlans];
}

function saveDemoPlans(plans: FloorPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function rowToPlan(row: FloorPlanRow): FloorPlan {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    propertyId: row.property_id,
    name: row.name,
    floor: row.floor,
    imagePath: row.image_path,
    imageUrl: row.image_path
      ? supabase.storage.from('floor-plans').getPublicUrl(row.image_path).data.publicUrl
      : null,
    ownerId: row.owner_id,
  };
}

export async function getFloorPlansByProperty(propertyId: string): Promise<FloorPlan[]> {
  if (isDemoMode) {
    return loadDemoPlans().filter(fp => fp.propertyId === propertyId);
  }

  const { data, error } = await supabase
    .from('floor_plans')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: true })
    .returns<FloorPlanRow[]>();

  if (error) throw error;
  return (data ?? []).map(rowToPlan);
}

export async function getFloorPlanById(id: string): Promise<FloorPlan | null> {
  if (isDemoMode) {
    return loadDemoPlans().find(fp => fp.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('floor_plans')
    .select('*')
    .eq('id', id)
    .returns<FloorPlanRow[]>()
    .single();

  if (error) return null;
  return rowToPlan(data);
}

export async function createFloorPlan(formData: FloorPlanFormData): Promise<FloorPlan> {
  if (isDemoMode) {
    const plans = loadDemoPlans();
    const now = new Date().toISOString();
    const newPlan: FloorPlan = {
      id: `fp-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      propertyId: formData.propertyId,
      name: formData.name,
      floor: formData.floor,
      imagePath: null,
      imageUrl: null,
      ownerId: 'demo-user',
    };
    plans.push(newPlan);
    saveDemoPlans(plans);
    return newPlan;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('floor_plans')
    .insert({
      property_id: formData.propertyId,
      name: formData.name,
      floor: formData.floor,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToPlan(data as unknown as FloorPlanRow);
}

export async function updateFloorPlan(id: string, updates: Partial<FloorPlanFormData>): Promise<FloorPlan> {
  if (isDemoMode) {
    const plans = loadDemoPlans();
    const idx = plans.findIndex(fp => fp.id === id);
    if (idx === -1) throw new Error('Floor plan not found');
    const updated = {
      ...plans[idx],
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.floor !== undefined && { floor: updates.floor }),
      updatedAt: new Date().toISOString(),
    };
    plans[idx] = updated;
    saveDemoPlans(plans);
    return updated;
  }

  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.floor !== undefined) dbUpdates.floor = updates.floor;

  const { data, error } = await supabase
    .from('floor_plans')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToPlan(data as unknown as FloorPlanRow);
}

export async function deleteFloorPlan(id: string): Promise<void> {
  if (isDemoMode) {
    const plans = loadDemoPlans();
    saveDemoPlans(plans.filter(fp => fp.id !== id));
    return;
  }

  const plan = await getFloorPlanById(id);
  if (plan?.imagePath) {
    await supabase.storage.from('floor-plans').remove([plan.imagePath]);
  }

  const { error } = await supabase.from('floor_plans').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadFloorPlanImage(planId: string, file: File): Promise<string> {
  if (isDemoMode) {
    const imageUrl = URL.createObjectURL(file);
    const plans = loadDemoPlans();
    const idx = plans.findIndex(fp => fp.id === planId);
    if (idx === -1) throw new Error('Floor plan not found');
    plans[idx] = {
      ...plans[idx],
      imagePath: `demo/${planId}/${file.name}`,
      imageUrl,
      updatedAt: new Date().toISOString(),
    };
    saveDemoPlans(plans);
    return imageUrl;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const filePath = `${user.id}/${planId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('floor-plans')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  await supabase
    .from('floor_plans')
    .update({ image_path: filePath })
    .eq('id', planId);

  const { data: { publicUrl } } = supabase.storage
    .from('floor-plans')
    .getPublicUrl(filePath);

  return publicUrl;
}
