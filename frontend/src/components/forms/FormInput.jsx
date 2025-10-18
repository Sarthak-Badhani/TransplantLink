export default function FormInput({ label, name, type='text', value, onChange, required, placeholder }){
  return (
    <div>
      {label && <label className="form-label" htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        className="form-control"
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
      />
    </div>
  )
}
