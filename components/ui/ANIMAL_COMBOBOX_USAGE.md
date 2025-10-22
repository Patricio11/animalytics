# AnimalCombobox - Reusable Component

## Overview
A searchable dropdown component for selecting animals with photos, breed info, and sex display.

## Features
- ✅ **Searchable** - Type to filter animals by name
- ✅ **Photo Display** - Shows animal profile photo with fallback initials
- ✅ **Rich Information** - Displays name, breed, and sex
- ✅ **Responsive** - Works on all screen sizes
- ✅ **Accessible** - Keyboard navigation support
- ✅ **Optional Clear** - Can allow clearing selection
- ✅ **Empty State** - Customizable empty message

## Usage

### Basic Example
```tsx
import { AnimalCombobox } from "@/components/ui/animal-combobox";
import { useAnimals } from "@/lib/api/queries/animals";

function MyComponent() {
  const { data: animalsData } = useAnimals();
  const [selectedAnimalId, setSelectedAnimalId] = useState("");

  const animals = animalsData?.animals.map(animal => ({
    id: animal.id,
    name: animal.name,
    breed: animal.breed?.name,
    profileImageUrl: animal.profileImageUrl,
    sex: animal.sex,
  })) || [];

  return (
    <AnimalCombobox
      animals={animals}
      value={selectedAnimalId}
      onValueChange={setSelectedAnimalId}
      placeholder="Select animal..."
    />
  );
}
```

### With Form Validation
```tsx
<div className="space-y-2">
  <Label htmlFor="animal">
    Animal <span className="text-destructive">*</span>
  </Label>
  <AnimalCombobox
    animals={animals}
    value={animalId}
    onValueChange={setAnimalId}
    placeholder="Select animal..."
    emptyText="No animals found. Add an animal first."
  />
  {errors.animalId && (
    <p className="text-sm text-destructive">{errors.animalId}</p>
  )}
</div>
```

### With Clear Option
```tsx
<AnimalCombobox
  animals={animals}
  value={animalId}
  onValueChange={setAnimalId}
  placeholder="Select animal (optional)..."
  allowClear={true}
/>
```

### Disabled State
```tsx
<AnimalCombobox
  animals={animals}
  value={animalId}
  onValueChange={setAnimalId}
  disabled={isLoading}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animals` | `AnimalOption[]` | **required** | Array of animals to display |
| `value` | `string` | `undefined` | Selected animal ID |
| `onValueChange` | `(value: string) => void` | **required** | Callback when selection changes |
| `placeholder` | `string` | `"Select animal..."` | Placeholder text |
| `emptyText` | `string` | `"No animals found."` | Text when no animals available |
| `disabled` | `boolean` | `false` | Disable the combobox |
| `className` | `string` | `undefined` | Additional CSS classes |
| `allowClear` | `boolean` | `false` | Allow clearing selection by clicking selected item |

## AnimalOption Interface
```typescript
interface AnimalOption {
  id: string;              // Required - Animal ID
  name: string;            // Required - Animal name
  breed?: string;          // Optional - Breed name
  profileImageUrl?: string | null; // Optional - Photo URL
  sex?: string;            // Optional - 'male' or 'female'
}
```

## Where to Use

### ✅ Already Implemented
- **TaskDialog** - Task creation/editing

### 🎯 Recommended Usage
- **Mating Calculator** - Select bitch and sire
- **Litter Creation** - Select parents
- **Health Records** - Select animal
- **Feeding Plans** - Select animal
- **Semen Collection** - Select source animal
- **Season Tracking** - Select bitch
- **Any form requiring animal selection**

## Styling
The component uses Tailwind CSS and shadcn/ui components. It automatically adapts to your theme (light/dark mode).

## Accessibility
- Keyboard navigation (Arrow keys, Enter, Escape)
- Screen reader support
- ARIA labels and roles
- Focus management

## Performance
- Memoized selected animal lookup
- Efficient re-renders
- Lazy loading support (pass filtered animals)

## Example: Replace Old Select
### Before (Old Way)
```tsx
<Select value={animalId} onValueChange={setAnimalId}>
  <SelectTrigger>
    <SelectValue placeholder="Select animal..." />
  </SelectTrigger>
  <SelectContent>
    {animals.map((animal) => (
      <SelectItem key={animal.id} value={animal.id}>
        {animal.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### After (New Way)
```tsx
<AnimalCombobox
  animals={animals}
  value={animalId}
  onValueChange={setAnimalId}
  placeholder="Select animal..."
/>
```

## Benefits Over Regular Select
1. **Search** - Quickly find animals in large lists
2. **Visual** - See animal photos at a glance
3. **Context** - Breed and sex info helps identify animals
4. **UX** - Better user experience with rich display
5. **Consistency** - Same component everywhere
6. **Maintainability** - Update once, applies everywhere
