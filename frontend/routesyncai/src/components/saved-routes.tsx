"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Navigation, Clock, DollarSign, Trash2, RefreshCw, Plane, Ship, Truck, Map } from 'lucide-react';
import { getSavedRoutes, deleteSavedRoute, SavedRoute } from '@/services/saved-routes';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SavedRoutes() {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSavedRoutes();
      setRoutes(data);
    } catch (err) {
      // Check if the error is an unauthorized error
      const errorMessage = err instanceof Error ? err.message : 'Failed to load saved routes';
      setError(errorMessage.includes('Unauthorized') || errorMessage.includes('Authentication required') ? 
        'You need to sign in to view your saved routes.' : errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteSavedRoute(id);
      setRoutes(routes.filter(route => route.id !== id));
      toast({
        title: 'Route deleted',
        description: 'The route has been successfully deleted',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete the route',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUseRoute = (route: SavedRoute) => {
    // Go to the route planner page and pre-fill with the saved route data
    router.push(`/new?start=${route.start}&goal=${route.goal}`);
  };

  const getTransportModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'air':
        return <Plane className="h-3 w-3" />;
      case 'sea':
        return <Ship className="h-3 w-3" />;
      case 'land':
        return <Truck className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Helper to get unique transport modes from route data
  const getTransportModes = (route: SavedRoute) => {
    if (!route.routeData || !route.routeData.paths || !Array.isArray(route.routeData.paths)) {
      return [];
    }
    
    // Get first path for simplicity
    const firstPath = route.routeData.paths[0];
    if (!firstPath || !firstPath.edges) return [];
    
    // Extract unique modes
    const modes = new Set<string>();
    firstPath.edges.forEach(edge => {
      if (edge.mode) modes.add(edge.mode);
    });
    
    return Array.from(modes);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sky-400">Saved Routes</CardTitle>
          <CardDescription className="text-slate-400">Loading your saved routes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-sky-400 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sky-400">Saved Routes</CardTitle>
          <CardDescription className="text-slate-400">Your previously saved routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-lg">
            {error}
            {error.includes('sign in') && (
              <div className="mt-4">
                <Button onClick={() => router.push('/sign-in')} className="bg-red-500 hover:bg-red-600">
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sky-400">Saved Routes</CardTitle>
          <CardDescription className="text-slate-400">Your previously saved routes</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRoutes} className="border-sky-500 text-sky-400">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {routes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Map className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <p className="mb-4">You haven't saved any routes yet.</p>
            <Button onClick={() => router.push('/new')} className="bg-sky-600 hover:bg-sky-700">
              Create a New Route
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {routes.map((route) => {
              const routeData = route.routeData;
              const firstPath = Array.isArray(routeData.paths) ? routeData.paths[0] : null;
              const modes = getTransportModes(route);
              
              return (
                <Card key={route.id} className="bg-slate-900 border-slate-700 overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white text-lg">{route.name}</CardTitle>
                      <div className="flex space-x-1">
                        {modes.map(mode => (
                          <Badge key={mode} variant="outline" className="bg-slate-800 text-xs flex items-center gap-1">
                            {getTransportModeIcon(mode)}
                            {mode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <CardDescription className="text-slate-400">
                      {route.description || `Route from ${route.start} to ${route.goal}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Navigation className="h-3 w-3 text-slate-400" />
                        <span>
                          {route.start} → {route.goal}
                        </span>
                      </div>
                      {firstPath && (
                        <>
                          <div className="flex items-center gap-1 text-slate-300">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{Math.round(firstPath.time_sum)} hrs</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-300">
                            <DollarSign className="h-3 w-3 text-slate-400" />
                            <span>${Math.round(firstPath.price_sum)}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      Saved on {formatDate(route.createdAt)}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUseRoute(route)}
                      className="text-sky-400 border-sky-500/50"
                    >
                      Use This Route
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-400 border-red-500/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-red-400">Delete Route</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Are you sure you want to delete this saved route? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="ghost"
                            className="text-slate-400"
                            onClick={() => {}}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(route.id)}
                            disabled={isDeleting === route.id}
                          >
                            {isDeleting === route.id ? 'Deleting...' : 'Delete Route'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 