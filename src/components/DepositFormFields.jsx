import React from 'react';

function FieldControl({ field, form, change }) {
  const value = form[field.name] ?? '';

  if (field.type === 'select') {
    return (
      <select name={field.name} value={value} onChange={change} required={field.required}>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type || 'text'}
      name={field.name}
      value={value}
      onChange={change}
      placeholder={field.placeholder}
      min={field.min}
      max={field.max}
      inputMode={field.inputMode}
      required={field.required}
    />
  );
}

export default function DepositFormFields({ config, form, change }) {
  const rows = [];
  let pair = [];

  config.fields.forEach((field) => {
    if (field.full) {
      if (pair.length) {
        rows.push(pair);
        pair = [];
      }
      rows.push([field]);
      return;
    }
    pair.push(field);
    if (pair.length === 2) {
      rows.push(pair);
      pair = [];
    }
  });
  if (pair.length) {
    rows.push(pair);
  }

  return (
    <>
      {rows.map((group) => (
        <div className="form-row" key={group.map((field) => field.name).join('-')}>
          {group.map((field) => (
            <label key={field.name} className={field.full ? 'full-field' : undefined}>
              {field.label}
              <FieldControl field={field} form={form} change={change} />
            </label>
          ))}
        </div>
      ))}
    </>
  );
}
