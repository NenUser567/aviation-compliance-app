function parseDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function evaluateCondition(condition: any, data: any): boolean {
  const { field, operator, value } = condition;
  const fieldValue = data[field];

  switch (operator) {
    case "equals":
      return fieldValue === value;

    case "exists":
      return fieldValue != null;

    case "within_days": {
      const date = parseDate(fieldValue);
      if (!date) return false;

      const now = new Date();
      const diff =
        (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      return diff <= value && diff >= 0;
    }

    case "past_date": {
      const date = parseDate(fieldValue);
      if (!date) return false;

      return date < new Date();
    }

    default:
      return false;
  }
}