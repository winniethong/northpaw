// Minimal field-requirement affordances shared across forms.

export function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
  );
}

export function OptionalHint() {
  return (
    <span className="font-normal text-muted-foreground">(optional)</span>
  );
}
