export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateDraftSlug(name: string, uniqueId: string): string {
  const baseSlug = generateSlug(name) || 'rascunho';
  return `${baseSlug}-${uniqueId.slice(0, 8)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
