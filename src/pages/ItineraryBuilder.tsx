import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  GripVertical,
  MapPin,
  Calendar,
  Trash2,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Activity {
  id: string;
  title: string;
  time: string;
  cost: number;
}

interface Stop {
  id: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  activities: Activity[];
}

const initialStops: Stop[] = [
  {
    id: "stop-1",
    city: "Paris",
    country: "France",
    startDate: "2026-03-15",
    endDate: "2026-03-18",
    activities: [
      { id: "act-1", title: "Eiffel Tower Visit", time: "10:00", cost: 35 },
      { id: "act-2", title: "Louvre Museum", time: "14:00", cost: 22 },
      { id: "act-3", title: "Seine River Cruise", time: "19:00", cost: 75 },
    ],
  },
  {
    id: "stop-2",
    city: "Rome",
    country: "Italy",
    startDate: "2026-03-18",
    endDate: "2026-03-22",
    activities: [
      { id: "act-4", title: "Colosseum Tour", time: "09:00", cost: 28 },
      { id: "act-5", title: "Vatican Museums", time: "14:00", cost: 35 },
    ],
  },
  {
    id: "stop-3",
    city: "Barcelona",
    country: "Spain",
    startDate: "2026-03-22",
    endDate: "2026-03-26",
    activities: [
      { id: "act-6", title: "Sagrada Familia", time: "10:00", cost: 26 },
      { id: "act-7", title: "Park Güell", time: "15:00", cost: 10 },
    ],
  },
];

function SortableStop({ 
  stop, 
  expanded,
  onToggle,
  onDelete,
  onAddActivity,
  onDeleteActivity,
}: { 
  stop: Stop; 
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAddActivity: (activity: Omit<Activity, "id">) => void;
  onDeleteActivity: (activityId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [activityForm, setActivityForm] = useState({ title: "", time: "", cost: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddActivity = () => {
    if (activityForm.title && activityForm.time) {
      onAddActivity({
        title: activityForm.title,
        time: activityForm.time,
        cost: Number(activityForm.cost) || 0,
      });
      setActivityForm({ title: "", time: "", cost: "" });
      setDialogOpen(false);
    }
  };

  const totalCost = stop.activities.reduce((sum, a) => sum + a.cost, 0);
  const dayCount = Math.ceil(
    (new Date(stop.endDate).getTime() - new Date(stop.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      {/* Stop Header */}
      <div className="p-4 flex items-center gap-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {stop.city}, {stop.country}
              </h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {stop.startDate} → {stop.endDate}
                </span>
                <span>·</span>
                <span>{dayCount} days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right mr-2 hidden sm:block">
            <p className="text-sm text-muted-foreground">{stop.activities.length} activities</p>
            <p className="font-semibold text-foreground">${totalCost}</p>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Activities */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          {stop.activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
              <span className="font-semibold text-foreground">${activity.cost}</span>
              <button
                onClick={() => onDeleteActivity(activity.id)}
                className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2 border-dashed">
                <Plus className="w-4 h-4" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Activity to {stop.city}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Activity Name</Label>
                  <Input
                    placeholder="e.g., Visit the Eiffel Tower"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={activityForm.time}
                      onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={activityForm.cost}
                      onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
                    />
                  </div>
                </div>
                <Button variant="ocean" onClick={handleAddActivity} className="w-full">
                  Add Activity
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

const ItineraryBuilder = () => {
  const { id } = useParams();
  const [stops, setStops] = useState<Stop[]>(initialStops);
  const [expandedStops, setExpandedStops] = useState<string[]>(["stop-1"]);
  const [showAddStop, setShowAddStop] = useState(false);
  const [newStop, setNewStop] = useState({
    city: "",
    country: "",
    startDate: "",
    endDate: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setStops((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleStop = (stopId: string) => {
    setExpandedStops((prev) =>
      prev.includes(stopId) ? prev.filter((id) => id !== stopId) : [...prev, stopId]
    );
  };

  const deleteStop = (stopId: string) => {
    setStops((prev) => prev.filter((s) => s.id !== stopId));
  };

  const addActivity = (stopId: string, activity: Omit<Activity, "id">) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              activities: [
                ...stop.activities,
                { ...activity, id: `act-${Date.now()}` },
              ],
            }
          : stop
      )
    );
  };

  const deleteActivity = (stopId: string, activityId: string) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              activities: stop.activities.filter((a) => a.id !== activityId),
            }
          : stop
      )
    );
  };

  const handleAddStop = () => {
    if (newStop.city && newStop.country && newStop.startDate && newStop.endDate) {
      const newId = `stop-${Date.now()}`;
      setStops((prev) => [
        ...prev,
        {
          id: newId,
          city: newStop.city,
          country: newStop.country,
          startDate: newStop.startDate,
          endDate: newStop.endDate,
          activities: [],
        },
      ]);
      setExpandedStops((prev) => [...prev, newId]);
      setNewStop({ city: "", country: "", startDate: "", endDate: "" });
      setShowAddStop(false);
    }
  };

  const totalCost = stops.reduce(
    (sum, stop) => sum + stop.activities.reduce((s, a) => s + a.cost, 0),
    0
  );
  const totalActivities = stops.reduce((sum, stop) => sum + stop.activities.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            to={`/trips/${id}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trip
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Itinerary Builder
              </h1>
              <p className="text-muted-foreground">
                European Adventure · Drag to reorder stops
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAddStop(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Stop
              </Button>
              <Button variant="ocean">Save Itinerary</Button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <MapPin className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{stops.length}</p>
              <p className="text-sm text-muted-foreground">Stops</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-foreground">{totalActivities}</p>
              <p className="text-sm text-muted-foreground">Activities</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <Calendar className="w-5 h-5 mx-auto mb-2 text-palm" />
              <p className="text-2xl font-bold text-foreground">
                {stops.reduce((sum, s) => {
                  const days = Math.ceil(
                    (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return sum + days;
                }, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Days</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <DollarSign className="w-5 h-5 mx-auto mb-2 text-sky" />
              <p className="text-2xl font-bold text-foreground">${totalCost}</p>
              <p className="text-sm text-muted-foreground">Est. Cost</p>
            </div>
          </div>

          {/* Add Stop Form */}
          {showAddStop && (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Add New Stop
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="e.g., Paris"
                    value={newStop.city}
                    onChange={(e) => setNewStop({ ...newStop, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    placeholder="e.g., France"
                    value={newStop.country}
                    onChange={(e) => setNewStop({ ...newStop, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newStop.startDate}
                    onChange={(e) => setNewStop({ ...newStop, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={newStop.endDate}
                    onChange={(e) => setNewStop({ ...newStop, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowAddStop(false)}>
                  Cancel
                </Button>
                <Button variant="ocean" onClick={handleAddStop}>
                  Add Stop
                </Button>
              </div>
            </div>
          )}

          {/* Sortable Stops */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {stops.map((stop) => (
                  <SortableStop
                    key={stop.id}
                    stop={stop}
                    expanded={expandedStops.includes(stop.id)}
                    onToggle={() => toggleStop(stop.id)}
                    onDelete={() => deleteStop(stop.id)}
                    onAddActivity={(activity) => addActivity(stop.id, activity)}
                    onDeleteActivity={(activityId) => deleteActivity(stop.id, activityId)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {stops.length === 0 && (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No stops added yet</p>
              <Button variant="ocean" onClick={() => setShowAddStop(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Stop
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ItineraryBuilder;
