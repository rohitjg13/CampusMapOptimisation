import osmnx as ox
place = "Shiv Nadar University"
G = ox.graph_from_place(place, network_type='walk')
ox.save_graphml(G, "campus.graphml")
