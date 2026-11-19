import type {JSX} from "react";

interface Props {
  label: string;
  value: string;
}

export function StatRow({label, value}: Props): JSX.Element {
  return (
    <li data-testid="workshop-stat" className="flex items-baseline justify-between gap-6">
      <span data-testid="workshop-stat-label" className="text-sm text-gs-ui-muted">
        {label}
      </span>

      <span data-testid="workshop-stat-value" className="font-mono text-gs-ui-text tabular-nums">
        {value}
      </span>
    </li>
  );
}
