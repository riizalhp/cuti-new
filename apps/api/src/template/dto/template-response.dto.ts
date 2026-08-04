export interface TemplateResponseDto {
  id: string;
  name: string;
  category: string;
  description: string | null;
  previewUrl: string;
  htmlContent: string;
  cssContent: string;
  isPremium: boolean;
  price: number | null;
  createdAt: string;
  updatedAt: string;
}

export function mapTemplateToResponse(template: any): TemplateResponseDto {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description,
    previewUrl: template.previewUrl,
    htmlContent: template.htmlContent,
    cssContent: template.cssContent,
    isPremium: template.isPremium,
    price: template.price,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}
