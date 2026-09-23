/** Ícono de Material Symbols Outlined (fuente cargada en index.html). */
export default function Icon({ name, className = '', style }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style} aria-hidden="true">
      {name}
    </span>
  );
}
