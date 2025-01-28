import React, { useState } from "react";
import { Wrapper } from "../Wrapper";
import { FaRobot, FaFlag, FaRedo, FaArrowRight, FaArrowLeft } from "react-icons/fa";

const GRID_SIZE = 20;

export const Algorithm = () => {
  const [grid, setGrid] = useState(createInitialGrid());
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0 });
  const [obstacles, setObstacles] = useState(new Map());
  const [path, setPath] = useState<string[]>([]); // Store the calculated path
  const [maxSteps, setMaxSteps] = useState(0); // Total steps for the Hamiltonian path
  const [steps, setSteps] = useState(0); // Track the current step
  const [simulationStarted, setSimulationStarted] = useState(false);

  function createInitialGrid() {
    return Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));
  }

  const resetGrid = () => {
    setGrid(createInitialGrid());
    setRobotPosition({ x: 0, y: 0 });
    setObstacles(new Map());
    setSteps(0);
    setSimulationStarted(false);
    setPath([]);
    setMaxSteps(0);
  };

  const renderGrid = () => {
    return grid.map((row, i) => (
      <div key={i} className="flex">
        {row.map((_, j) => {
          const isRobot =
            GRID_SIZE - i - 1 >= robotPosition.y &&
            GRID_SIZE - i - 1 < robotPosition.y + 3 &&
            j >= robotPosition.x &&
            j < robotPosition.x + 3;

          const obstacleDirection = obstacles.get(`${i},${j}`);

          let borderClass = "";
          let obstacleClass = "";

          if (obstacleDirection) {
            obstacleClass = "bg-red-500";
          }

          return (
            <div
              key={j}
              className={`w-8 h-8 border border-blue-800 ${borderClass} ${obstacleClass} ${
                isRobot ? "bg-teal-300" : "bg-gray-100"
              }`}
            ></div>
          );
        })}
      </div>
    ));
  };

  const addObstacle = (x: number, y: number, direction: string) => {
    if (x < 1 || x >= GRID_SIZE - 1 || y < 1 || y >= GRID_SIZE - 1) {
      alert("Cannot place an obstacle near the grid's edges due to its virtual 3x3 boundary.");
      return;
    }

    const adjustedY = GRID_SIZE - y - 1;
    const centerKey = `${adjustedY},${x}`;
    const newObstacles = new Map(obstacles);

    newObstacles.set(centerKey, direction); // Add the obstacle to the map
    setObstacles(newObstacles);
  };

  const startSimulation = async () => {
    if (obstacles.size === 0) {
      alert("Please add at least one obstacle before starting the simulation.");
      return;
    }

    const obstacleList = Array.from(obstacles.entries())
      .filter(([_, direction]) => direction !== "VIRTUAL")
      .map(([key, direction]) => {
        const [y, x] = key.split(",").map(Number);
        return { position: `${String.fromCharCode(65 + x)}-${GRID_SIZE - y - 1}`, direction };
      });

    try {
      const response = await fetch("http://127.0.0.1:8000/compute-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obstacleList),
      });

      if (!response.ok) throw new Error("Failed to fetch path from backend");

      const data = await response.json();
      setPath(data.path); // Store the path from backend
      setMaxSteps(data.path.length - 1); // Set max steps based on the path length
      setSimulationStarted(true);
    } catch (error) {
      console.error(error);
      alert("An error occurred while computing the path.");
    }
  };

  const navigateStep = (direction: "increment" | "decrement") => {
    if (direction === "increment" && steps < maxSteps) {
      const nextPosition = path[steps + 1];
      const [x, y] = nextPosition
        .split("-")
        .map((val, idx) => (idx === 0 ? val.charCodeAt(0) - 65 : Number(val)));

      setRobotPosition({ x, y });
      setSteps((prev) => prev + 1);
    } else if (direction === "decrement" && steps > 0) {
      const prevPosition = path[steps - 1];
      const [x, y] = prevPosition
        .split("-")
        .map((val, idx) => (idx === 0 ? val.charCodeAt(0) - 65 : Number(val)));

      setRobotPosition({ x, y });
      setSteps((prev) => prev - 1);
    }
  };

  return (
    <Wrapper title="Algorithm Simulator">
      <div className="flex items-start justify-center min-h-screen mt-8">
        <div className="flex">
          <div className="flex flex-col">
            <div className="flex flex-col">{renderGrid()}</div>
          </div>

          <div className="w-8"></div>

          {/* Input Section */}
          <div className="border-2 border-blue-900 p-4 rounded bg-gray-50 shadow-lg w-72 self-start">
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
                  <option value="N">N</option>
                  <option value="S">S</option>
                  <option value="E">E</option>
                  <option value="W">W</option>
                </select>
              </div>
              <button
   className="text-gray-900 bg-[#F7BE38] hover:bg-[#F7BE38]/90 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center space-x-2"  onClick={() => {
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
className="text-gray-900 bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center space-x-2"                onClick={startSimulation}
              >
                <FaRobot className="w-4 h-4" />
                  <span>Start Simulation</span>
              </button>
            </div>


  <div className="mt-6"></div>

            {/* Progress Bar */}
            <div className="relative flex items-center justify-center">
              <svg className="rotate-[135deg] size-full" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-blue-400"
                  strokeWidth="3"
                  strokeDasharray={`${(steps / maxSteps) * 100}, 100`}
                />
              </svg>
              <div className="absolute text-center text-4xl font-bold">{steps} / {maxSteps}</div>

              <div className="absolute text-center text-base font-semibold mt-20">Steps</div>
            </div>

            <div className="flex justify-center space-x-10 mt-4">
              <button
                className={`w-16 h-16 bg-[#003366] text-white rounded-full flex items-center justify-center  ${
                  steps === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => navigateStep("decrement")}
                disabled={steps === 0}
              >
                <FaArrowLeft className="w-6 h-6" />
              </button>
              <button
                className={`w-16 h-16 bg-[#003366] text-white rounded-full flex items-center justify-center ${
                  steps === maxSteps ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => navigateStep("increment")}
                disabled={steps === maxSteps}
              >
                <FaArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          

          <div className="w-8"></div>

          
        </div>
      </div>
    </Wrapper>
  );
};
