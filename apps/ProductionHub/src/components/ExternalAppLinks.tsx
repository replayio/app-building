interface ExternalAppLinksProps {
  runId: string;
}

export function ExternalAppLinks({ runId }: ExternalAppLinksProps) {
  return (
    <div data-testid="external-app-links" className="external-links-container">
      <a
        href={`/inventory?run=${runId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="link"
        data-testid="inventory-app-link"
      >
        View in Inventory App
      </a>
      <span className="external-links-divider">|</span>
      <a
        href={`/deliveries?run=${runId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="link"
        data-testid="delivery-app-link"
      >
        View in Delivery App
      </a>
    </div>
  );
}
