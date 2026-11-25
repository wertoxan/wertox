export function mountShellNavigation({back, hasBack, shell, observe, page}) {
  const button = shell?.BackButton;
  if (!button) return () => {};
  let visible;
  const update = () => {
    const next = !!hasBack();
    if (next === visible) return;
    visible = next;
    try { next ? button.show() : button.hide(); } catch {}
  };
  const handler = () => {back(); update();};
  button.onClick(handler);
  const observer = observe(update);
  observer.observe(page, {subtree: true, attributes: true, attributeFilter: ['open', 'hidden', 'class']});
  update();
  return () => {observer.disconnect(); button.offClick(handler); button.hide();};
}
