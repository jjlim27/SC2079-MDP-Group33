import React, { useState } from "react";

interface MenuProps {
  selectedMenu: Menu;
  setSelectedMenu: React.Dispatch<React.SetStateAction<Menu>>;
}

export const MenuSelector = (props: MenuProps) => {
  const { selectedMenu, setSelectedMenu } = props;

  const getDescription = (menu: Menu) => {
    switch (menu) {
      case Menu.Algorithm:
        return (
          <p className="leading-relaxed mb-3">
            This is the simulator for the first task of MDP. Specifically, the first task involves 4-8 obstacles, each measuring 10cm x 10cm x 20cm (W x L x H), placed in a 2m x 2m area. The goal is to guide the robot to each symbol card and successfully recognize it in the shortest possible time.
          </p>
        );
      case Menu.Symbol_Recognition:
        return (
          <p className="leading-relaxed mb-3">
            In this task, the robot must recognize different symbols. The obstacles are placed in various positions and the robot must navigate to each one, identifying the correct symbol attached to it.
          </p>
        );
      case Menu.Raspberry_Pi:
        return (
          <p className="leading-relaxed mb-3">
            This feature involves integrating the system with Raspberry Pi for real-time processing. It handles communication and control of the robot, ensuring that the navigation is precise and efficient.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container px-5 py-24 mx-auto">
      <div className="flex flex-wrap -m-4">
        {AppFeatures.map((currentMenu) => (
          <div key={currentMenu} className="p-4 md:w-1/3">
            <div
              className={`h-full border-2 ${
                selectedMenu === currentMenu
                  ? "bg-blue-200 border-indigo-500 relative"
                  : "border-grey-500"
              } border-opacity-60 rounded-lg overflow-hidden cursor-pointer`}
              onClick={() => setSelectedMenu(currentMenu)}
            >
              {selectedMenu === currentMenu && (
                <span className="absolute top-2 left-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
              )}

              <img
                className="lg:h-48 md:h-36 w-full object-cover object-center"
                src="https://dummyimage.com/720x400"
                alt="blog"
              />
              <div className="p-6">
                <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">
                  CATEGORY
                </h2>
                <h1 className="title-font text-lg font-medium text-gray-900 mb-3">
                  {currentMenu}
                </h1>
                {getDescription(currentMenu)}

                <div className="flex items-center flex-wrap">
                  <a className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0">
                    Learn More
                    <svg
                      className="w-4 h-4 ml-2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export enum Menu {
  Algorithm = "Algorithm",
  Symbol_Recognition = "Symbol Recognition",
  Raspberry_Pi = "Raspberry Pi",
}

const AppFeatures = [
  Menu.Algorithm,
  Menu.Symbol_Recognition,
  Menu.Raspberry_Pi,
];
