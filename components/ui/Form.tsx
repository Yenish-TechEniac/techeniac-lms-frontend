import React from 'react';

export type FormProps = React.FormHTMLAttributes<HTMLFormElement>;

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ children, noValidate = true, ...props }, ref) => {
    return (
      <form ref={ref} noValidate={noValidate} {...props}>
        {children}
      </form>
    );
  },
);

Form.displayName = 'Form';
