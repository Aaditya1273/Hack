import json

# Load the JSON data
with open(r"C:\Users\Asus\Desktop\RouteSyncAI\RouteSyncAI\backend\safety_analysis\incident_counts_by_node.json", "r") as f:
    incident_counts = json.load(f)

def get_incidents_for_places(places):
    """Fetch incident data for a list of places (nodes)."""
    result = []
    for place in places:
        if place in incident_counts:
            result.append({place: incident_counts[place]})
        else:
            result.append({place: "No incident have occured"})
    return result