import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Coffee,
  ShoppingBag
} from "lucide-react";

const tripData = {
  name: "European Adventure",
  startDate: "Mar 15, 2026",
  endDate: "Mar 30, 2026",
  days: [
    {
      date: "Mar 15",
      dayNumber: 1,
      location: "Paris, France",
      activities: [
        { time: "08:00", title: "Flight from NYC to Paris", type: "transport", icon: Plane, duration: "8h", cost: 450 },
        { time: "17:00", title: "Check-in at Hotel Le Marais", type: "accommodation", icon: Hotel, duration: "30min", cost: 0 },
        { time: "19:00", title: "Dinner at Café de Flore", type: "food", icon: Utensils, duration: "2h", cost: 85 },
      ],
    },
    {
      date: "Mar 16",
      dayNumber: 2,
      location: "Paris, France",
      activities: [
        { time: "08:00", title: "Breakfast at hotel", type: "food", icon: Coffee, duration: "1h", cost: 25 },
        { time: "10:00", title: "Eiffel Tower Visit", type: "activity", icon: Camera, duration: "3h", cost: 35 },
        { time: "13:00", title: "Lunch at Champs-Élysées", type: "food", icon: Utensils, duration: "1.5h", cost: 45 },
        { time: "15:00", title: "Louvre Museum Tour", type: "activity", icon: Camera, duration: "4h", cost: 22 },
        { time: "20:00", title: "Seine River Cruise", type: "activity", icon: Camera, duration: "2h", cost: 75 },
      ],
    },
    {
      date: "Mar 17",
      dayNumber: 3,
      location: "Paris, France",
      activities: [
        { time: "09:00", title: "Breakfast at local patisserie", type: "food", icon: Coffee, duration: "1h", cost: 20 },
        { time: "11:00", title: "Montmartre & Sacré-Cœur", type: "activity", icon: Camera, duration: "3h", cost: 0 },
        { time: "14:00", title: "Lunch at Le Consulat", type: "food", icon: Utensils, duration: "1.5h", cost: 55 },
        { time: "16:00", title: "Shopping at Galeries Lafayette", type: "shopping", icon: ShoppingBag, duration: "3h", cost: 200 },
        { time: "20:00", title: "Dinner at Le Comptoir", type: "food", icon: Utensils, duration: "2h", cost: 90 },
      ],
    },
    {
      date: "Mar 18",
      dayNumber: 4,
      location: "Rome, Italy",
      activities: [
        { time: "07:00", title: "Train to Rome", type: "transport", icon: Plane, duration: "6h", cost: 120 },
        { time: "14:00", title: "Check-in at Hotel Roma", type: "accommodation", icon: Hotel, duration: "30min", cost: 0 },
        { time: "16:00", title: "Explore Trastevere", type: "activity", icon: Camera, duration: "3h", cost: 0 },
        { time: "20:00", title: "Dinner at local trattoria", type: "food", icon: Utensils, duration: "2h", cost: 60 },
      ],
    },
    {
      date: "Mar 19",
      dayNumber: 5,
      location: "Rome, Italy",
      activities: [
        { time: "08:00", title: "Colosseum & Roman Forum", type: "activity", icon: Camera, duration: "4h", cost: 28 },
        { time: "13:00", title: "Lunch near Piazza Navona", type: "food", icon: Utensils, duration: "1.5h", cost: 40 },
        { time: "15:00", title: "Vatican Museums & St. Peter's", type: "activity", icon: Camera, duration: "4h", cost: 35 },
        { time: "20:00", title: "Pizza at Campo de' Fiori", type: "food", icon: Utensils, duration: "1.5h", cost: 30 },
      ],
    },
  ],
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "transport": return "bg-primary/10 text-primary border-primary/20";
    case "accommodation": return "bg-accent/10 text-accent border-accent/20";
    case "food": return "bg-palm/10 text-palm border-palm/20";
    case "activity": return "bg-sky/10 text-sky border-sky/20";
    case "shopping": return "bg-coral/10 text-coral border-coral/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const TripTimeline = () => {
  const { id } = useParams();
  const [expandedDays, setExpandedDays] = useState<number[]>([1, 2]);

  const toggleDay = (dayNumber: number) => {
    setExpandedDays(prev => 
      prev.includes(dayNumber) 
        ? prev.filter(d => d !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  const expandAll = () => setExpandedDays(tripData.days.map(d => d.dayNumber));
  const collapseAll = () => setExpandedDays([]);

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
                Trip Timeline
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {tripData.startDate} - {tripData.endDate} · {tripData.days.length} days
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-palm" />

            <div className="space-y-6">
              {tripData.days.map((day, dayIndex) => {
                const isExpanded = expandedDays.includes(day.dayNumber);
                const isEven = dayIndex % 2 === 0;
                const dayTotal = day.activities.reduce((sum, a) => sum + a.cost, 0);

                return (
                  <div key={day.dayNumber} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg z-10" />

                    {/* Day Card */}
                    <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${isEven ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"}`}>
                      <div 
                        className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden"
                      >
                        {/* Day Header */}
                        <button
                          onClick={() => toggleDay(day.dayNumber)}
                          className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl gradient-ocean flex items-center justify-center">
                              <span className="text-primary-foreground font-bold">{day.dayNumber}</span>
                            </div>
                            <div className="text-left">
                              <p className="font-display text-lg font-semibold text-foreground">
                                Day {day.dayNumber}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{day.date}</span>
                                <span>·</span>
                                <MapPin className="w-3 h-3" />
                                <span>{day.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-sm text-muted-foreground">{day.activities.length} activities</p>
                              <p className="font-semibold text-foreground">${dayTotal}</p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Activities */}
                        {isExpanded && (
                          <div className="border-t border-border p-5 space-y-3">
                            {day.activities.map((activity, actIndex) => (
                              <div 
                                key={actIndex}
                                className={`flex items-start gap-4 p-4 rounded-xl border ${getTypeColor(activity.type)}`}
                              >
                                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                                  <activity.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-foreground">{activity.title}</p>
                                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {activity.time}
                                        </span>
                                        <span>·</span>
                                        <span>{activity.duration}</span>
                                      </div>
                                    </div>
                                    {activity.cost > 0 && (
                                      <span className="font-semibold text-foreground whitespace-nowrap">
                                        ${activity.cost}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-12 bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Trip Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Days</p>
                <p className="text-2xl font-bold text-foreground">{tripData.days.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold text-foreground">
                  {tripData.days.reduce((sum, d) => sum + d.activities.length, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cities Visited</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(tripData.days.map(d => d.location.split(",")[0])).size}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <p className="text-2xl font-bold text-primary">
                  ${tripData.days.reduce((sum, d) => sum + d.activities.reduce((s, a) => s + a.cost, 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripTimeline;
