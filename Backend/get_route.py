import networkx as nx
import osmnx as ox
import math
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def calculate_bearing(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    y = math.sin(dlon) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    bearing = math.atan2(y, x)
    return math.degrees(bearing)

def get_turn_direction(bearing1, bearing2):
    angle = (bearing2 - bearing1 + 180) % 360 - 180
    if -15 <= angle <= 15:
        return "Continue straight"
    elif 15 < angle <= 75:
        return "Turn slight right"
    elif 75 < angle <= 105:
        return "Turn right"
    elif 105 < angle <= 165:
        return "Turn sharp right"
    elif angle > 165 or angle < -165:
        return "Make a U-turn"
    elif -165 <= angle < -105:
        return "Turn sharp left"
    elif -105 <= angle < -75:
        return "Turn left"
    elif -75 <= angle < -15:
        return "Turn slight left"

def generate_navigation_instructions(G, path):
    instructions = []
    total_distance = 0
    
    if len(path) < 2:
        return instructions, total_distance
    
    # Get coordinates for each node in the path
    coords = []
    for node in path:
        lat = G.nodes[node]['y']
        lon = G.nodes[node]['x']
        coords.append((lat, lon))
    
    previous_bearing = None
    segment_distance = 0
    current_instruction = "Start your journey"
    
    for i in range(len(path) - 1):
        # Calculate distance for this segment
        edge_data = G.get_edge_data(path[i], path[i + 1])
        if edge_data:
            edge_info = list(edge_data.values())[0]
            distance = edge_info.get('length', 0)
            segment_distance += distance
            total_distance += distance
        
        # Calculate bearing for this segment
        if i < len(coords) - 1:
            bearing = calculate_bearing(coords[i][0], coords[i][1], 
                                     coords[i + 1][0], coords[i + 1][1])
            
            if previous_bearing is not None:
                turn_direction = get_turn_direction(previous_bearing, bearing)
                
                if "Continue straight" not in turn_direction:
                    if segment_distance > 0:
                        instructions.append({
                            "instruction": current_instruction,
                            "distance": round(segment_distance),
                            "distance_text": f"{round(segment_distance)} meters"
                        })
                    current_instruction = turn_direction
                    segment_distance = distance
                    
            previous_bearing = bearing
    
    # Add the final instruction
    if segment_distance > 0:
        instructions.append({
            "instruction": current_instruction,
            "distance": round(segment_distance),
            "distance_text": f"{round(segment_distance)} meters"
        })
    
    instructions.append({
        "instruction": "You have arrived at your destination",
        "distance": 0,
        "distance_text": ""
    })
    
    return instructions, total_distance

@app.get("/route")
async def get_route(
    start_lat: float = Query(..., description="Starting latitude"),
    start_lng: float = Query(..., description="Starting longitude"), 
    end_lat: float = Query(..., description="Ending latitude"),
    end_lng: float = Query(..., description="Ending longitude")
):
    """Get route with turn-by-turn navigation instructions"""
    try:
        G = ox.graph_from_xml("map.osm")

        # Convert coords to nearest graph nodes
        start_node = ox.nearest_nodes(G, X=start_lng, Y=start_lat)
        end_node = ox.nearest_nodes(G, X=end_lng, Y=end_lat)

        # Compute shortest path
        path = nx.shortest_path(G, source=start_node, target=end_node, weight="length")
        
        # Generate navigation instructions
        instructions, total_distance = generate_navigation_instructions(G, path)
        
        # Get path coordinates for frontend mapping
        path_coordinates = []
        for node in path:
            lat = G.nodes[node]['y']
            lng = G.nodes[node]['x']
            path_coordinates.append({"lat": lat, "lng": lng})
        
        return {
            "success": True,
            "route": {
                "start": {"lat": start_lat, "lng": start_lng},
                "end": {"lat": end_lat, "lng": end_lng},
                "total_distance": round(total_distance),
                "estimated_time_minutes": round(total_distance / 80, 1),
                "instructions": instructions,
                "path_coordinates": path_coordinates
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/")
async def root():
    """Test endpoint"""
    return {"message": "Campus Route API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    # fig, ax = ox.plot_graph_route(
    #     G,
    #     path,
    #     route_color="green",
    #     node_size=0,
    #     show=True,
    #     close=True
    # )