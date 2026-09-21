export function EmptyState({ title, text, action }) {
  return (
    <div className="state">
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state" role="alert">
      <h3>Algo deu errado</h3>
      <p>{error?.message || 'Não foi possível carregar. Tente novamente.'}</p>
      {onRetry && <button className="btn btn-ghost btn-sm" onClick={onRetry}>Tentar novamente</button>}
    </div>
  );
}
