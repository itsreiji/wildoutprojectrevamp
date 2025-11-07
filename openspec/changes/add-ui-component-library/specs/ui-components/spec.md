## ADDED Requirements

### Requirement: Reusable UI Component Library
The application SHALL provide a comprehensive set of reusable, accessible UI components built on shadcn/ui patterns, Radix UI primitives, and Tailwind CSS. These components MUST be located in `src/components/ui/` and MUST support dark mode, proper TypeScript typing, and ref forwarding.

#### Scenario: Input component usage
- **WHEN** a developer imports and uses the Input component
- **THEN** the component accepts all standard HTML input props, forwards refs correctly, and renders with consistent Tailwind CSS styling in both light and dark modes

#### Scenario: Card component composition
- **WHEN** a developer composes a Card with CardHeader, CardTitle, CardContent, and CardFooter
- **THEN** all sub-components render correctly with proper spacing, borders, and background colors in both light and dark modes

#### Scenario: Form component with React Hook Form integration
- **WHEN** a developer uses Form components with React Hook Form's `useForm` hook
- **THEN** form state is managed correctly, validation errors are displayed via FormMessage, and labels are correctly associated with form controls for accessibility

#### Scenario: Dialog component accessibility
- **WHEN** a user opens a Dialog component
- **THEN** the dialog is accessible via keyboard navigation, can be closed with the Escape key, and focus is properly managed (trapped within dialog, returned on close)

#### Scenario: Select and Checkbox form controls
- **WHEN** a developer uses Select or Checkbox components within a Form
- **THEN** the components integrate correctly with React Hook Form, update form state when values change, and support keyboard navigation for accessibility

