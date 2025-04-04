"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  AlertCircle,
  TrendingUp,
  Truck,
  RefreshCw,
  LogOut,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SavedRoutes } from "@/components/saved-routes";

// Types
interface Shipment {
  id: string;
  origin: string;
  destination: string;
  cargo_weight: number;
  cargo_volume: number;
  priority: string;
  createdAt: string;
  status: string;
  userId: string;
}

interface Disaster {
  type?: string;
  location?: string;
  severity?: number;
  date?: string;
  impact?: string;
}

interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
  change: number;
}

interface WeatherForecast {
  day: string;
  condition: string;
  temperature: number;
  precipitation: number;
}

interface RouteOption {
  id: string;
  routeType: string;
  carrier: string;
  transitTime: number;
  cost: number;
  borderCrossings: number;
  co2Emissions: number;
  reliability: number;
  score: number;
}

interface CurrencyResponse {
  provider: string;
  terms: string;
  base: string;
  date: string;
  time_last_updated: number;
  rates: Record<string, number>;
}

interface WeatherItem {
  dt_txt: string;
  weather: Array<{ main: string }>;
  main: { temp: number };
  pop: number;
}

// Custom Hooks
const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await fetch("/api/shipments");
        if (!response.ok) throw new Error("Failed to fetch shipments");
        const data = await response.json();
        setShipments(data);
      } catch (err) {
        setError("Failed to load shipments");
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  return { shipments, loading, error };
};

const useDisasters = () => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/gdacs");
        if (!response.ok) throw new Error("Failed to fetch disasters");
        const data = await response.json();

        // Map the API response to the Disaster interface
        const mappedDisasters = data.events.features.map((feature: any) => ({
          type: feature.properties.eventtype || "Unknown",
          location: feature.properties.country || "Unknown",
          severity: feature.properties.severitydata?.severity || 1,
          date: feature.properties.fromdate || new Date().toISOString(),
          impact: feature.properties.name || "Unknown",
        }));

        setDisasters(mappedDisasters);
      } catch (err) {
        setError("Failed to load disasters");
      } finally {
        setLoading(false);
      }
    };
    fetchDisasters();
  }, []);

  return { disasters, loading, error };
};

const useCurrencies = () => {
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/INR"
        );
        if (!response.ok) throw new Error("Failed to fetch currencies");
        const data: CurrencyResponse = await response.json();

        const majorCurrencies = [
          "USD",
          "EUR",
          "GBP",
          "JPY",
          "CNY",
          "CAD",
          "AUD",
          "CHF",
          "HKD",
          "SGD",
          "INR",
        ];
        setCurrencies(
          Object.entries(data.rates)
            .filter(([code]) => majorCurrencies.includes(code))
            .map(([code, rate]) => ({
              code,
              name: getCurrencyName(code),
              rate,
              change: Math.random() * 2 - 1, // Mock change for demo
            }))
        );
      } catch (err) {
        setError("Failed to load currencies");
      } finally {
        setLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  return { currencies, loading, error };
};

