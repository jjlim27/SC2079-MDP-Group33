import React, { useState } from "react";
import { Wrapper } from "../Wrapper";
import { FaRobot, FaFlag, FaRedo, FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown } from "react-icons/fa"; // Importing icons

const GRID_SIZE = 20;
const MAX_STEPS = 10; // set 10 for now for visualisation purposes

const DIRECTIONS = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  NORTH: "N",
  SOUTH: "S",
  EAST: "E",
  WEST: "W",
};

export const Algorithm = () => {
  const [grid, setGrid] = useState(createInitialGrid());
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0 });
  const [obstacles, setObstacles] = useState(new Map());
  const [steps, setSteps] = useState(0); // Track the steps taken
  const [simulationStarted, setSimulationStarted] = useState(false); // Track if simulation has started

  function createInitialGrid() {
    return Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));
  }

  const resetGrid = () => {
    setGrid(createInitialGrid());
    setRobotPosition({ x: 0, y: 0 });
    setObstacles(new Map());
    setSteps(0); // Reset steps when grid is reset
    setSimulationStarted(false); // Reset simulation state
  };

  const renderGrid = () => {
    return grid.map((row, i) => (
      <div key={i} className="flex">
        {row.map((_, j) => {
          const isRobot =
            GRID_SIZE - i - 1 >= robotPosition.y &&
            GRID_SIZE - i - 1 < robotPosition.y + 3 && // 3x3 robot
            j >= robotPosition.x &&
            j < robotPosition.x + 3;

          const obstacleDirection = obstacles.get(`${i},${j}`);

          let borderClass = "";
          let obstacleClass = ""; 
          let pointerEventsClass = ""; 

          if (obstacleDirection) {
            if (obstacleDirection === DIRECTIONS.NORTH) {
              obstacleClass = "bg-red-500";
              borderClass = "border-t-4 border-red-900"; // Red thick border for north
            } else if (obstacleDirection === DIRECTIONS.SOUTH) {
              obstacleClass = "bg-red-500";
              borderClass = "border-b-4 border-red-900"; // Red thick border for south
            } else if (obstacleDirection === DIRECTIONS.EAST) {
              obstacleClass = "bg-red-500";
              borderClass = "border-r-4 border-red-900"; // Red thick border for east
            } else if (obstacleDirection === DIRECTIONS.WEST) {
              obstacleClass = "bg-red-500";
              borderClass = "border-l-4 border-red-900"; // Red thick border for west
            }

            pointerEventsClass = "pointer-events-none"; 
          }

          return (
            <div
              key={j}
              className={`w-8 h-8 border border-blue-800 ${borderClass} ${obstacleClass} ${pointerEventsClass} ${
                isRobot ? "bg-teal-300" : "bg-gray-100 hover:bg-gray-200"
              }`}
            ></div>
          );
        })}
      </div>
    ));
  };

  const addObstacle = (x: number, y: number, direction: string) => {
    // Check if the center of the obstacle is within the valid placement range
    if (x < 1 || x >= GRID_SIZE - 1 || y < 1 || y >= GRID_SIZE - 1) {
      alert("Cannot place an obstacle near the grid's edges due to its virtual 3x3 boundary.");
      return;
    }
  
    const adjustedY = GRID_SIZE - y - 1;
    const centerKey = `${adjustedY},${x}`;
  
    // Check if the center position is already occupied
    if (obstacles.has(centerKey)) {
      alert("An obstacle already exists at this position!");
      return;
    }
  
    // Create a 3x3 virtual block around the center obstacle
    const newObstacles = new Map(obstacles);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const newX = x + dx;
        const newY = adjustedY + dy;
        const key = `${newY},${newX}`;
  
        // Check bounds and skip if already occupied
        if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
          if (dx === 0 && dy === 0) {
            newObstacles.set(key, direction); // Center obstacle is visible
          } else {
            newObstacles.set(key, "VIRTUAL"); // Surrounding area is reserved
          }
        }
      }
    }
  
    setObstacles(newObstacles);
  };
  
  

  const startSimulation = () => {
    if (obstacles.size === 0) {
      alert("Please add at least one obstacle before starting the simulation.");
      return;
    }
  
    // Validate if obstacles are within valid bounds (0 to 19)
    obstacles.forEach((value, key) => {
      // You can access the key and value here
      console.log(key, value);
    });
  
    alert("Simulation started!");
    setSimulationStarted(true);
  };

  const incrementStep = () => {
    if (steps < MAX_STEPS) {
      setSteps(steps + 1); // Increment the step count
    }
  };

  const decrementStep = () => {
    if (steps > 0) {
      setSteps(steps - 1); // Decrease the step count
    }
  };

  const moveRobot = (direction: string) => {
    const newPosition = { ...robotPosition };
    
    switch (direction) {
      case DIRECTIONS.UP:
        if (newPosition.y < GRID_SIZE - 1) newPosition.y += 1;
        break;
      case DIRECTIONS.DOWN:
        if (newPosition.y > 0) newPosition.y -= 1;
        break;
      case DIRECTIONS.LEFT:
        if (newPosition.x > 0) newPosition.x -= 1;
        break;
      case DIRECTIONS.RIGHT:
        if (newPosition.x < GRID_SIZE - 1) newPosition.x += 1;
        break;
      default:
        break;
    }

    setRobotPosition(newPosition);
  };

 

  return (
    <Wrapper title="Algorithm Simulator">
      <div className="flex items-start justify-center min-h-screen mt-8">
        <div className="flex">
          {/* Grid Section */}
          <div className="flex flex-col">
            <div className="flex">
              {/* Vertical Axis (Y Axis) */}
              <div className="flex flex-col">
                {Array.from({ length: GRID_SIZE }, (_, i) => (
                  <div key={i} className="w-8 h-8 flex items-center justify-center font-bold">
                    {GRID_SIZE - i - 1}
                  </div>
                ))}
              </div>

              {/* The Grid */}
              <div className="flex flex-col relative z-0">
                {renderGrid()}

                {/* Horizontal Axis (X Axis) */}
                <div className="flex">
                  {Array.from({ length: GRID_SIZE }, (_, i) => (
                    <div key={i} className="w-8 h-8 flex items-center justify-center font-bold">
                      {i}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Spacing between the grid and the control panel */}
          <div className="w-8"></div>

          {/* Input Section */}
          <div className="border-2 border-blue-900 p-4 rounded bg-gray-50 shadow-lg w-72 self-start relative z-20">
            <h2 className="font-bold text-lg mb-4 text-center">Controls</h2>
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-4">
                <div className="flex space-x-2 items-center">
                  <label className="font-bold">X:</label>
                  <input
                    type="number"
                    min="0"
                    max={GRID_SIZE - 1}
                    id="obstacleX"
                    className="w-16 p-2 border rounded"
                  />
                </div>
                <div className="flex space-x-2 items-center">
                  <label className="font-bold">Y:</label>
                  <input
                    type="number"
                    min="0"
                    max={GRID_SIZE - 1}
                    id="obstacleY"
                    className="w-16 p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="font-bold">Direction:</label>
                <select id="obstacleDirection" className="p-2 border rounded">
                  <option value={DIRECTIONS.NORTH}>N</option>
                  <option value={DIRECTIONS.SOUTH}>S</option>
                  <option value={DIRECTIONS.EAST}>E</option>
                  <option value={DIRECTIONS.WEST}>W</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex flex-col space-y-2">
                <button
                  className="text-gray-900 bg-[#F7BE38] hover:bg-[#F7BE38]/90 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center space-x-2"
                  onClick={() => {
                    const x = parseInt((document.getElementById("obstacleX") as HTMLInputElement).value);
                    const y = parseInt((document.getElementById("obstacleY") as HTMLInputElement).value);
                    const direction = (document.getElementById("obstacleDirection") as HTMLSelectElement).value;
                    addObstacle(x, y, direction);
                  }}
                >
                  <FaFlag className="w-4 h-4" />
                  <span>Add Obstacle</span>
                </button>
                <button
                  className="text-gray-900 bg-[#F44336] hover:bg-[#F44336]/90 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center space-x-2"
                  onClick={resetGrid}
                >
                  <FaRedo className="w-4 h-4" />
                  <span>Reset Grid</span>
                </button>
                <button
                  className="text-gray-900 bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center space-x-2"
                  onClick={startSimulation}
                >
                  <FaRobot className="w-4 h-4" />
                  <span>Start Simulation</span>
                </button>
                </div>
                {/* Step Progress Bar */}
                <div className="relative flex items-center justify-center z-10" >
                <svg className="rotate-[135deg] size-full" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    {/* Background Circle (Gauge) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="stroke-gray-200"
                      strokeWidth="3"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="stroke-blue-400"
                      strokeWidth="3"
                      strokeDasharray={`${(steps / MAX_STEPS) * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute text-center text-4xl font-bold">{steps} / {MAX_STEPS}</div>
                  <div className="absolute text-center text-base font-semibold mt-20">Steps</div>
                </div>

              

                {/* Left and Right Buttons */}
                <div className="flex justify-center space-x-10">
                  {/* Increment Step Button */}
                  <button
                    className={`w-16 h-16 bg-[#003366] text-white rounded-full flex items-center justify-center hover:bg-[#00244d] focus:outline-none ${
                      steps === 0 || !simulationStarted ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={decrementStep}
                    disabled={steps === 0 || !simulationStarted} // Disable if steps are 0 or simulation not started
                  >
                    <FaArrowLeft className="w-6 h-6" />
                  </button>

                  {/* Decrement Step Button */}
                  <button
                    className={`w-16 h-16 bg-[#003366] text-white rounded-full flex items-center justify-center hover:bg-[#00244d] focus:outline-none ${
                      steps === MAX_STEPS || !simulationStarted ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={incrementStep}
                    disabled={steps === MAX_STEPS || !simulationStarted} // Disable if steps are 10 or simulation not started
                  >
                    <FaArrowRight className="w-6 h-6" />
                  </button>
                  
                </div>
            </div>
          </div>

          {/* Spacing between the grid and the control panel */}
          <div className="w-5"></div>

          <div className="border-2 border-blue-900 p-4 rounded bg-gray-50 shadow-lg w-40 self-start relative z-20">
            <h2 className="font-bold text-lg mb-4 text-center">Controls</h2>
            <div className="flex flex-col space-y-4">
            <div className="flex justify-center space-x-4">
                <button
                  className="w-10 h-10  bg-[#003366] text-white rounded-full flex items-center justify-center hover:bg-[#00244d] focus:outline-none"
                  onClick={() => moveRobot(DIRECTIONS.UP)}
                >
                  <FaArrowUp className="w-6 h-6" />
                </button>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  className="w-10 h-10  bg-[#003366] text-white rounded-full flex items-center justify-center hover:bg-[#00244d] focus:outline-none"
                  onClick={() => moveRobot(DIRECTIONS.LEFT)}
                >
                  <FaArrowLeft className="w-6 h-6" />
                </button>
                <button
                  className="w-10 h-10  bg-[#003366] text-white rounded-full flex items-center justify-center hover:bg-[#00244d] focus:outline-none"
                  onClick={() => moveRobot(DIRECTIONS.RIGHT)}
                >
                  <FaArrowRight className="w-6 h-6" />
                </button>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  className="w-10 h-10 bg-[#003366] text-white rounded-full flex items-center justify-center hover:bg-[#00244d] focus:outline-none"
                  onClick={() => moveRobot(DIRECTIONS.DOWN)}
                >
                  <FaArrowDown className="w-6 h-6" />
                </button>
              </div>
              

                            

            </div>
          </div>

        </div>

        
        
      </div>
    </Wrapper>
  );
};
