import React, { useState } from "react";
import { Layout } from "./components/misc";
import { MenuSelector, Menu } from "./components/common";
import { Algorithm } from "./components/core/algorithm";
import { SymbolRecognition } from "./components/core/symbol_recognition";
import { RaspberryPi } from "./components/core/raspberry_pi";

function App() {
  const [selectedMenu, setSelectedMenu] = useState<Menu>(
    Menu.Algorithm
  );

  return (
    <div id="app-container" className="font-poppins"
    style={{ userSelect: "none", caretColor: "transparent" }}
>
      <Layout>
        <MenuSelector
          selectedMenu={selectedMenu}
          setSelectedMenu={setSelectedMenu}
        />

        {/* Feature-specific Content */}
        {selectedMenu === Menu.Algorithm && <Algorithm />}
        {selectedMenu === Menu.Symbol_Recognition && (
          <SymbolRecognition />
        )}
        {selectedMenu === Menu.Raspberry_Pi && <RaspberryPi />}
      </Layout>
    </div>
  );
}

export default App;