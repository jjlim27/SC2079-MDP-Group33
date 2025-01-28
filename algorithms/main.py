import math
import heapq
import string
from itertools import permutations
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Tuple
from fastapi.middleware.cors import CORSMiddleware

# Define the FastAPI app
app = FastAPI()

# Define the obstacle schema
class Obstacle(BaseModel):
    position: str
    direction: str

class PathResponse(BaseModel):
    path: List[str]
    cost: float


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)
    


def get_manhattan_distance(node_coord, destination_coord): #heuristic function
    ##TO EDIT
    dist = abs(destination_coord[0] - node_coord[0]) + abs(destination_coord[1] - node_coord[1])
    return dist

def reconstruct_graph(source, destination, parent):

    reconstructed_graph = []
    prev_node = destination #trace back from last node

    while prev_node != source:
        reconstructed_graph.append(prev_node)
        prev_node = parent[prev_node] #find previous using parent
    reconstructed_graph.append(source)

    reconstructed_graph = reconstructed_graph[::-1] #reverse order so that path is from src to destination
    
    return reconstructed_graph

def a_star_search(graph, coordinates, source, destination):
    g_score = {}
    parent = {} #keep track of parent node of each node
    
    for key, _ in graph.items():
        g_score[key] = math.inf
        parent[key] = ""
        
    g_score[source] = 0
    explored = set()
    heap = []
    # Push the source and its distance to the min heap or priority queue.
    heapq.heappush(heap, (0, source))
        
    while heap:
        _, node = heapq.heappop(heap)
        if node == destination:
            reconstructed_graph = reconstruct_graph(source, destination, parent)
            return reconstructed_graph, g_score[node]
        
        if node in explored:
            continue
        explored.add(node)
        
        for connected_node, cost in graph[node]:
            if connected_node in explored:
                continue
            
            g_cost = g_score[node] + cost # cost from the source node to current connected node
            h_cost = get_manhattan_distance(coordinates[connected_node], coordinates[destination])
            f_cost = g_cost + h_cost
            
            if g_cost < g_score[connected_node]:
                g_score[connected_node] = g_cost
                parent[connected_node] = node
                heapq.heappush(heap, (f_cost, connected_node)) 
                
    return None

def exhaustive_a_star_search(graph, coordinates, obstacles):
    min_total_g_score = math.inf
    best_path = []
    goal_permutations = permutate_goals(obstacles)
    
    for permutation in goal_permutations:
        print("-------------------------------")
        print("For permutation",  permutation)
        
        complete_path, total_g_score = a_star_search(graph, coordinates, 'A-0', permutation[0])
        print("g-score from node {source} to node {destination} is: {g_score}".format(
                source="A-0", destination=permutation[0], g_score=total_g_score))
        print("updated g-score: ", total_g_score)
        print("updated path: ", complete_path)
        
        for i in range(len(permutation)-1):
            partial_path, g_score = a_star_search(graph, coordinates, permutation[i], permutation[i+1])
            print("g-score from node {source} to node {destination} is: {g_score}".format(
                source=permutation[i], destination=permutation[i+1], g_score=g_score))
            
            total_g_score += g_score
            print("updated g-score: ", total_g_score)
            
            complete_path += partial_path
            print("updated path: ", complete_path)
        
        if total_g_score < min_total_g_score:
            min_total_g_score = total_g_score
            best_path = complete_path
    
    print("********************")
    print("best path:", best_path)
    print("min total g-score:", min_total_g_score)
    return best_path, min_total_g_score

def get_x_coordinate(coordinate): #get int x-coordinate from string coordinate
    x_coordinate = string.ascii_uppercase.index(coordinate[0])
    return x_coordinate

def get_y_coordinate(coordinate): #get int y-coordinate from string coordinate
    y_coordinate = int(coordinate[2:])
    return y_coordinate

def get_alphanumeric_coordinates(x, y): #convert to alphanumeric coordinates
    alphanumeric_coordinate = '{alphabet}-{number}'.format(
        alphabet=string.ascii_uppercase[x],
        number=y)
    return alphanumeric_coordinate

def get_coordinates():
    coordinates = {}
    for i in range(20):
        for j in range(20):
            coordinates[get_alphanumeric_coordinates(i, j)] = (i, j)
    return coordinates

