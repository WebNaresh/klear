# Klear

A comprehensive, type-safe UI Input Field component built with **shadcn/ui**, **React Hook Form**, and **Zod** for **Next.js** applications.

## Features

- 🚀 **Built for Next.js**: Optimized for modern Next.js applications.
- 🛡️ **Type Safe**: Fully typed with TypeScript and Zod integration.
- 🎨 **Shadcn UI**: Beautiful, accessible components based on shadcn/ui.
- 📝 **React Hook Form**: Seamless integration with the best form library.
- 🧩 **All-in-One**: Supports text, password, email, number, select, multi-select, date, file, rating, and more.
- 🤖 **AI Ready**: Includes AI-powered text area components.
- 📍 **Location Aware**: Built-in Google Places Autocomplete support.

## Installation

```bash
npm install klear
# or
pnpm add klear
# or
yarn add klear
```

## Prerequisites

Ensure you have the following peer dependencies installed in your project:

```bash
npm install react react-dom next lucide-react react-hook-form zod @hookform/resolvers clsx tailwind-merge
```

## Usage

`klear` exports a single powerful component `UIInputField` that adapts based on the `type` prop. It **must** be used within a `react-hook-form` `FormProvider`.

### Basic Example

```tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UIInputField } from "klear";
import { User, Mail } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
});

export default function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => console.log(data);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <UIInputField
          name="name"
          label="Full Name"
          placeholder="John Doe"
          type="text"
          Icon={User}
        />
        
        <UIInputField
          name="email"
          label="Email Address"
          placeholder="john@example.com"
          type="email"
          Icon={Mail}
        />

        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

## Supported Input Types

The `type` prop determines the rendered component:

| Type | Description |
|------|-------------|
| `text` | Standard text input |
| `password` | Password input with toggle visibility |
| `email` | Email input validation |
| `number` | Numeric input |
| `select` | Dropdown select (requires `options`) |
| `multiSelect` | Multiple selection dropdown |
| `date` | Date picker |
| `datetime-local` | Date and time picker |
| `text-area` | Multiline text area |
| `switch` | Toggle switch |
| `checkbox` | Single checkbox |
| `radio` | Radio group (requires `options`) |
| `rating` | Star rating component |
| `color-picker` | Color picker with presets |
| `OTP` | One-Time Password input |
| `phone` | Phone number input |
| `file` | File upload input |
| `places_autocomplete` | Google Places address autocomplete |
| `ai-text-area` | AI-enhanced text generation area |

## Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | **Required**. The field name (matches Zod schema). |
| `type` | `string` | **Required**. The type of input to render. |
| `label` | `string` | Label text displayed above the input. |
| `placeholder` | `string` | Placeholder text. |
| `description` | `string` | Helper text displayed below the input. |
| `Icon` | `LucideIcon` | Icon component to display inside the input. |
| `options` | `{ label: string, value: string }[]` | Options for select, radio, etc. |
| `required` | `boolean` | Marks the field as required visually. |
| `disabled` | `boolean` | Disables the input. |
| `className` | `string` | Custom classes for the container. |

## License

MIT © [WebNaresh](https://github.com/WebNaresh)
