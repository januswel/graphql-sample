interface Entity {
  id: string;
  title: string;
  isCompleted: boolean;
  isAbandoned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function isAbandoned(entity: Entity): boolean {
  if (entity.isCompleted) {
    return false;
  }

  const now = new Date().getTime();
  const delta = (now - entity.updatedAt.getTime()) / 1000 / 60 / 60 / 24;
  if (delta > 14) {
    return true;
  }

  return false;
}
