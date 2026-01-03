import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  Bus,
  Utensils,
  Bed,
  AlertTriangle,
  Star,
  Sun
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// --- Types ---
interface Activity {
  id: string;
  title: string;
  time: string;
  cost: number;
  lat: number;
  lng: number;
}

interface Stop {
  id: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  best_time_to_visit?: string;
  activities: Activity[];
}

interface UserPreference {
  dietary: "Veg" | "Non-Veg" | "Vegan";
  budget_limit: number;
}

// --- Mock Data ---
const initialStops: Stop[] = [
  {
    id: "stop-1",
    city: "Paris",
    country: "France",
    startDate: "2026-03-15",
    endDate: "2026-03-18",
    best_time_to_visit: "Apr-June",
    activities: [
      { id: "act-1", title: "Eiffel Tower Visit", time: "10:00", cost: 35, lat: 48.8584, lng: 2.2945 },
      { id: "act-2", title: "Louvre Museum", time: "14:00", cost: 22, lat: 48.8606, lng: 2.3376 },
    ],
  },
  {
    id: "stop-2",
    city: "Rome",
    country: "Italy",
    startDate: "2026-03-18",
    endDate: "2026-03-22",
    activities: [
      { id: "act-3", title: "Colosseum", time: "09:00", cost: 30, lat: 41.8902, lng: 12.4922 },
    ]
  }
];

const USER_PREFS: UserPreference = {
  dietary: "Veg",
  budget_limit: 2000
};

// --- Helper Components ---

function TransportBlock({ from, to }: { from?: Activity | string, to: Activity | string }) {
  // Mock calculation logic
  // In real app, consider dist(from.lat, to.lat)
  const cost = 5;
  const time = "20m";
  const mode = "Transit";

  if (!from) return null;

  return (
    <div className="flex flex-col items-center py-2 relative">
      <div className="absolute left-[28px] top-0 bottom-0 w-0.5 bg-border -z-10 border-l border-dashed border-muted-foreground/50"></div>
      <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full flex items-center gap-2 border border-border">
        <Bus className="w-3 h-3" />
        <span>{mode} • {time} • ₹{cost}</span>
      </div>
    </div>
  );
}

interface SortableStopProps {
  stop: Stop;
  expanded: boolean;
  onToggle: () => void;
  onAddActivity: (activity: Omit<Activity, "id">) => void;
  onDeleteActivity: (id: string) => void;
}

