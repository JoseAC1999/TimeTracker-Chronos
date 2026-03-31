export function getProjectStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Activo";
    case "ON_HOLD":
      return "En pausa";
    case "COMPLETED":
      return "Completado";
    case "ARCHIVED":
      return "Archivado";
    default:
      return status;
  }
}

export function getTaskStatusLabel(status: string) {
  switch (status) {
    case "TODO":
      return "Por hacer";
    case "IN_PROGRESS":
      return "En curso";
    case "BLOCKED":
      return "Bloqueada";
    case "DONE":
      return "Hecha";
    case "ARCHIVED":
      return "Archivada";
    default:
      return status;
  }
}

export function getPriorityLabel(priority: string) {
  switch (priority) {
    case "LOW":
      return "Baja";
    case "MEDIUM":
      return "Media";
    case "HIGH":
      return "Alta";
    case "URGENT":
      return "Urgente";
    default:
      return priority;
  }
}
