interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
}

export default function SearchBar({ value, onSearch }: SearchBarProps) {
  return (
    <input
      className="rounded border border-edge bg-surface p-2 text-base text-ink"
      value={value}
      onChange={(SearchBarEvent) => onSearch(SearchBarEvent.target.value)}
      placeholder="Rechercher une partie par ID"
    />
  )
}