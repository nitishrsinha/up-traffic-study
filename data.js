// Traffic Route Data (from parsed text)
const trafficData = [
  { "id": 18, "path_nodes": [17, 26, 30, 20, 19, 18], "count": 96, "desc": "Pineway Cross-Town Westbound" },
  { "id": 21, "path_nodes": [18, 19, 20, 30, 15], "count": 85, "desc": "Pineway to Queens Chapel" },
  { "id": 24, "path_nodes": [15, 26, 30, 20, 19, 18], "count": 82, "desc": "Queens Chapel to Pineway Eastbound" },
  { "id": 19, "path_nodes": [4, 23, 24, 25, 30, 26, 17], "count": 71, "desc": "Adelphi to Route 1 via Cut-through" },
  { "id": 17, "path_nodes": [18, 19, 20, 30, 26, 17], "count": 59, "desc": "Pineway Full Length Westbound" },
  { "id": 36, "path_nodes": [7, 11], "count": 36, "desc": "East Side Cut-through" },
  { "id": 20, "path_nodes": [17, 26, 30, 25, 24, 23, 4], "count": 31, "desc": "Reverse Adelphi Cut-through" },
  { "id": 25, "path_nodes": [18, 19, 20, 30, 26, 16], "count": 30, "desc": "Pineway Variation" },
  { "id": 37, "path_nodes": [17, 26, 30, 25, 24, 3], "count": 30, "desc": "Complex Internal Route" },
  { "id": 53, "path_nodes": [7, 9], "count": 26, "desc": "East Border Short" },
  { "id": 32, "path_nodes": [5, 28, 27, 13], "count": 21, "desc": "Exit to Adelphi via Tuckerman" },
  { "id": 28, "path_nodes": [5, 28, 27, 15], "count": 20, "desc": "Exit to Queens Chapel" },
  { "id": 26, "path_nodes": [16, 26, 30, 20, 19, 18], "count": 19, "desc": "Internal Westbound" },
  { "id": 31, "path_nodes": [13, 27, 28, 5], "count": 18, "desc": "Entry from Adelphi" },
  { "id": 34, "path_nodes": [5, 28, 10], "count": 18, "desc": "North Exit" },
  { "id": 52, "path_nodes": [9, 7], "count": 18, "desc": "East Border Reverse" },
  { "id": 11, "path_nodes": [6, 29, 5], "count": 16, "desc": "Sheridan Cut-through" },
  { "id": 30, "path_nodes": [5, 28, 27, 14], "count": 11, "desc": "Exit Variation" },
  { "id": 33, "path_nodes": [10, 28, 5], "count": 11, "desc": "North Entry" },
  { "id": 23, "path_nodes": [18, 19, 20, 30, 26, 15], "count": 9, "desc": "Pineway to Queens Chapel 2" },
  { "id": 3, "path_nodes": [9, 29, 5], "count": 8, "desc": "East Entry to Center" },
  { "id": 39, "path_nodes": [15, 26, 30, 25, 24, 3], "count": 8, "desc": "Queens Chapel Internal" },
  { "id": 2, "path_nodes": [5, 28, 11], "count": 6, "desc": "Center to East" },
  { "id": 7, "path_nodes": [7, 29, 5], "count": 6, "desc": "East to Center" },
  { "id": 9, "path_nodes": [6, 28, 5], "count": 5, "desc": "North-East Entry" },
  { "id": 12, "path_nodes": [5, 29, 6], "count": 5, "desc": "Center to North-East" },
  { "id": 14, "path_nodes": [4, 23, 3, 22, 21, 1], "count": 5, "desc": "Long Internal Loop" },
  { "id": 4, "path_nodes": [5, 29, 9], "count": 4, "desc": "Center to East 2" },
  { "id": 29, "path_nodes": [14, 27, 28, 5], "count": 4, "desc": "Entry Variation" },
  { "id": 51, "path_nodes": [2, 22, 24, 27, 13], "count": 3, "desc": "South to Adelphi" },
  { "id": 8, "path_nodes": [5, 29, 7], "count": 2, "desc": "Center to East 3" },
  { "id": 13, "path_nodes": [1, 21, 22, 3, 23, 4], "count": 2, "desc": "Reverse Long Loop" },
  { "id": 15, "path_nodes": [2, 22, 3, 23, 4], "count": 2, "desc": "South to West" },
  { "id": 35, "path_nodes": [11, 7], "count": 2, "desc": "East Side Short" },
  { "id": 1, "path_nodes": [11, 28, 5], "count": 1, "desc": "East Entry to Center 2" },
  { "id": 5, "path_nodes": [7, 28, 5], "count": 1, "desc": "East Entry to Center 3" },
  { "id": 42, "path_nodes": [17, 26, 30, 25, 24, 22, 2], "count": 1, "desc": "West to South" },
  { "id": 47, "path_nodes": [2, 22, 24, 25, 30, 26, 17], "count": 1, "desc": "South to West 2" }
];

// University Park, MD Coordinates - V24 FINAL
// User-aligned using PDF + OSM street names
// Fixed Int 7 position on MD 410

const intersectionCoords = {
    // --- WEST EDGE (Adelphi Rd) ---
    1:  [38.9751, -76.9481],
    2:  [38.9755, -76.9518],
    3:  [38.9746, -76.9500],
    4:  [38.9712, -76.9491],
    5:  [38.9684, -76.9487],

    // --- BOTTOM EDGE (MD 410) ---
    6:  [38.9664, -76.9435],
    7:  [38.9656, -76.9415],
    8:  [38.9649, -76.9393],

    // --- RIGHT EDGE (Route 1 / Baltimore Ave) ---
    9:  [38.9659, -76.9391],
    10: [38.9667, -76.9390],
    11: [38.9670, -76.9388],
    12: [38.9676, -76.9387],
    13: [38.9686, -76.9387],
    14: [38.9695, -76.9385],
    15: [38.9728, -76.9380],
    16: [38.9739, -76.9380],
    17: [38.9763, -76.9379],

    // --- TOP EDGE (Wells Pkwy) ---
    18: [38.9785, -76.9517],
    19: [38.9777, -76.9486],
    20: [38.9773, -76.9473],

    // --- INTERNAL ---
    21: [38.9776, -76.9522],
    22: [38.9758, -76.9509],
    23: [38.9723, -76.9484],
    24: [38.9745, -76.9454],
    25: [38.9755, -76.9444],
    26: [38.9756, -76.9411],
    27: [38.9704, -76.9422],
    28: [38.9685, -76.9452],
    29: [38.9673, -76.9470],
    30: [38.9755, -76.9421],
};
