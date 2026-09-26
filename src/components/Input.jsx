const fieldBase =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-colors'

const normalBorder = 'border-neutral-300 focus:border-brand focus:ring-brand/30'
const errorBorder = 'border-red-500 focus:border-red-500 focus:ring-red-200'

function FieldWrapper({ label, error, children, htmlFor }) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1 block text-sm font-semibold text-industrial"
        >
          {label}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Input({ label, error, id, className = '', ...rest }) {
  return (
    <FieldWrapper label={label} error={error} htmlFor={id}>
      <input
        id={id}
        className={`${fieldBase} ${error ? errorBorder : normalBorder} ${className}`}
        {...rest}
      />
    </FieldWrapper>
  )
}

export function TextArea({ label, error, id, className = '', rows = 4, ...rest }) {
  return (
    <FieldWrapper label={label} error={error} htmlFor={id}>
      <textarea
        id={id}
        rows={rows}
        className={`${fieldBase} resize-y ${error ? errorBorder : normalBorder} ${className}`}
        {...rest}
      />
    </FieldWrapper>
  )
}

export function Select({ label, error, id, className = '', children, ...rest }) {
  return (
    <FieldWrapper label={label} error={error} htmlFor={id}>
      <select
        id={id}
        className={`${fieldBase} ${error ? errorBorder : normalBorder} ${className}`}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  )
}
