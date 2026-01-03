import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ArrowLeft, Wallet, Plane, Hotel, Utensils, Ticket, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const budgetData = {
  totalBudget: 5200,
  spent: 3850,
  categories: [
    { name: "Transport", value: 1200, icon: Plane, color: "hsl(210, 80%, 35%)" },
    { name: "Accommodation", value: 1400, icon: Hotel, color: "hsl(24, 95%, 55%)" },
    { name: "Food", value: 750, icon: Utensils, color: "hsl(160, 45%, 40%)" },
    { name: "Activities", value: 500, icon: Ticket, color: "hsl(200, 85%, 60%)" },
  ],
  dailySpending: [
    { day: "Day 1", amount: 320, budget: 350, date: "Mar 15" },
    { day: "Day 2", amount: 480, budget: 350, alert: true, date: "Mar 16" },
    { day: "Day 3", amount: 220, budget: 350, date: "Mar 17" },
    { day: "Day 4", amount: 390, budget: 350, alert: true, date: "Mar 18" },
    { day: "Day 5", amount: 180, budget: 350, date: "Mar 19" },
    { day: "Day 6", amount: 420, budget: 350, alert: true, date: "Mar 20" },
    { day: "Day 7", amount: 290, budget: 350, date: "Mar 21" },
    { day: "Day 8", amount: 350, budget: 350, date: "Mar 22" },
  ],
};

const TripBudget = () => {
  const { id } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const remaining = budgetData.totalBudget - budgetData.spent;
  const percentUsed = (budgetData.spent / budgetData.totalBudget) * 100;
  const dailyAverage = budgetData.dailySpending.reduce((a, b) => a + b.amount, 0) / budgetData.dailySpending.length;
  const alertDays = budgetData.dailySpending.filter(d => d.alert).length;

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
                Trip Budget
              </h1>
              <p className="text-muted-foreground">
                European Adventure · Mar 15 - Mar 30, 2026
              </p>
            </div>
            <Button variant="ocean" className="gap-2">
              <Wallet className="w-4 h-4" />
              Add Expense
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Budget</span>
              </div>
              <p className="text-2xl font-bold text-foreground">${budgetData.totalBudget.toLocaleString()}</p>
            </div>
            
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">Spent</span>
              </div>
              <p className="text-2xl font-bold text-foreground">${budgetData.spent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">{percentUsed.toFixed(0)}% of budget</p>
            </div>
            
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-palm/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-palm" />
                </div>
                <span className="text-sm text-muted-foreground">Remaining</span>
              </div>
              <p className={`text-2xl font-bold ${remaining > 0 ? "text-palm" : "text-destructive"}`}>
                ${remaining.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <span className="text-sm text-muted-foreground">Over-budget Days</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{alertDays}</p>
              <p className="text-sm text-muted-foreground mt-1">out of {budgetData.dailySpending.length} days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                Spending by Category
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetData.categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      onClick={(data) => setSelectedCategory(data.name)}
                    >
                      {budgetData.categories.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke={selectedCategory === entry.name ? "hsl(220, 25%, 15%)" : "transparent"}
                          strokeWidth={2}
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 15%, 88%)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      formatter={(value) => <span className="text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                Category Breakdown
              </h2>
              <div className="space-y-4">
                {budgetData.categories.map((category) => {
                  const percentage = (category.value / budgetData.spent) * 100;
                  return (
                    <div 
                      key={category.name}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedCategory === category.name 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/30"
                      }`}
                      onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <category.icon className="w-5 h-5" style={{ color: category.color }} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{category.name}</p>
                            <p className="text-sm text-muted-foreground">{percentage.toFixed(0)}% of total</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-foreground">${category.value.toLocaleString()}</p>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: category.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Daily Spending Alerts */}
          <div className="mt-8 bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Daily Spending
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-palm" />
                  <span className="text-muted-foreground">Within budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">Over budget</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {budgetData.dailySpending.map((day, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border text-center transition-all hover:shadow-md ${
                    day.alert 
                      ? "border-destructive/30 bg-destructive/5" 
                      : "border-border hover:border-palm/30"
                  }`}
                >
                  <p className="text-xs text-muted-foreground mb-1">{day.date}</p>
                  <p className="font-semibold text-foreground text-sm mb-2">{day.day}</p>
                  <p className={`text-lg font-bold ${day.alert ? "text-destructive" : "text-palm"}`}>
                    ${day.amount}
                  </p>
                  {day.alert && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-destructive">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-xs">+${day.amount - day.budget}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-muted/50 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Budget Target</p>
                <p className="font-semibold text-foreground">$350 / day</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Average Daily Spending</p>
                <p className={`font-semibold ${dailyAverage > 350 ? "text-destructive" : "text-palm"}`}>
                  ${dailyAverage.toFixed(0)} / day
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

export default TripBudget;