function SortableStop({
  stop,
  expanded,
  onToggle,
  onAddActivity,
  onDeleteActivity,
}: SortableStopProps) {
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
        lat: 0, lng: 0
      });
      setActivityForm({ title: "", time: "", cost: "" });
      setDialogOpen(false);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card rounded-2xl border border-border shadow-sm mb-4">
      <div className="p-4 flex items-center gap-4 bg-card/50">
        <button {...attributes} {...listeners} className="cursor-grab p-2 hover:bg-muted rounded text-muted-foreground"><GripVertical className="w-5 h-5" /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{stop.city}</h3>
            {stop.best_time_to_visit && (
              <span className="text-[10px] items-center gap-1 flex bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                <Sun className="w-3 h-3" />
                Best: {stop.best_time_to_visit}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{stop.startDate} - {stop.endDate}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle}>{expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</Button>
      </div>

      {expanded && (
        <div className="p-4 border-t border-border bg-muted/10">
          {/* Timeline */}
          <div className="space-y-0 pl-2">
            {stop.activities.map((act: Activity, idx: number) => (
              <div key={act.id}>
                {/* Render Transport from previous activity within this stop */}
                {idx > 0 && (
                  <TransportBlock from={stop.activities[idx - 1]} to={act} />
                )}
                {/* Activity Card */}
                <div className="flex items-start gap-3 relative z-10 group">
                  <div className="w-14 items-end flex flex-col text-xs text-muted-foreground pt-3 mr-2">
                    <span>{act.time}</span>
                  </div>
                  <div className="mt-2 w-3 h-3 rounded-full bg-primary border-2 border-background ring-2 ring-primary/20"></div>

                  <div className="flex-1 bg-background border border-border p-3 rounded-xl hover:border-primary/50 transition-colors mb-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">{act.title}</span>
                      <span className="text-xs font-mono">₹{act.cost}</span>
                    </div>
                    {/* Mock Peak Hour Warning if time is between 5PM - 7PM (17:00 - 19:00) */}
                    {(parseInt(act.time.split(':')[0]) >= 17 && parseInt(act.time.split(':')[0]) <= 19) && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
                        <AlertTriangle className="w-3 h-3" />
                        Peak Hour Warning
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDeleteActivity(act.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="ml-20 mt-4">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full border-dashed"><Plus className="w-3 h-3 mr-2" /> Add Activity</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Activity</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input placeholder="Title" value={activityForm.title} onChange={e => setActivityForm({ ...activityForm, title: e.target.value })} />
                    <div className="flex gap-2">
                      <Input type="time" value={activityForm.time} onChange={e => setActivityForm({ ...activityForm, time: e.target.value })} />
                      <Input type="number" placeholder="Cost" value={activityForm.cost} onChange={e => setActivityForm({ ...activityForm, cost: e.target.value })} />
                    </div>
                    <Button onClick={handleAddActivity}>Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}

// --- Main Component ---

const ItineraryBuilder = () => {
  const { id } = useParams();
  const [stops, setStops] = useState<Stop[]>(initialStops);
  const [expandedStops, setExpandedStops] = useState<string[]>(["stop-1"]);

  // Budget Calculations
  const activitiesCost = stops.reduce((sum, stop) => sum + stop.activities.reduce((s, a) => s + a.cost, 0), 0);
  // Mock transport cost (5 per connection)
  const transportCost = stops.reduce((sum, stop) => sum + Math.max(0, stop.activities.length - 1) * 5, 0);
  const stayCost = stops.length * 150; // Mock stay cost
  const totalCost = activitiesCost + transportCost + stayCost;
  const isOverBudget = totalCost > USER_PREFS.budget_limit;

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  const toggleStop = (id: string) => {
    setExpandedStops(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addActivity = (stopId: string, activity: Omit<Activity, "id">) => {
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, activities: [...s.activities, { ...activity, id: `act-${Date.now()}` }] } : s));
  };

  const deleteActivity = (stopId: string, actId: string) => {
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, activities: s.activities.filter(a => a.id !== actId) } : s));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Main Canvas - Itinerary */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <Link to={`/trips/${id}`} className="flex items-center gap-2 text-sm text-muted-foreground mb-4 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to Trip Overview</Link>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Smart Itinerary</h1>
            <p className="text-muted-foreground">Drag to reorder. Transport is calculated automatically.</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {stops.map(stop => (
                <SortableStop
                  key={stop.id}
                  stop={stop}
                  expanded={expandedStops.includes(stop.id)}
                  onToggle={() => toggleStop(stop.id)}
                  onAddActivity={(a: Omit<Activity, "id">) => addActivity(stop.id, a)}
                  onDeleteActivity={(bid: string) => deleteActivity(stop.id, bid)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <div className="py-8 text-center border-2 border-dashed border-border rounded-xl mt-8 cursor-pointer hover:bg-muted/50 transition">
            <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Add another City Stop</p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Budget & Intelligence */}
      <div className="w-96 border-l border-border bg-card p-6 overflow-y-auto shadow-xl">
        <div className="mb-8">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            Budget Meter
          </h3>

          <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Total Budget</span>
              <span className="font-mono">₹{USER_PREFS.budget_limit}</span>
            </div>
            <div className="flex justify-between mb-4 text-2xl font-bold">
              <span className={isOverBudget ? "text-destructive" : "text-primary"}>
                ₹{totalCost}
              </span>
              {isOverBudget && <AlertTriangle className="w-6 h-6 text-destructive animate-pulse" />}
            </div>

            <Progress value={(totalCost / USER_PREFS.budget_limit) * 100} className={`h-2 mb-4 ${isOverBudget ? "bg-destructive/20" : ""}`} />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Stay</span>
                <span>₹{stayCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2"><Bus className="w-3 h-3" /> Transport</span>
                <span>₹{transportCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> Activities</span>
                <span>₹{activitiesCost}</span>
              </div>
            </div>

            {isOverBudget && (
              <div className="mt-4 p-2 bg-destructive/10 text-destructive text-xs rounded border border-destructive/20">
                You are ₹{totalCost - USER_PREFS.budget_limit} over budget! Consider removing some paid activities.
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            Smart Suggestions
          </h3>

          <div className="space-y-4">
            {/* Accommodation Suggestion */}
            <Card>
              <CardHeader className="p-3 pb-0"><CardTitle className="text-sm">Budget Stay in Paris</CardTitle></CardHeader>
              <CardContent className="p-3">
                <div className="flex gap-2">
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center shrink-0">
                    <Bed className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Near Gare du Nord</p>
                    <div className="font-bold text-primary">₹85/night</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-2 text-xs">View Deal</Button>
              </CardContent>
            </Card>

            {/* Dining Suggestion */}
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm flex justify-between">
                  Dinner Suggestion
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{USER_PREFS.dietary}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex gap-2">
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center shrink-0">
                    <Utensils className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Le Potager</p>
                    <p className="text-xs text-muted-foreground mb-1">Vegetarian • 0.5km away</p>
                    <div className="text-xs font-bold">₹25-40</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryBuilder;