const useWeather = () => {
  const [weather, setWeather] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherApiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!weatherApiKey) throw new Error("Weather API key is missing");

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=London&appid=${weatherApiKey}`
        );
        if (!response.ok) throw new Error("Failed to fetch weather");
        const data = await response.json();

        const dailyForecasts = data.list
          .filter((_: WeatherItem, index: number) => index % 8 === 0) // Get one forecast per day
          .map((item: WeatherItem) => ({
            day: new Date(item.dt_txt).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            condition: item.weather[0].main,
            temperature: kelvinToCelsius(item.main.temp),
            precipitation: Math.round(item.pop * 100),
          }));

        setWeather(dailyForecasts);
      } catch (err) {
        setError("Failed to load weather");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  return { weather, loading, error };
};

// Helper functions
const kelvinToCelsius = (kelvin: number) => {
  return Math.round((kelvin - 273.15) * 10) / 10;
};

const getCurrencyName = (code: string) => {
  const currencyNames: Record<string, string> = {
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    JPY: "Japanese Yen",
    CNY: "Chinese Yuan",
    CAD: "Canadian Dollar",
    AUD: "Australian Dollar",
    CHF: "Swiss Franc",
    HKD: "Hong Kong Dollar",
    SGD: "Singapore Dollar",
    INR: "Indian Rupee",
  };
  return currencyNames[code] || code;
};

// Mock data for charts and displays
const weeklyShipmentData = [
  { name: "Mon", shipments: 12 },
  { name: "Tue", shipments: 19 },
  { name: "Wed", shipments: 15 },
  { name: "Thu", shipments: 21 },
  { name: "Fri", shipments: 18 },
  { name: "Sat", shipments: 6 },
  { name: "Sun", shipments: 3 },
];

const priorityData = [
  { name: "FASTEST", value: 35 },
  { name: "CHEAPEST", value: 45 },
  { name: "SAFEST", value: 20 },
];

const transportModeData = [
  { name: "Air", value: 30 },
  { name: "Sea", value: 40 },
  { name: "Land", value: 30 },
];

const currencyData = [
  { name: "USD", rate: 1.00, change: 0 },
  { name: "EUR", rate: 0.92, change: -0.3 },
  { name: "GBP", rate: 0.79, change: 0.2 },
  { name: "JPY", rate: 151.67, change: 0.5 },
  { name: "CAD", rate: 1.35, change: -0.1 },
  { name: "AUD", rate: 1.49, change: 0.3 },
  { name: "CNY", rate: 7.23, change: -0.4 },
  { name: "INR", rate: 83.42, change: 0.6 },
];

const weatherData = [
  { day: "Mon", condition: "Sunny", temperature: 28, precipitation: 0 },
  { day: "Tue", condition: "Cloudy", temperature: 24, precipitation: 20 },
  { day: "Wed", condition: "Rain", temperature: 22, precipitation: 80 },
  { day: "Thu", condition: "Cloudy", temperature: 23, precipitation: 30 },
  { day: "Fri", condition: "Sunny", temperature: 26, precipitation: 10 },
];

const recentShipments = [
  { id: "SHP-2304", origin: "New York", destination: "Los Angeles", status: "IN_TRANSIT", date: "2025-04-01" },
  { id: "SHP-2303", origin: "Shanghai", destination: "Rotterdam", status: "DELIVERED", date: "2025-03-28" },
  { id: "SHP-2302", origin: "Mumbai", destination: "Durban", status: "PENDING", date: "2025-04-05" },
  { id: "SHP-2301", origin: "London", destination: "Singapore", status: "IN_TRANSIT", date: "2025-03-30" },
];

const riskAlerts = [
  { type: "CONFLICT", location: "Eastern Europe", severity: 0.8, description: "Ongoing conflict affecting shipping routes" },
  { type: "DISASTER", location: "Southeast Asia", severity: 0.6, description: "Typhoon warning for coastal areas" },
  { type: "SANCTION", location: "Middle East", severity: 0.7, description: "New trade sanctions implemented" }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// Dashboard Component
const Dashboard = () => {
  const {
    shipments,
    loading: shipmentsLoading,
    error: shipmentsError,
  } = useShipments();
  const {
    disasters,
    loading: disastersLoading,
    error: disastersError,
  } = useDisasters();
  const {
    currencies,
    loading: currenciesLoading,
    error: currenciesError,
  } = useCurrencies();
  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather();

  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { signOut } = useClerk();

  // Fetch route options when a shipment is selected
  useEffect(() => {
    if (selectedShipment) {
      const fetchRouteOptions = async () => {
        try {
          const response = await fetch(
            `/api/route-options?shipmentId=${selectedShipment}`
          );
          if (!response.ok) throw new Error("Failed to fetch route options");
          const data = await response.json();
          setRouteOptions(data);
        } catch (error) {
          console.error("Error fetching route options:", error);
          setRouteOptions([]);
        }
      };
      fetchRouteOptions();
    } else {
      setRouteOptions([]);
    }
  }, [selectedShipment]);

  // Derive cost by priority data
  const getCostByPriorityData = () => {
    const priorityCosts: Record<string, number> = {};

    shipments.forEach((shipment) => {
      const key = shipment.priority;
      if (priorityCosts[key]) {
        priorityCosts[key] += shipment.cargo_weight; // Use cargo_weight as a placeholder for cost
      } else {
        priorityCosts[key] = shipment.cargo_weight;
      }
    });

    return Object.entries(priorityCosts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = () => {
    signOut(() => {
      router.push('/');
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-900/30 text-amber-300 border-amber-500/40">Pending</Badge>;
      case "IN_TRANSIT":
        return <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-500/40">In Transit</Badge>;
      case "DELIVERED":
        return <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-500/40">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAlertSeverity = (severity) => {
    if (severity >= 0.7) return "high";
    if (severity >= 0.4) return "medium";
    return "low";
  }

  if (
    shipmentsLoading ||
    disastersLoading ||
    currenciesLoading ||
    weatherLoading
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-sky-400">GlobalRoute Navigator Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-sky-500 text-sky-400"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="routes">My Routes</TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Active Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="bg-blue-900/30 p-3 rounded-lg mr-4">
                      <Truck className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">14</p>
                      <p className="text-xs text-sky-400 flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        +2.5% from last week
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Delivered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="bg-green-900/30 p-3 rounded-lg mr-4">
                      <CheckCircle2 className="h-8 w-8 text-green-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">28</p>
                      <p className="text-xs text-green-400 flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        +4.8% from last week
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Avg. Delivery Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="bg-amber-900/30 p-3 rounded-lg mr-4">
                      <Clock className="h-8 w-8 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">3.2<span className="text-lg font-normal"> days</span></p>
                      <p className="text-xs text-red-400 flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        +0.5 days from avg.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Active Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="bg-indigo-900/30 p-3 rounded-lg mr-4">
                      <MapPin className="h-8 w-8 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">7</p>
                      <p className="text-xs text-indigo-400 flex items-center">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        -1 from last week
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sky-400">Weekly Shipments</CardTitle>
                  <CardDescription className="text-slate-400">
                    Number of shipments processed by day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyShipmentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                          cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                        />
                        <Bar dataKey="shipments" fill="#38bdf8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sky-400">Distribution by Priority</CardTitle>
                  <CardDescription className="text-slate-400">
                    Shipment priorities breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Shipments & Weather */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sky-400">Recent Shipments</CardTitle>
                  <CardDescription className="text-slate-400">
                    Latest shipping activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentShipments.map((shipment) => (
                      <div key={shipment.id} 
                        className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <div>
                          <p className="font-medium text-white mb-1">{shipment.id}</p>
                          <p className="text-xs text-slate-400">
                            {shipment.origin} → {shipment.destination}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          {getStatusBadge(shipment.status)}
                          <p className="text-xs text-slate-400 mt-1">{shipment.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sky-400">Weather Forecast</CardTitle>
                  <CardDescription className="text-slate-400">
                    5-day forecast for major shipping routes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {weatherData.map((item) => (
                      <div key={item.day} className="text-center">
                        <p className="font-medium text-white">{item.day}</p>
                        <div className="my-2 w-full aspect-square bg-slate-700/50 rounded-lg flex items-center justify-center">
                          <p className="text-2xl">
                            {item.condition === "Sunny" ? "☀️" : 
                             item.condition === "Cloudy" ? "☁️" : 
                             item.condition === "Rain" ? "🌧️" : "❓"}
                          </p>
                        </div>
                        <p className="text-sm text-white">{item.temperature}°C</p>
                        <p className="text-xs text-slate-400">{item.precipitation}%</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weatherData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="#38bdf8" 
                          fill="rgba(56, 189, 248, 0.2)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add SavedRoutes component */}
            <SavedRoutes />
            
            {/* Risk Alerts */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sky-400">Risk Alerts</CardTitle>
                <CardDescription className="text-slate-400">
                  Active risk factors affecting shipping routes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskAlerts.map((alert, index) => {
                  const severity = getAlertSeverity(alert.severity);
                  return (
                    <Alert key={index} className={`border-0 ${
                      severity === 'high' ? 'bg-red-900/20 text-red-300' : 
                      severity === 'medium' ? 'bg-amber-900/20 text-amber-300' : 
                      'bg-blue-900/20 text-blue-300'
                    }`}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        {alert.type} 
                        <Badge 
                          variant="outline" 
                          className={`${
                            severity === 'high' ? 'border-red-500/40 bg-red-950/40' : 
                            severity === 'medium' ? 'border-amber-500/40 bg-amber-950/40' : 
                            'border-blue-500/40 bg-blue-950/40'
                          }`}
                        >
                          {severity.toUpperCase()}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <p>{alert.location} - {alert.description}</p>
                      </AlertDescription>
                    </Alert>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes" className="space-y-8">
            {/* Routes Tab - Shows saved routes as a main feature */}
            <div className="grid grid-cols-1 gap-6">
              <SavedRoutes />
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sky-400">Transport Mode Distribution</CardTitle>
                  <CardDescription className="text-slate-400">
                    Breakdown of transport modes across active routes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={transportModeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {transportModeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={
                              index === 0 ? "#3b82f6" : // Air - blue
                              index === 1 ? "#14b8a6" : // Sea - teal
                              "#f59e0b"                 // Land - amber
                            } />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shipments" className="space-y-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sky-400">Recent Shipments</CardTitle>
                <CardDescription className="text-slate-400">
                  Detailed view of recent and upcoming shipments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-400">ID</TableHead>
                      <TableHead className="text-slate-400">Origin</TableHead>
                      <TableHead className="text-slate-400">Destination</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentShipments.concat(recentShipments).map((shipment, index) => (
                      <TableRow key={index} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell className="font-medium text-white">{shipment.id}</TableCell>
                        <TableCell>{shipment.origin}</TableCell>
                        <TableCell>{shipment.destination}</TableCell>
                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                        <TableCell>{shipment.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sky-400">Exchange Rates</CardTitle>
                  <CardDescription className="text-slate-400">
                    Current currency exchange rates relevant for shipping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {currencyData.map((currency) => (
                      <div key={currency.name} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex justify-between mb-1">
                          <p className="font-medium text-white">{currency.name}</p>
                          <Badge 
                            variant="outline" 
                            className={`${
                              currency.change > 0 ? 'bg-green-900/20 text-green-300 border-green-500/40' : 
                              currency.change < 0 ? 'bg-red-900/20 text-red-300 border-red-500/40' : 
                              'bg-slate-800 text-slate-300 border-slate-600'
                            }`}
                          >
                            {currency.change > 0 ? '+' : ''}{currency.change.toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold">{currency.rate.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { name: 'Jan', USD: 1.05, EUR: 0.95, GBP: 0.82, JPY: 152.1 },
                          { name: 'Feb', USD: 1.04, EUR: 0.94, GBP: 0.81, JPY: 151.8 },
                          { name: 'Mar', USD: 1.02, EUR: 0.93, GBP: 0.80, JPY: 151.5 },
                          { name: 'Apr', USD: 1.00, EUR: 0.92, GBP: 0.79, JPY: 151.7 },
                          { name: 'May', USD: 0.99, EUR: 0.91, GBP: 0.78, JPY: 151.4 },
                          { name: 'Jun', USD: 0.98, EUR: 0.90, GBP: 0.77, JPY: 151.2 },
                        ]}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="USD" stroke="#3b82f6" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="EUR" stroke="#14b8a6" />
                        <Line type="monotone" dataKey="GBP" stroke="#a855f7" />
                        <Line type="monotone" dataKey="JPY" stroke="#f59e0b" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
