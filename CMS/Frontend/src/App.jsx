import React from "react";
import Navroutes from "./Routes/Navroutes";
import Navbar from "./Components/Navbar";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <div>
        <Navbar />
        <Navroutes />
      </div>
    </AuthProvider>
  );
};

export default App;
