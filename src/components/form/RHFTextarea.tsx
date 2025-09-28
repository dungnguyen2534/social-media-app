"use client";

import React from "react";
import { Control, FieldPath, FieldValues, useFormState } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { CircleAlert } from "lucide-react";
import { HoverCard, HoverCardContent } from "../ui/hover-card";
import { HoverCardTrigger } from "@radix-ui/react-hover-card";
import { Textarea } from "../ui/textarea";

interface RHFTextareaProps<
  TFormValues extends FieldValues,
  TName extends FieldPath<TFormValues>,
> {
  control: Control<TFormValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export default function RHFTextarea<
  TFormValues extends FieldValues,
  TName extends FieldPath<TFormValues>,
>({
  control,
  name,
  label,
  placeholder,
  description,
  className,
  disabled,
}: RHFTextareaProps<TFormValues, TName>) {
  const { errors } = useFormState({ control, name });
  const hasError = !!errors[name];

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="relative">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div>
              <Textarea
                placeholder={placeholder}
                className={
                  hasError
                    ? `border-destructive focus-visible:ring-destructive pr-9 ${className}`
                    : `pr-9 ${className}`
                }
                disabled={disabled}
                {...field}
              />
              {hasError && (
                <div className="absolute top-1/2 right-2">
                  <HoverCard openDelay={0}>
                    <HoverCardTrigger className="cursor-pointer">
                      <CircleAlert color="#DC2626" />
                    </HoverCardTrigger>
                    <HoverCardContent className="border-destructive w-fit px-3 py-2">
                      <FormMessage className="font-semibold" />
                    </HoverCardContent>
                  </HoverCard>
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  );
}
