export interface TemplateResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  previewImageUrl: string | null;
  targetPositions: any;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export function mapTemplateToResponse(template: any): TemplateResponseDto {
  return {
    id: template.id,
    name: template.name,
    slug: template.slug,
    description: template.description,
    previewImageUrl: template.preview_image_url,
    targetPositions: template.target_positions,
    isActive: template.is_active,
    sortOrder: template.sort_order,
    createdAt: template.created_at?.toISOString?.() || template.created_at,
  };
}
