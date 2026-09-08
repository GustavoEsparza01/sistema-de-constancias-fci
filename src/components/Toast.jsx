import Icon from './atoms/Icon';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-space-lg right-space-lg z-[60] flex items-center gap-space-sm rounded-lg bg-inverse-surface px-space-md py-space-sm text-inverse-on-surface text-body-sm shadow-xl">
      <Icon name="check_circle" className="text-[18px] text-secondary" />
      {message}
    </div>
  );
}
