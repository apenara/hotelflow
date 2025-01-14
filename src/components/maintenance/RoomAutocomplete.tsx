// src/components/maintenance/RoomAutocomplete.tsx
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Room } from "@/lib/types";

interface RoomAutocompleteProps {
  rooms: Room[];
  value?: string;
  onChange: (value: string) => void;
}

const RoomAutocomplete = ({ rooms = [], value, onChange }: RoomAutocompleteProps) => {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filtrar habitaciones basado en el término de búsqueda
  const filteredRooms = React.useMemo(() => {
    return rooms.filter((room) => 
      room.number.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.floor.toString().includes(searchTerm)
    );
  }, [rooms, searchTerm]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && rooms.length > 0
            ? `Habitación ${rooms.find((room) => room.id === value)?.number || ''}`
            : "Seleccionar habitación..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar habitación..." 
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>No se encontraron habitaciones.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {filteredRooms.map((room) => (
              <CommandItem
                key={room.id}
                value={room.id}
                onSelect={() => {
                  onChange(room.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === room.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <span>Habitación {room.number}</span>
                <span className="ml-2 text-gray-500">- Piso {room.floor}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default RoomAutocomplete;