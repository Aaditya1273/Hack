import pandas as pd
import numpy as np
import networkx as nx
import pickle
import heapq
from math import radians, sin, cos, sqrt, atan2

# Load graph
with open(r'C:\Users\joshd\Documents\Programming\IIT-B\graph_final_5.pkl', "rb") as G:
    roadsn = pickle.load(G)

# Precompute min-max normalization ranges
time_list = []
price_list = []
for u, v, data in roadsn.edges(data=True):
    time_list.append(data['time'])
    price_list.append(data['price'])

time_array = np.array(time_list)
price_array = np.array(price_list)

# Compute min and max for each attribute
time_min, time_max = time_array.min(), time_array.max()
price_min, price_max = price_array.min(), price_array.max()

# Add normalized values to edges
for u, v, data in roadsn.edges(data=True):
    data['time_norm'] = (data['time'] - time_min) / (time_max - time_min) * 100
    data['price_norm'] = (data['price'] - price_min) / (price_max - price_min) * 100
    

# Save precomputed graph
with open(r'C:\Users\joshd\Documents\Programming\IIT-B\graph_final_5_precalc.pkl', "wb") as G:
    pickle.dump(roadsn, G)


