import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET handler to fetch saved routes for the current user
export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // For testing purposes - return mock data when using Clerk authentication
    // Remove this in production and use the real database query
    const mockRoutes = [
      {
        id: "1",
        name: "NYC to LA Route",
        description: "Cross-country shipping route",
        userId: userId,
        start: "New York",
        goal: "Los Angeles",
        routeData: JSON.stringify({
          avoided_countries: ["CUBA", "VENEZUELA"],
          penalty_countries: [],
          paths: [{
            path: ["New York", "Chicago", "Denver", "Los Angeles"],
            coordinates: [
              { node: "New York", latitude: 40.7128, longitude: -74.0060 },
              { node: "Chicago", latitude: 41.8781, longitude: -87.6298 },
              { node: "Denver", latitude: 39.7392, longitude: -104.9903 },
              { node: "Los Angeles", latitude: 34.0522, longitude: -118.2437 }
            ],
            edges: [
              { from: "New York", to: "Chicago", mode: "land", time: 24, price: 1200, distance: 1300 },
              { from: "Chicago", to: "Denver", mode: "land", time: 20, price: 900, distance: 1000 },
              { from: "Denver", to: "Los Angeles", mode: "land", time: 18, price: 1000, distance: 1100 }
            ],
            time_sum: 62,
            price_sum: 3100,
            distance_sum: 3400,
            CO2_sum: 340
          }]
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        name: "Shanghai to Rotterdam",
        description: "International sea route",
        userId: userId,
        start: "Shanghai",
        goal: "Rotterdam",
        routeData: JSON.stringify({
          avoided_countries: [],
          penalty_countries: [],
          paths: [{
            path: ["Shanghai", "Singapore", "Suez", "Rotterdam"],
            coordinates: [
              { node: "Shanghai", latitude: 31.2304, longitude: 121.4737 },
              { node: "Singapore", latitude: 1.3521, longitude: 103.8198 },
              { node: "Suez", latitude: 29.9668, longitude: 32.5498 },
              { node: "Rotterdam", latitude: 51.9244, longitude: 4.4777 }
            ],
            edges: [
              { from: "Shanghai", to: "Singapore", mode: "sea", time: 168, price: 5000, distance: 4900 },
              { from: "Singapore", to: "Suez", mode: "sea", time: 240, price: 7000, distance: 8700 },
              { from: "Suez", to: "Rotterdam", mode: "sea", time: 192, price: 6000, distance: 6500 }
            ],
            time_sum: 600,
            price_sum: 18000,
            distance_sum: 20100,
            CO2_sum: 201
          }]
        }),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    const routesWithParsedData = mockRoutes.map(route => ({
      ...route,
      routeData: JSON.parse(route.routeData)
    }));

    return NextResponse.json(routesWithParsedData);

    // Commented out real database query for now
    /*
    const savedRoutes = await prisma.savedRoute.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Parse the JSON string stored in routeData
    const routesWithParsedData = savedRoutes.map(route => ({
      ...route,
      routeData: JSON.parse(route.routeData)
    }));

    return NextResponse.json(routesWithParsedData);
    */
  } catch (error) {
    console.error("Error fetching saved routes:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved routes: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}

// POST handler to save a new route
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { name, description, start, goal, routeData } = await request.json();

    if (!name || !start || !goal || !routeData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For testing - return a successful mock response
    return NextResponse.json({
      id: Math.random().toString(36).substring(2, 15),
      name,
      description,
      start,
      goal,
      routeData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { status: 201 });

    // Commented out real database query for now
    /*
    // Store routeData as a JSON string
    const savedRoute = await prisma.savedRoute.create({
      data: {
        name,
        description,
        start,
        goal,
        routeData: JSON.stringify(routeData),
        userId,
      },
    });

    // Return the saved route with parsed data
    return NextResponse.json({
      ...savedRoute,
      routeData: JSON.parse(savedRoute.routeData)
    }, { status: 201 });
    */
  } catch (error) {
    console.error("Error saving route:", error);
    return NextResponse.json(
      { error: "Failed to save route: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
} 