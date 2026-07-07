export type StatusFilterValue = "ALL" | "PENDING" | "ACTIVE";

const STATUS_FILTER_LABELS: Record<StatusFilterValue, string> = {
  ALL: "Tous les états",
  PENDING: "En attente",
  ACTIVE: "En cours",
};

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
}

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <select
      className="rounded border border-edge bg-surface p-2 text-base text-ink"
      value={value}
      onChange={(e) => onChange(e.target.value as StatusFilterValue)}
      aria-label="Filtrer par état de la partie"
    >
      {(Object.keys(STATUS_FILTER_LABELS) as StatusFilterValue[]).map((status) => (
        <option key={status} value={status}>
          {STATUS_FILTER_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
