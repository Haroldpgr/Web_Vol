const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50'

const variants = {
  primary:
    'bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand shadow-sm',
  secondary:
    'bg-white text-industrial border border-neutral-300 hover:bg-neutral-100 focus-visible:ring-neutral-400',
  whatsapp:
    'bg-[#25D366] text-white hover:bg-[#1DA851] focus-visible:ring-[#25D366] shadow-sm',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  const variantClass = variants[variant] ?? variants.primary
  const sizeClass = sizes[size] ?? sizes.md
  return (
    <button className={`${base} ${variantClass} ${sizeClass} ${className}`} {...rest}>
      {children}
    </button>
  )
}
