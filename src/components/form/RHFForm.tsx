import React from "react";
import {
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
  FieldValues,
} from "react-hook-form";
import { Form } from "../ui/form";

interface RHFFormProps<TFormValues extends FieldValues> {
  children: React.ReactNode;
  form: UseFormReturn<TFormValues>;
  onSubmit?: SubmitHandler<TFormValues>;
  onInvalid?: SubmitErrorHandler<TFormValues>;
  className?: string;
  resetAfterSubmit?: boolean;
}

export default function RHFForm<TFormValues extends FieldValues>({
  children,
  form,
  onSubmit,
  onInvalid,
  className,
  resetAfterSubmit,
}: RHFFormProps<TFormValues>) {
  const handleSubmit: SubmitHandler<TFormValues> = async (data) => {
    if (onSubmit) {
      await onSubmit(data);
      if (resetAfterSubmit) {
        form.reset();
      }
    }
  };

  return (
    <Form {...form}>
      <form
        className={className}
        onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
      >
        {children}
      </form>
    </Form>
  );
}