def get_default_graph():
    
    graph = {}
    DISTANCE = 10
    
    for i in range(20):
        for j in range(20):
            adjacent_coordinates = []
            if i!=0: #if not left edge, add left adjacent to list
                adajcent_coordinate = get_alphanumeric_coordinates(i-1, j)
                adjacent_coordinates.append((adajcent_coordinate, DISTANCE))
            if i!=19: #if not right edge, add right adjacent to list
                adajcent_coordinate = get_alphanumeric_coordinates(i+1, j)
                adjacent_coordinates.append((adajcent_coordinate, DISTANCE))
            if j!=0: #if not bottom edge, add bottom adjacent to list
                adajcent_coordinate = get_alphanumeric_coordinates(i, j-1)
                adjacent_coordinates.append((adajcent_coordinate, DISTANCE))
            if j!=19: #if not top edge, add top adjacent to list
                adajcent_coordinate = get_alphanumeric_coordinates(i, j+1)
                adjacent_coordinates.append((adajcent_coordinate, DISTANCE))
            
            graph[get_alphanumeric_coordinates(i, j)] = adjacent_coordinates
            
    return graph

def get_virtual_boundary(obstacles): #add virtual boundary of 50x50cm surrounding each obstacle

    boundary = [] #nodes to remove from graph
    
    for obstacle in obstacles:

        obstacle_coordinate = obstacle[0]
        x_coordinate = get_x_coordinate(obstacle_coordinate)
        y_coordinate = get_y_coordinate(obstacle_coordinate)

        left_bounds = x_coordinate - 2
        right_bounds = x_coordinate + 2
        top_bounds = y_coordinate + 2
        bottom_bounds = y_coordinate - 2
        
        for i in range(left_bounds, right_bounds+1):
            for j in range(bottom_bounds, top_bounds+1):
                if i>=0 and i<=19 and j>=0 and j<=19:
                    coordinate_to_remove = string.ascii_uppercase[i] + "-" + str(j)
                    boundary.append(coordinate_to_remove)
        
    return boundary

def get_goals(obstacles):
    goals = []
    
    #assume goal is node 30cm away from obstacle in the opposite direction
    for obstacle in obstacles:
        
        direction = obstacle[1]
        obstacle_x = get_x_coordinate(obstacle[0])
        obstacle_y = get_y_coordinate(obstacle[0])
        
        if direction == "N": #goal is 30cm above obstacle
            goal_x = obstacle_x
            goal_y = obstacle_y + 3
        elif direction == "S": #goal is 30cm below obstacle
            goal_x = obstacle_x
            goal_y = obstacle_y - 3
        elif direction == "E": #goal is 30cm right of obstacle
            goal_x = obstacle_x + 3
            goal_y = obstacle_y
        elif direction == "W": #goal is 30cm right of obstacle
            goal_x = obstacle_x - 3
            goal_y = obstacle_y
            
        goal = get_alphanumeric_coordinates(goal_x, goal_y)
        goals.append(goal)
        
    return goals

def create_graph(obstacles):
    default_graph = get_default_graph()
    boundaries = get_virtual_boundary(obstacles)
    
    for boundary in boundaries: #remove boundary nodes from graph keys
        default_graph.pop(boundary, None)
        
    for node, adjacent_nodes in default_graph.items(): #remove boundary nodes from adjacency list
        for boundary in boundaries:
            for adjacent_node in adjacent_nodes:
                if boundary == adjacent_node[0]:
                    adjacent_nodes.remove(adjacent_node)
        default_graph[node] = adjacent_nodes
        
    return default_graph

def permutate_goals(obstacles):
    goals = get_goals(obstacles)
    permutated_goals = permutations(goals)
    return [list(p) for p in permutated_goals]

OBSTACLES = [('B-7', 'E'), ('K-10', 'W'), ('K-19', 'S')]
GRAPH = create_graph(OBSTACLES)
COORDINATES = get_coordinates()

print(exhaustive_a_star_search(GRAPH, COORDINATES, OBSTACLES))


@app.post("/compute-path", response_model=PathResponse)
def compute_path(obstacles: List[Obstacle]):
    # Convert obstacles into the format your functions need
    obstacles_data = [(obs.position, obs.direction) for obs in obstacles]

    # Generate graph and coordinates
    graph = create_graph(obstacles_data)
    coordinates = get_coordinates()

    # Compute the best path and cost
    best_path, min_cost = exhaustive_a_star_search(graph, coordinates, obstacles_data)

    # Return the path and cost
    return {"path": best_path, "cost": min_cost}